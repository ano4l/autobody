package com.autobody.order;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.inventory.movement.MovementType;
import com.autobody.inventory.movement.StockMovementService;
import com.autobody.inventory.movement.dto.CreateStockMovementRequest;
import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.order.dto.CreateOrderItemRequest;
import com.autobody.order.dto.CreateOrderRequest;
import com.autobody.order.dto.OrderDTO;
import com.autobody.shared.exception.ResourceNotFoundException;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PartRepository partRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final StockMovementService stockMovementService;
    private final OrderMapper orderMapper;

    @Transactional(readOnly = true)
    public Page<OrderDTO> list(OrderStatus status, OrderSource source, Pageable pageable) {
        return orderRepository.search(status, source, pageable)
                .map(order -> orderMapper.toDto(order, orderItemRepository.findByOrderId(order.getId())));
    }

    @Transactional(readOnly = true)
    public OrderDTO get(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toDto(order, orderItemRepository.findByOrderId(id));
    }

    @Transactional
    public OrderDTO create(CreateOrderRequest req, Long actingUserId) {
        Customer customer = req.customerId() == null ? null : customerRepository.findById(req.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", req.customerId()));
        User handledBy = actingUserId == null ? null : userRepository.findById(actingUserId).orElse(null);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderItemRequest itemReq : req.items()) {
            Part part = partRepository.findById(itemReq.partId())
                    .orElseThrow(() -> new ResourceNotFoundException("Part", itemReq.partId()));
            BigDecimal unitPrice = part.getSellPrice();
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(itemReq.qty())));
            items.add(OrderItem.builder()
                    .part(part)
                    .qty(itemReq.qty())
                    .unitPrice(unitPrice)
                    .build());
        }

        BigDecimal discount = req.discount() == null ? BigDecimal.ZERO : req.discount();
        BigDecimal total = subtotal.subtract(discount);

        Order order = orderRepository.save(Order.builder()
                .customer(customer)
                .source(req.source())
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .shopifyOrderId(req.shopifyOrderId())
                .notes(req.notes())
                .handledBy(handledBy)
                .build());

        for (OrderItem item : items) {
            item.setOrder(order);
            orderItemRepository.save(item);
            stockMovementService.record(
                    new CreateStockMovementRequest(
                            item.getPart().getId(),
                            MovementType.SALE,
                            item.getQty(),
                            "ORDER-" + order.getId(),
                            "POS/Order sale"
                    ),
                    actingUserId
            );
        }
        return orderMapper.toDto(order, orderItemRepository.findByOrderId(order.getId()));
    }
}
