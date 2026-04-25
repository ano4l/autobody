package com.autobody.whatsapp;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.customer.CustomerSource;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppWebhookService {

    private final CustomerRepository customerRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final BotStateService botStateService;
    private final ConversationHandler conversationHandler;
    private final WhatsAppProperties properties;
    private final WhatsAppClient whatsAppClient;

    public boolean verifySignature(String payload, String signatureHeader) {
        if (!StringUtils.hasText(properties.appSecret())) {
            log.debug("meta.whatsapp.app-secret is empty; skipping signature verification");
            return true;
        }
        if (!StringUtils.hasText(signatureHeader) || !signatureHeader.startsWith("sha256=")) {
            return false;
        }
        String expected = "sha256=" + hmacSha256Hex(payload, properties.appSecret());
        return expected.equalsIgnoreCase(signatureHeader.trim());
    }

    @Transactional
    public void processWebhook(JsonNode payload) {
        JsonNode messages = payload.path("entry").path(0).path("changes").path(0).path("value").path("messages");
        if (!messages.isArray() || messages.isEmpty()) {
            log.debug("No inbound messages in webhook payload");
            return;
        }

        for (JsonNode messageNode : messages) {
            String from = textOrNull(messageNode, "from");
            if (!StringUtils.hasText(from)) continue;

            String waMessageId = textOrNull(messageNode, "id");
            String body = textOrNull(messageNode.path("text"), "body");
            String mediaUrl = textOrNull(messageNode.path("image"), "id");
            String threadId = from;

            Customer customer = customerRepository.findByPhone(from)
                    .orElseGet(() -> customerRepository.save(Customer.builder()
                            .phone(from)
                            .source(CustomerSource.WHATSAPP)
                            .build()));

            Conversation conversation = conversationRepository.findByWaThreadId(threadId)
                    .orElseGet(() -> conversationRepository.save(Conversation.builder()
                            .customer(customer)
                            .waThreadId(threadId)
                            .status(ConversationStatus.ACTIVE)
                            .botStep(BotStep.GREETING)
                            .escalated(Boolean.FALSE)
                            .build()));

            Message inbound = Message.builder()
                    .conversation(conversation)
                    .direction(MessageDirection.INBOUND)
                    .content(body)
                    .mediaUrl(mediaUrl)
                    .waMessageId(waMessageId)
                    .build();
            messageRepository.save(inbound);

            ConversationHandler.Reply reply = conversationHandler.handle(conversation, body);

            if (reply.partRequest() != null) {
                conversation.setPartRequest(reply.partRequest());
            }
            conversation.setBotStep(reply.nextStep());
            conversation.setStatus(reply.nextStatus());
            conversation.setEscalated(reply.escalated());
            conversationRepository.save(conversation);

            botStateService.advance(from, reply.nextStep(), reply.escalated());

            whatsAppClient.sendText(from, reply.body());

            messageRepository.save(Message.builder()
                    .conversation(conversation)
                    .direction(MessageDirection.OUTBOUND)
                    .content(reply.body())
                    .build());
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        if (node == null || node.isMissingNode()) return null;
        JsonNode v = node.path(field);
        return v.isMissingNode() || v.isNull() ? null : v.asText();
    }

    private static String hmacSha256Hex(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to verify webhook signature", e);
        }
    }
}
