package com.autobody.inventory.part;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface PartRepository extends JpaRepository<Part, Long> {

    Optional<Part> findBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCase(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Part p where p.id = :id")
    Optional<Part> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        select p from Part p
        where (:search = '' or lower(p.sku) like lower(concat('%', :search, '%'))
                            or lower(p.name) like lower(concat('%', :search, '%')))
          and (:make = '' or lower(p.make) = lower(:make))
          and (:model = '' or lower(p.model) = lower(:model))
          and (:active is null or p.active = :active)
        """)
    Page<Part> search(@Param("search") String search,
                      @Param("make") String make,
                      @Param("model") String model,
                      @Param("active") Boolean active,
                      Pageable pageable);

    @Query("select p from Part p where p.active = true and p.qtyOnHand <= p.lowStockThreshold")
    Page<Part> findLowStock(Pageable pageable);

    @Query("select count(p) from Part p where p.active = true and p.qtyOnHand <= p.lowStockThreshold")
    long countLowStock();

    @Query("""
            select p from Part p
            where p.active = true
              and p.qtyOnHand > 0
              and not exists (
                  select 1 from OrderItem i
                  where i.part = p
                    and i.order.createdAt >= :since
                    and i.order.status <> com.autobody.order.OrderStatus.CANCELLED
                    and i.order.status <> com.autobody.order.OrderStatus.REFUNDED
              )
            """)
    Page<Part> findDeadStockSince(@Param("since") java.time.Instant since, Pageable pageable);

    List<Part> findTop200ByActiveTrueOrderByUpdatedAtDesc();
}
