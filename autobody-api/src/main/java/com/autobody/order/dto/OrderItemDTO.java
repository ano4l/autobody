package com.autobody.order.dto;

import java.math.BigDecimal;

public record OrderItemDTO(
        Long id,
        Long partId,
        String partSku,
        String partName,
        Integer qty,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {}
