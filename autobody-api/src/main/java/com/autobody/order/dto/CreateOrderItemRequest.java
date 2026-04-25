package com.autobody.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderItemRequest(
        @NotNull Long partId,
        @NotNull @Min(1) Integer qty
) {}
