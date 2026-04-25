package com.autobody.reporting.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record DeadStockDTO(
        Long partId,
        String sku,
        String name,
        int qtyOnHand,
        BigDecimal costPrice,
        BigDecimal sellPrice,
        Instant lastSaleAt,
        Long daysSinceLastSale
) {}
