package com.autobody.inventory.movement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
        select m from StockMovement m
        where (:partId is null or m.part.id = :partId)
          and (:type is null or m.movementType = :type)
          and (:from is null or m.createdAt >= :from)
          and (:to is null or m.createdAt <= :to)
        order by m.createdAt desc
        """)
    Page<StockMovement> search(@Param("partId") Long partId,
                               @Param("type") MovementType type,
                               @Param("from") Instant from,
                               @Param("to") Instant to,
                               Pageable pageable);
}
