package com.autobody.inventory.movement.dto;

import com.autobody.inventory.movement.MovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStockMovementRequest(
        @NotNull Long partId,
        @NotNull MovementType movementType,
        /**
         * For SALE/RECEIVE/WRITE_OFF/RETURN: use a positive number — the sign is applied
         * by the movement type. For ADJUST: positive adds stock, negative removes stock.
         */
        @NotNull Integer qty,
        @Size(max = 100) String reference,
        String notes
) {}
