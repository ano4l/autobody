package com.autobody.pos.dto;

import java.math.BigDecimal;

public record ClosePosSessionRequest(
        BigDecimal closingFloat,
        String notes
) {}
