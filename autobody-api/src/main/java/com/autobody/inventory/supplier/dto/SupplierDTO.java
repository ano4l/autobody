package com.autobody.inventory.supplier.dto;

import java.time.Instant;

public record SupplierDTO(
        Long id,
        String name,
        String contactName,
        String phone,
        String email,
        Integer leadTimeDays,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {}
