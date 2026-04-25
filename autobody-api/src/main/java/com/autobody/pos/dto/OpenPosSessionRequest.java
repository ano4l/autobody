package com.autobody.pos.dto;

import java.math.BigDecimal;

public record OpenPosSessionRequest(
        BigDecimal openingFloat,
        String notes
) {}
