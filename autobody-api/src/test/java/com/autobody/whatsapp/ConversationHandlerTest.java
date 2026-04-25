package com.autobody.whatsapp;

import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Pure unit tests for the {@link ConversationHandler} state machine.
 * No Spring context, no database — just the transitions.
 */
class ConversationHandlerTest {

    private PartRepository partRepository;
    private ConversationHandler handler;

    @BeforeEach
    void setUp() {
        partRepository = mock(PartRepository.class);
        handler = new ConversationHandler(partRepository);
    }

    private Conversation convoAt(BotStep step) {
        Conversation c = new Conversation();
        c.setBotStep(step);
        c.setStatus(ConversationStatus.ACTIVE);
        c.setEscalated(Boolean.FALSE);
        return c;
    }

    @Nested
    @DisplayName("escalation keywords")
    class Escalation {

        @Test
        void directAgentWordEscalatesFromAnyStep() {
            for (BotStep step : BotStep.values()) {
                ConversationHandler.Reply r = handler.handle(convoAt(step), "please send me an agent");
                assertThat(r.escalated()).as("step %s", step).isTrue();
                assertThat(r.nextStatus()).isEqualTo(ConversationStatus.ESCALATED);
                assertThat(r.nextStep()).isEqualTo(BotStep.ESCALATED);
            }
        }

        @Test
        void wordBoundaryPreventsFalsePositives() {
            // "agenda" should NOT match "agent"; "helper" should NOT match "help".
            ConversationHandler.Reply r1 = handler.handle(convoAt(BotStep.ASK_VEHICLE), "my agenda is busy");
            assertThat(r1.escalated()).isFalse();

            ConversationHandler.Reply r2 = handler.handle(convoAt(BotStep.ASK_VEHICLE), "that helper system was fine");
            assertThat(r2.escalated()).isFalse();
        }

        @Test
        void multiWordPhraseMatches() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.PROVIDE_STOCK), "I want to talk to someone");
            assertThat(r.escalated()).isTrue();
        }
    }

    @Nested
    @DisplayName("greeting → ask vehicle")
    class Greeting {

        @Test
        void nullStepDefaultsToGreeting() {
            Conversation c = new Conversation();
            // botStep explicitly null
            ConversationHandler.Reply r = handler.handle(c, "hi");
            assertThat(r.nextStep()).isEqualTo(BotStep.ASK_VEHICLE);
            assertThat(r.body()).contains("make and model");
        }

        @Test
        void greetingAdvancesToAskVehicle() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.GREETING), "hello there");
            assertThat(r.nextStep()).isEqualTo(BotStep.ASK_VEHICLE);
            assertThat(r.nextStatus()).isEqualTo(ConversationStatus.ACTIVE);
            assertThat(r.escalated()).isFalse();
        }
    }

    @Nested
    @DisplayName("ask vehicle → ask part")
    class AskVehicle {

        @Test
        void vehicleTextAdvancesToAskPart() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ASK_VEHICLE), "Toyota Hilux 2018");
            assertThat(r.nextStep()).isEqualTo(BotStep.ASK_PART);
            assertThat(r.body()).containsIgnoringCase("part");
        }

        @Test
        void blankTextStaysInAskVehicle() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ASK_VEHICLE), "   ");
            assertThat(r.nextStep()).isEqualTo(BotStep.ASK_VEHICLE);
        }
    }

    @Nested
    @DisplayName("ask part → stock / escalation offer")
    class AskPart {

        @Test
        void foundPartsAdvancesToProvideStockAndStoresPartRequest() {
            Part found = Part.builder()
                    .sku("BRK-001")
                    .name("Brake Pad Set")
                    .sellPrice(new BigDecimal("499.00"))
                    .qtyOnHand(4)
                    .build();
            when(partRepository.search(
                    ArgumentMatchers.eq("brake pads"),
                    ArgumentMatchers.isNull(),
                    ArgumentMatchers.isNull(),
                    ArgumentMatchers.eq(Boolean.TRUE),
                    ArgumentMatchers.any(Pageable.class)
            )).thenReturn(new PageImpl<>(List.of(found)));

            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ASK_PART), "brake pads");
            assertThat(r.nextStep()).isEqualTo(BotStep.PROVIDE_STOCK);
            assertThat(r.partRequest()).isEqualTo("brake pads");
            assertThat(r.body()).contains("Brake Pad Set", "BRK-001", "499.00", "4 in stock");
        }

        @Test
        void noMatchesAdvancesToEscalationOffer() {
            when(partRepository.search(
                    ArgumentMatchers.anyString(),
                    ArgumentMatchers.isNull(),
                    ArgumentMatchers.isNull(),
                    ArgumentMatchers.eq(Boolean.TRUE),
                    ArgumentMatchers.any(Pageable.class)
            )).thenReturn(Page.empty());

            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ASK_PART), "bumper guards");
            assertThat(r.nextStep()).isEqualTo(BotStep.ESCALATION_OFFER);
            assertThat(r.partRequest()).isEqualTo("bumper guards");
            assertThat(r.body()).containsIgnoringCase("couldn't find");
        }

        @Test
        void blankTextStaysInAskPart() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ASK_PART), "");
            assertThat(r.nextStep()).isEqualTo(BotStep.ASK_PART);
        }
    }

    @Nested
    @DisplayName("provide stock → yes/no/neither")
    class ProvideStock {

        @Test
        void yesEscalatesToHuman() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.PROVIDE_STOCK), "yes please");
            assertThat(r.nextStep()).isEqualTo(BotStep.ESCALATED);
            assertThat(r.nextStatus()).isEqualTo(ConversationStatus.ESCALATED);
            assertThat(r.escalated()).isTrue();
        }

        @Test
        void noResolvesConversation() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.PROVIDE_STOCK), "nope, not today");
            assertThat(r.nextStep()).isEqualTo(BotStep.DONE);
            assertThat(r.nextStatus()).isEqualTo(ConversationStatus.RESOLVED);
            assertThat(r.escalated()).isFalse();
        }

        @Test
        void unrecognisedReplyPromptsForClarification() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.PROVIDE_STOCK), "maybe");
            assertThat(r.nextStep()).isEqualTo(BotStep.PROVIDE_STOCK);
            assertThat(r.body()).containsIgnoringCase("yes");
        }
    }

    @Nested
    @DisplayName("escalation offer → yes/no")
    class EscalationOffer {

        @Test
        void yesEscalates() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ESCALATION_OFFER), "ok");
            assertThat(r.escalated()).isTrue();
            assertThat(r.nextStep()).isEqualTo(BotStep.ESCALATED);
        }

        @Test
        void noEndsConversation() {
            ConversationHandler.Reply r = handler.handle(convoAt(BotStep.ESCALATION_OFFER), "no thanks");
            assertThat(r.nextStep()).isEqualTo(BotStep.DONE);
            assertThat(r.nextStatus()).isEqualTo(ConversationStatus.RESOLVED);
        }
    }

    @Nested
    @DisplayName("terminal states")
    class Terminal {

        @Test
        void escalatedStateRemainsEscalatedWithHoldingMessage() {
            Conversation c = convoAt(BotStep.ESCALATED);
            c.setStatus(ConversationStatus.ESCALATED);
            c.setEscalated(Boolean.TRUE);
            ConversationHandler.Reply r = handler.handle(c, "still there?");
            assertThat(r.nextStep()).isEqualTo(BotStep.ESCALATED);
            assertThat(r.body()).containsIgnoringCase("team member");
        }

        @Test
        void doneStateHoldsStill() {
            Conversation c = convoAt(BotStep.DONE);
            c.setStatus(ConversationStatus.RESOLVED);
            ConversationHandler.Reply r = handler.handle(c, "anything?");
            assertThat(r.nextStep()).isEqualTo(BotStep.DONE);
        }
    }
}
