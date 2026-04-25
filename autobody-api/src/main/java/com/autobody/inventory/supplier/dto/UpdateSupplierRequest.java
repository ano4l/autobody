package com.autobody.inventory.supplier.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateSupplierRequest(
        @Size(max = 150) String name,
        @Size(max = 100) String contactName,
        @Size(max = 30) String phone,
        @Email @Size(max = 150) String email,
        @Min(0) Integer leadTimeDays,
        String notes
) {}
