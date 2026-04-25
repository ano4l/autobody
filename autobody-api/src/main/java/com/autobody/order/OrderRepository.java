package com.autobody.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    java.util.Optional<Order> findByShopifyOrderId(String shopifyOrderId);

    @Query("""
            select o from Order o
            where (:status is null or o.status = :status)
              and (:source is null or o.source = :source)
            """)
    Page<Order> search(@Param("status") OrderStatus status,
                       @Param("source") OrderSource source,
                       Pageable pageable);

    @Query("""
            select coalesce(sum(o.total), 0) from Order o
            where o.createdAt >= :from and o.createdAt < :to
              and o.status <> com.autobody.order.OrderStatus.CANCELLED
              and o.status <> com.autobody.order.OrderStatus.REFUNDED
            """)
    BigDecimal sumTotalBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            select count(o) from Order o
            where o.createdAt >= :from and o.createdAt < :to
              and o.status <> com.autobody.order.OrderStatus.CANCELLED
              and o.status <> com.autobody.order.OrderStatus.REFUNDED
            """)
    long countBetween(@Param("from") Instant from, @Param("to") Instant to);

    long countByStatus(OrderStatus status);

    @Query(value = """
            select to_char(date_trunc(:bucket, o.created_at at time zone 'UTC'), 'YYYY-MM-DD') as bucket,
                   coalesce(sum(o.total), 0) as revenue,
                   count(*) as order_count
            from orders o
            where o.created_at >= :from
              and o.created_at < :to
              and o.status not in ('CANCELLED', 'REFUNDED')
            group by date_trunc(:bucket, o.created_at at time zone 'UTC')
            order by bucket
            """, nativeQuery = true)
    List<Object[]> salesByBucket(@Param("bucket") String bucket,
                                 @Param("from") Instant from,
                                 @Param("to") Instant to);
}
