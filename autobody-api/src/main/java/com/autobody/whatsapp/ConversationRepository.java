package com.autobody.whatsapp;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByWaThreadId(String waThreadId);

    long countByStatus(ConversationStatus status);

    Page<Conversation> findByStatus(ConversationStatus status, Pageable pageable);

    Page<Conversation> findByEscalatedTrue(Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Conversation c set c.status = com.autobody.whatsapp.ConversationStatus.TIMED_OUT, c.botStep = com.autobody.whatsapp.BotStep.DONE "
            + "where c.status = com.autobody.whatsapp.ConversationStatus.ACTIVE and c.updatedAt < :cutoff")
    int markStaleAsTimedOut(@Param("cutoff") Instant cutoff);
}
