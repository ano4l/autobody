package com.autobody.order.dto;

import com.autobody.order.OrderSource;
import com.autobody.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDTO(
        Long id,
        Long customerId,
        String customerName,
        OrderSource source,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal total,
        String shopifyOrderId,
        String notes,
        Long handledById,
        String handledByName,
        Long version,
        Instant createdAt,
        Instant updatedAt,
        List<OrderItemDTO> items
) {}
