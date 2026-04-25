package com.autobody.whatsapp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationTimeoutService {

    private final ConversationRepository conversationRepository;

    @Value("${meta.whatsapp.timeout-minutes:30}")
    private long timeoutMinutes;

    @Transactional
    public int sweep() {
        Instant cutoff = Instant.now().minus(Duration.ofMinutes(timeoutMinutes));
        int updated = conversationRepository.markStaleAsTimedOut(cutoff);
        if (updated > 0) {
            log.info("Marked {} stale WhatsApp conversation(s) as TIMED_OUT (cutoff {})", updated, cutoff);
        }
        return updated;
    }
}
