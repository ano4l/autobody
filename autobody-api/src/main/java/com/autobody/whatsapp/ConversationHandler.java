package com.autobody.whatsapp;

import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;

/**
 * Pure state-machine for inbound WhatsApp messages.
 *
 * Handles BotStep transitions for one message at a time. Returns the reply text
 * and the next step; callers persist the conversation and dispatch the reply.
 * Escalation keywords short-circuit the flow at any step.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationHandler {

    private static final Set<String> ESCALATION_KEYWORDS = Set.of(
            "human", "agent", "help", "person", "manager", "speak to", "talk to"
    );

    private static final Set<String> AFFIRMATIVE = Set.of(
            "yes", "y", "yeah", "yep", "ok", "okay", "sure", "please", "buy", "order"
    );

    private static final Set<String> NEGATIVE = Set.of(
            "no", "n", "nope", "cancel", "stop"
    );

    private final PartRepository partRepository;

    public Reply handle(Conversation conversation, String body) {
        String text = body == null ? "" : body.trim();
        String lower = text.toLowerCase();

        if (containsAny(lower, ESCALATION_KEYWORDS)) {
            return new Reply(
                    BotStep.ESCALATED,
                    ConversationStatus.ESCALATED,
                    true,
                    null,
                    "I'm passing you to a team member now. Someone will reply here shortly."
            );
        }

        BotStep step = conversation.getBotStep() == null ? BotStep.GREETING : conversation.getBotStep();
        return switch (step) {
            case GREETING -> handleGreeting();
            case ASK_VEHICLE -> handleAskVehicle(text);
            case ASK_PART -> handleAskPart(text);
            case PROVIDE_STOCK -> handleAfterStock(lower);
            case ESCALATION_OFFER -> handleEscalationOffer(lower);
            case ESCALATED, DONE -> new Reply(step, conversation.getStatus(), conversation.getEscalated(), null,
                    "A team member will be with you shortly.");
        };
    }

    private Reply handleGreeting() {
        return new Reply(
                BotStep.ASK_VEHICLE,
                ConversationStatus.ACTIVE,
                false,
                null,
                "Hi! Welcome to Autobody Spares. What is the make and model of your vehicle? (e.g. Toyota Hilux 2018)"
        );
    }

    private Reply handleAskVehicle(String text) {
        if (!StringUtils.hasText(text)) {
            return new Reply(BotStep.ASK_VEHICLE, ConversationStatus.ACTIVE, false, null,
                    "Please share the vehicle make and model so I can find the right part.");
        }
        return new Reply(
                BotStep.ASK_PART,
                ConversationStatus.ACTIVE,
                false,
                null,
                "Got it. What part are you looking for? You can type a name or SKU."
        );
    }

    private Reply handleAskPart(String text) {
        if (!StringUtils.hasText(text)) {
            return new Reply(BotStep.ASK_PART, ConversationStatus.ACTIVE, false, null,
                    "What part do you need? (name or SKU)");
        }

        List<Part> matches = partRepository
                .search(text, null, null, Boolean.TRUE, PageRequest.of(0, 3))
                .getContent();

        String reply = matches.isEmpty()
                ? "I couldn't find \"%s\" in stock. Want me to put you in touch with a team member to source it?".formatted(text)
                : formatMatches(matches);

        BotStep next = matches.isEmpty() ? BotStep.ESCALATION_OFFER : BotStep.PROVIDE_STOCK;
        return new Reply(next, ConversationStatus.ACTIVE, false, text, reply);
    }

    private Reply handleAfterStock(String lower) {
        if (containsAny(lower, AFFIRMATIVE)) {
            return new Reply(
                    BotStep.ESCALATED,
                    ConversationStatus.ESCALATED,
                    true,
                    null,
                    "Great — I'm connecting you with a team member to confirm the order."
            );
        }
        if (containsAny(lower, NEGATIVE)) {
            return new Reply(
                    BotStep.DONE,
                    ConversationStatus.RESOLVED,
                    false,
                    null,
                    "No problem. Message us anytime."
            );
        }
        return new Reply(BotStep.PROVIDE_STOCK, ConversationStatus.ACTIVE, false, null,
                "Reply YES to order or NO to end. You can also type \"agent\" to reach a person.");
    }

    private Reply handleEscalationOffer(String lower) {
        if (containsAny(lower, AFFIRMATIVE)) {
            return new Reply(
                    BotStep.ESCALATED,
                    ConversationStatus.ESCALATED,
                    true,
                    null,
                    "I'm passing you to a team member now."
            );
        }
        if (containsAny(lower, NEGATIVE)) {
            return new Reply(
                    BotStep.DONE,
                    ConversationStatus.RESOLVED,
                    false,
                    null,
                    "Okay — let us know if you need anything else."
            );
        }
        return new Reply(BotStep.ESCALATION_OFFER, ConversationStatus.ACTIVE, false, null,
                "Reply YES to be connected with a team member, or NO to end the chat.");
    }

    private static String formatMatches(List<Part> matches) {
        StringBuilder sb = new StringBuilder("I found the following:\n\n");
        for (Part p : matches) {
            sb.append("• ").append(p.getName())
                    .append(" (SKU ").append(p.getSku()).append(")\n")
                    .append("  R").append(p.getSellPrice())
                    .append(" · ").append(p.getQtyOnHand()).append(" in stock\n");
        }
        sb.append("\nReply YES to order, or type \"agent\" to talk to someone.");
        return sb.toString();
    }

    private static boolean containsAny(String haystack, Set<String> needles) {
        if (!StringUtils.hasText(haystack)) return false;
        for (String n : needles) {
            if (java.util.regex.Pattern.compile("\\b" + java.util.regex.Pattern.quote(n) + "\\b")
                    .matcher(haystack).find()) {
                return true;
            }
        }
        return false;
    }

    public record Reply(
            BotStep nextStep,
            ConversationStatus nextStatus,
            boolean escalated,
            String partRequest,
            String body
    ) {}
}
