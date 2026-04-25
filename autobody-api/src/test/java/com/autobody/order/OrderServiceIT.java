package com.autobody.order;

import com.autobody.customer.Customer;
import com.autobody.customer.CustomerRepository;
import com.autobody.customer.CustomerSource;
import com.autobody.inventory.movement.MovementType;
import com.autobody.inventory.movement.StockMovement;
import com.autobody.inventory.movement.StockMovementRepository;
import com.autobody.inventory.part.Part;
import com.autobody.inventory.part.PartRepository;
import com.autobody.order.dto.CreateOrderItemRequest;
import com.autobody.order.dto.CreateOrderRequest;
import com.autobody.order.dto.OrderDTO;
import com.autobody.security.Role;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.support.AbstractPostgresIntegrationTest;
import com.autobody.user.User;
import com.autobody.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * End-to-end coverage of the POS / walk-in sale path:
 *   CreateOrderRequest -> OrderService.create -> StockMovementService.record -> Part.qtyOnHand mutation
 *
 * These tests intentionally avoid @Transactional on the class — each service call must commit its own
 * transaction so we can observe post-commit state and, critically, assert rollback behaviour when the
 * stock-movement step explodes mid-loop.
 */
class OrderServiceIT extends AbstractPostgresIntegrationTest {

    @Autowired private OrderService orderService;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private StockMovementRepository stockMovementRepository;
    @Autowired private PartRepository partRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void cleanSlate() {
        // Children first to satisfy FKs. Orders cascade to order_items via DB; clear explicitly to be safe.
        stockMovementRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        partRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.findAll().stream()
                .filter(u -> u.getEmail().startsWith("pos-test-"))
                .forEach(userRepository::delete);
    }

    private Part newPart(String sku, int qty, String sellPrice) {
        return partRepository.save(Part.builder()
                .sku(sku)
                .name("Part " + sku)
                .qtyOnHand(qty)
                .lowStockThreshold(2)
                .sellPrice(new BigDecimal(sellPrice))
                .costPrice(new BigDecimal("10.00"))
                .active(true)
                .build());
    }

    private User newCashier() {
        return userRepository.save(User.builder()
                .name("Cashier Test")
                .email("pos-test-cashier-" + System.nanoTime() + "@example.com")
                .passwordHash("$2a$12$dummydummydummydummydummydummydummydummydummydummydum")
                .role(Role.SALESPERSON)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("create decrements stock, writes SALE movement, and computes totals")
    void happyPathSale() {
        Part alternator = newPart("ALT-100", 5, "250.00");
        Part battery = newPart("BAT-200", 3, "180.00");
        User cashier = newCashier();
        Customer walkIn = customerRepository.save(Customer.builder()
                .phone("+15550000001")
                .source(CustomerSource.WHATSAPP)
                .build());

        CreateOrderRequest req = new CreateOrderRequest(
                walkIn.getId(),
                OrderSource.WALK_IN,
                new BigDecimal("30.00"),
                null,
                null,
                List.of(
                        new CreateOrderItemRequest(alternator.getId(), 2),
                        new CreateOrderItemRequest(battery.getId(), 1)
                )
        );

        OrderDTO result = orderService.create(req, cashier.getId());

        // subtotal: 2 * 250 + 1 * 180 = 680; total: 680 - 30 = 650
        assertThat(result.subtotal()).isEqualByComparingTo("680.00");
        assertThat(result.discount()).isEqualByComparingTo("30.00");
        assertThat(result.total()).isEqualByComparingTo("650.00");
        assertThat(result.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(result.items()).hasSize(2);

        // Stock was mutated atomically with the sale.
        assertThat(partRepository.findById(alternator.getId()).orElseThrow().getQtyOnHand()).isEqualTo(3);
        assertThat(partRepository.findById(battery.getId()).orElseThrow().getQtyOnHand()).isEqualTo(2);

        // Exactly one SALE movement per line item, with negative deltas referenced to the order.
        List<StockMovement> movements = stockMovementRepository.findAll();
        assertThat(movements).hasSize(2);
        assertThat(movements).allSatisfy(m -> {
            assertThat(m.getMovementType()).isEqualTo(MovementType.SALE);
            assertThat(m.getQty()).isNegative();
            assertThat(m.getReference()).isEqualTo("ORDER-" + result.id());
            assertThat(m.getPerformedBy()).isNotNull();
            assertThat(m.getPerformedBy().getId()).isEqualTo(cashier.getId());
        });
    }

    @Test
    @DisplayName("rolls back the entire order when any line item has insufficient stock")
    void rollsBackOnInsufficientStock() {
        Part inStock = newPart("GOOD-1", 10, "50.00");
        Part shortStock = newPart("LOW-1", 1, "50.00");
        long ordersBefore = orderRepository.count();
        long movementsBefore = stockMovementRepository.count();

        CreateOrderRequest req = new CreateOrderRequest(
                null,
                OrderSource.WALK_IN,
                null,
                null,
                null,
                List.of(
                        new CreateOrderItemRequest(inStock.getId(), 2),
                        new CreateOrderItemRequest(shortStock.getId(), 5) // only 1 on hand
                )
        );

        assertThatThrownBy(() -> orderService.create(req, null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("INSUFFICIENT_STOCK");

        // Order row, order_items, and stock_movements must all be rolled back — no partial sale allowed.
        assertThat(orderRepository.count()).isEqualTo(ordersBefore);
        assertThat(stockMovementRepository.count()).isEqualTo(movementsBefore);

        // Neither part's qty_on_hand should have moved, even though the first line succeeded before the
        // second line aborted the transaction.
        assertThat(partRepository.findById(inStock.getId()).orElseThrow().getQtyOnHand()).isEqualTo(10);
        assertThat(partRepository.findById(shortStock.getId()).orElseThrow().getQtyOnHand()).isEqualTo(1);
    }

    @Test
    @DisplayName("list() paginates orders by status and source filters")
    void listFiltersByStatusAndSource() {
        Part p = newPart("LIST-1", 20, "10.00");
        orderService.create(new CreateOrderRequest(null, OrderSource.WALK_IN, null, null, null,
                List.of(new CreateOrderItemRequest(p.getId(), 1))), null);
        orderService.create(new CreateOrderRequest(null, OrderSource.SHOPIFY, null, "shop-001", null,
                List.of(new CreateOrderItemRequest(p.getId(), 1))), null);

        var walkIns = orderService.list(null, OrderSource.WALK_IN, PageRequest.of(0, 10));
        var shopify = orderService.list(null, OrderSource.SHOPIFY, PageRequest.of(0, 10));

        assertThat(walkIns.getTotalElements()).isEqualTo(1);
        assertThat(walkIns.getContent().get(0).source()).isEqualTo(OrderSource.WALK_IN);
        assertThat(shopify.getTotalElements()).isEqualTo(1);
        assertThat(shopify.getContent().get(0).shopifyOrderId()).isEqualTo("shop-001");
    }
}
