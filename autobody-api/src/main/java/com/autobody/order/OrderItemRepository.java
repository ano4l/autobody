package com.autobody.order;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("""
            select i.part.id as partId,
                   i.part.sku as sku,
                   i.part.name as name,
                   sum(i.qty) as qtySold,
                   sum(i.unitPrice * i.qty) as revenue
            from OrderItem i
            where i.order.createdAt >= :from
              and i.order.createdAt < :to
              and i.order.status <> com.autobody.order.OrderStatus.CANCELLED
              and i.order.status <> com.autobody.order.OrderStatus.REFUNDED
            group by i.part.id, i.part.sku, i.part.name
            order by sum(i.qty) desc
            """)
    List<Object[]> topPartsByQty(@Param("from") Instant from,
                                 @Param("to") Instant to,
                                 Pageable pageable);

    @Query("""
            select i.part.id as partId,
                   i.part.sku as sku,
                   i.part.name as name,
                   sum(i.qty) as qtySold,
                   sum((i.unitPrice - coalesce(i.part.costPrice, 0)) * i.qty) as marginTotal,
                   sum(i.unitPrice * i.qty) as revenue
            from OrderItem i
            where i.order.createdAt >= :from
              and i.order.createdAt < :to
              and i.order.status <> com.autobody.order.OrderStatus.CANCELLED
              and i.order.status <> com.autobody.order.OrderStatus.REFUNDED
            group by i.part.id, i.part.sku, i.part.name
            order by sum((i.unitPrice - coalesce(i.part.costPrice, 0)) * i.qty) desc
            """)
    List<Object[]> marginByPart(@Param("from") Instant from,
                                @Param("to") Instant to,
                                Pageable pageable);

    @Query("select max(i.order.createdAt) from OrderItem i where i.part.id = :partId")
    Instant lastSaleAt(@Param("partId") Long partId);
}
