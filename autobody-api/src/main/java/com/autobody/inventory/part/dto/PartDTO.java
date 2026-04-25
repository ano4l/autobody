package com.autobody.inventory.part.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PartDTO(
        Long id,
        String sku,
        String name,
        String category,
        String make,
        String model,
        Integer yearRangeStart,
        Integer yearRangeEnd,
        Integer qtyOnHand,
        Integer lowStockThreshold,
        BigDecimal costPrice,
        BigDecimal sellPrice,
        String location,
        Long supplierId,
        String supplierName,
        String shopifyProductId,
        String shopifyVariantId,
        boolean active,
        boolean lowStock,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {}
