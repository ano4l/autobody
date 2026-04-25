package com.autobody.pos.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PosSessionDTO(
        Long id,
        Long userId,
        String userName,
        Instant openedAt,
        Instant closedAt,
        BigDecimal openingFloat,
        BigDecimal closingFloat,
        String notes
) {}
