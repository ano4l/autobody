package com.autobody.whatsapp.dto;

import com.autobody.whatsapp.BotStep;
import com.autobody.whatsapp.ConversationStatus;

import java.time.Instant;

public record ConversationDTO(
        Long id,
        Long customerId,
        String customerName,
        String customerPhone,
        String waThreadId,
        ConversationStatus status,
        BotStep botStep,
        boolean escalated,
        Long escalatedTo,
        String partRequest,
        Instant createdAt,
        Instant updatedAt
) {}
