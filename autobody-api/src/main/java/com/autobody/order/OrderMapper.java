package com.autobody.order;

import com.autobody.order.dto.OrderDTO;
import com.autobody.order.dto.OrderItemDTO;
import org.mapstruct.Mapper;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface OrderMapper {
    default OrderDTO toDto(Order order, List<OrderItem> items) {
        return new OrderDTO(
                order.getId(),
                order.getCustomer() != null ? order.getCustomer().getId() : null,
                order.getCustomer() != null ? order.getCustomer().getName() : null,
                order.getSource(),
                order.getStatus(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getTotal(),
                order.getShopifyOrderId(),
                order.getNotes(),
                order.getHandledBy() != null ? order.getHandledBy().getId() : null,
                order.getHandledBy() != null ? order.getHandledBy().getName() : null,
                order.getVersion(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items.stream().map(this::toItemDto).toList()
        );
    }

    default OrderItemDTO toItemDto(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQty()));
        return new OrderItemDTO(
                item.getId(),
                item.getPart().getId(),
                item.getPart().getSku(),
                item.getPart().getName(),
                item.getQty(),
                item.getUnitPrice(),
                lineTotal
        );
    }
}
