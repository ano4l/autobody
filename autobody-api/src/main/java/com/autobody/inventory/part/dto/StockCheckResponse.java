package com.autobody.inventory.part.dto;

import java.math.BigDecimal;

public record StockCheckResponse(
        String sku,
        String name,
        boolean inStock,
        int qtyOnHand,
        boolean lowStock,
        BigDecimal sellPrice,
        String location
) {}
