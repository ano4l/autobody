package com.autobody.whatsapp;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.support.AbstractPostgresIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

/**
 * End-to-end: inbound WhatsApp payload → ConversationHandler state machine → Postgres.
 * BotStateService (Redis) and WhatsAppClient (HTTP) are mocked; everything else is real.
 */
class WhatsAppWebhookServiceIT extends AbstractPostgresIntegrationTest {

    @Autowired private WhatsAppWebhookService webhookService;
    @Autowired private ConversationRepository conversationRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private PartRepository partRepository;
    @Autowired private MessageRepository messageRepository;

    @MockBean private BotStateService botStateService;
    @MockBean private WhatsAppClient whatsAppClient;

    private final ObjectMapper json = new ObjectMapper();
    private static final String PHONE = "+15551234567";

    @BeforeEach
    void cleanSlate() {
        messageRepository.deleteAll();
        conversationRepository.deleteAll();
        customerRepository.deleteAll();
        partRepository.deleteAll();
    }

    private JsonNode payload(String from, String body) {
        ObjectNode text = json.createObjectNode().put("body", body);
        ObjectNode msg = json.createObjectNode()
                .put("from", from)
                .put("id", "wamid-" + System.nanoTime());
        msg.set("text", text);
        ObjectNode value = json.createObjectNode();
        value.set("messages", json.createArrayNode().add(msg));
        ObjectNode change = json.createObjectNode();
        change.set("value", value);
        ObjectNode entry = json.createObjectNode();
        entry.set("changes", json.createArrayNode().add(change));
        ObjectNode root = json.createObjectNode();
        root.set("entry", json.createArrayNode().add(entry));
        return root;
    }

    private Conversation convoFor(String phone) {
        return conversationRepository.findByWaThreadId(phone).orElseThrow();
    }

    @Test
    @DisplayName("first message creates customer + conversation, advances to ASK_VEHICLE")
    void firstMessageBootstraps() {
        webhookService.processWebhook(payload(PHONE, "hi there"));

        Customer customer = customerRepository.findByPhone(PHONE).orElseThrow();
        assertThat(customer.getPhone()).isEqualTo(PHONE);

        Conversation convo = convoFor(PHONE);
        assertThat(convo.getBotStep()).isEqualTo(BotStep.ASK_VEHICLE);
        assertThat(convo.getStatus()).isEqualTo(ConversationStatus.ACTIVE);
        assertThat(convo.getEscalated()).isFalse();

        // one inbound + one outbound
        assertThat(messageRepository.findAll()).hasSize(2);

        verify(botStateService).advance(PHONE, BotStep.ASK_VEHICLE, false);
        verify(whatsAppClient).sendText(eq(PHONE),
                argThat(s -> s != null && s.contains("make and model")));
    }

    @Test
    @DisplayName("full happy path: greeting → vehicle → part (in stock) → YES → escalated")
    void happyPathToEscalation() {
        partRepository.save(Part.builder()
                .sku("BRK-001")
                .name("Brake Pad Set")
                .sellPrice(new BigDecimal("499.00"))
                .qtyOnHand(5)
                .active(true)
                .build());

        webhookService.processWebhook(payload(PHONE, "hello"));
        assertThat(convoFor(PHONE).getBotStep()).isEqualTo(BotStep.ASK_VEHICLE);

        webhookService.processWebhook(payload(PHONE, "Toyota Hilux 2018"));
        assertThat(convoFor(PHONE).getBotStep()).isEqualTo(BotStep.ASK_PART);

        webhookService.processWebhook(payload(PHONE, "brake pad"));
        Conversation afterPart = convoFor(PHONE);
        assertThat(afterPart.getBotStep()).isEqualTo(BotStep.PROVIDE_STOCK);
        assertThat(afterPart.getPartRequest()).isEqualTo("brake pad");

        webhookService.processWebhook(payload(PHONE, "yes"));
        Conversation afterYes = convoFor(PHONE);
        assertThat(afterYes.getBotStep()).isEqualTo(BotStep.ESCALATED);
        assertThat(afterYes.getStatus()).isEqualTo(ConversationStatus.ESCALATED);
        assertThat(afterYes.getEscalated()).isTrue();
    }

    @Test
    @DisplayName("no matches route to ESCALATION_OFFER; NO closes as RESOLVED")
    void noMatchesAndDeclineResolves() {
        webhookService.processWebhook(payload(PHONE, "hi"));
        webhookService.processWebhook(payload(PHONE, "Ford Ranger 2012"));
        webhookService.processWebhook(payload(PHONE, "obscure widget"));

        Conversation offered = convoFor(PHONE);
        assertThat(offered.getBotStep()).isEqualTo(BotStep.ESCALATION_OFFER);

        webhookService.processWebhook(payload(PHONE, "no thanks"));
        Conversation done = convoFor(PHONE);
        assertThat(done.getBotStep()).isEqualTo(BotStep.DONE);
        assertThat(done.getStatus()).isEqualTo(ConversationStatus.RESOLVED);
    }

    @Test
    @DisplayName("escalation keyword short-circuits from any step")
    void agentKeywordEscalates() {
        webhookService.processWebhook(payload(PHONE, "hi"));
        webhookService.processWebhook(payload(PHONE, "I want to speak to a human"));

        Conversation convo = convoFor(PHONE);
        assertThat(convo.getEscalated()).isTrue();
        assertThat(convo.getStatus()).isEqualTo(ConversationStatus.ESCALATED);
    }

    @Test
    @DisplayName("each inbound persists INBOUND + OUTBOUND message pair")
    void persistsBothDirections() {
        webhookService.processWebhook(payload(PHONE, "hi"));
        webhookService.processWebhook(payload(PHONE, "VW Polo 2016"));

        long inbound = messageRepository.findAll().stream()
                .filter(m -> m.getDirection() == MessageDirection.INBOUND).count();
        long outbound = messageRepository.findAll().stream()
                .filter(m -> m.getDirection() == MessageDirection.OUTBOUND).count();

        assertThat(inbound).isEqualTo(2);
        assertThat(outbound).isEqualTo(2);

        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(whatsAppClient, atLeastOnce()).sendText(anyString(), body.capture());
        assertThat(body.getAllValues()).anyMatch(s -> s.toLowerCase().contains("make and model"));
        assertThat(body.getAllValues()).anyMatch(s -> s.toLowerCase().contains("part"));
    }

}
