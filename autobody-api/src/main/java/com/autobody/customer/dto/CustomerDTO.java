package com.autobody.customer.dto;

import com.autobody.customer.CustomerSource;

import java.time.Instant;

public record CustomerDTO(
        Long id,
        String name,
        String phone,
        String email,
        String vehicleMake,
        String vehicleModel,
        Integer vehicleYear,
        String vehicleVin,
        CustomerSource source,
        Instant createdAt,
        Instant updatedAt
) {}
