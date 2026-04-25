package com.autobody.whatsapp;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.customer.CustomerSource;
import com.autobody.support.AbstractPostgresIntegrationTest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
class ConversationTimeoutServiceIT extends AbstractPostgresIntegrationTest {

    @Autowired private ConversationRepository conversationRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ConversationTimeoutService timeoutService;

    @PersistenceContext private EntityManager em;

    @BeforeEach
    void cleanSlate() {
        conversationRepository.deleteAll();
        customerRepository.deleteAll();
    }

    private Conversation saveConvo(String thread, ConversationStatus status, Instant updatedAt) {
        Customer c = customerRepository.save(Customer.builder()
                .phone("+1555" + thread.substring(Math.max(0, thread.length() - 4)))
                .source(CustomerSource.WHATSAPP)
                .build());
        Conversation convo = conversationRepository.save(Conversation.builder()
                .customer(c)
                .waThreadId(thread)
                .status(status)
                .botStep(BotStep.ASK_PART)
                .escalated(Boolean.FALSE)
                .build());
        // force updated_at: AuditingEntityListener sets it to Instant.now() on save, so overwrite.
        em.flush();
        em.createNativeQuery("update conversations set updated_at = :ts where id = :id")
                .setParameter("ts", updatedAt)
                .setParameter("id", convo.getId())
                .executeUpdate();
        em.clear();
        return convo;
    }

    @Test
    @DisplayName("flips ACTIVE conversations older than cutoff to TIMED_OUT/DONE")
    void sweepsStaleActive() {
        Instant stale = Instant.now().minus(45, ChronoUnit.MINUTES);
        Conversation stuck = saveConvo("wa-stale-1", ConversationStatus.ACTIVE, stale);

        int updated = timeoutService.sweep();

        assertThat(updated).isEqualTo(1);
        Conversation after = conversationRepository.findById(stuck.getId()).orElseThrow();
        assertThat(after.getStatus()).isEqualTo(ConversationStatus.TIMED_OUT);
        assertThat(after.getBotStep()).isEqualTo(BotStep.DONE);
    }

    @Test
    @DisplayName("leaves fresh ACTIVE conversations alone")
    void skipsFreshActive() {
        Instant recent = Instant.now().minus(2, ChronoUnit.MINUTES);
        Conversation fresh = saveConvo("wa-fresh-1", ConversationStatus.ACTIVE, recent);

        int updated = timeoutService.sweep();

        assertThat(updated).isZero();
        Conversation after = conversationRepository.findById(fresh.getId()).orElseThrow();
        assertThat(after.getStatus()).isEqualTo(ConversationStatus.ACTIVE);
    }

    @Test
    @DisplayName("does not touch ESCALATED or RESOLVED conversations even if stale")
    void skipsNonActive() {
        Instant stale = Instant.now().minus(2, ChronoUnit.HOURS);
        Conversation esc = saveConvo("wa-esc-1", ConversationStatus.ESCALATED, stale);
        Conversation res = saveConvo("wa-res-1", ConversationStatus.RESOLVED, stale);

        int updated = timeoutService.sweep();

        assertThat(updated).isZero();
        assertThat(conversationRepository.findById(esc.getId()).orElseThrow().getStatus())
                .isEqualTo(ConversationStatus.ESCALATED);
        assertThat(conversationRepository.findById(res.getId()).orElseThrow().getStatus())
                .isEqualTo(ConversationStatus.RESOLVED);
    }
}
