package com.autobody.inventory.movement.dto;

import com.autobody.inventory.movement.MovementType;

import java.time.Instant;

public record StockMovementDTO(
        Long id,
        Long partId,
        String partSku,
        String partName,
        MovementType movementType,
        Integer qty,
        String reference,
        String notes,
        Long performedById,
        String performedByName,
        Instant createdAt
) {}
