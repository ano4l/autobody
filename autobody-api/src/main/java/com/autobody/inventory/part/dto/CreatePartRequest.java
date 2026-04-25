package com.autobody.inventory.part.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreatePartRequest(
        @NotBlank @Size(max = 80) String sku,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 100) String category,
        @Size(max = 80) String make,
        @Size(max = 80) String model,
        Integer yearRangeStart,
        Integer yearRangeEnd,
        @Min(0) Integer qtyOnHand,
        @Min(0) Integer lowStockThreshold,
        @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal costPrice,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal sellPrice,
        @Size(max = 80) String location,
        Long supplierId,
        @Size(max = 100) String shopifyProductId,
        @Size(max = 100) String shopifyVariantId
) {}
