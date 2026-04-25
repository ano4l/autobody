package com.autobody.order.dto;

import com.autobody.order.OrderSource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
        Long customerId,
        @NotNull OrderSource source,
        BigDecimal discount,
        @Size(max = 100) String shopifyOrderId,
        String notes,
        @NotEmpty List<@Valid CreateOrderItemRequest> items
) {}
