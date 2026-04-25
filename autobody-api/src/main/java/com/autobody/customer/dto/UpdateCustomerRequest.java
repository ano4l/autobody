package com.autobody.customer.dto;

import com.autobody.customer.CustomerSource;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateCustomerRequest(
        @Size(max = 150) String name,
        @Size(max = 30) String phone,
        @Email @Size(max = 150) String email,
        @Size(max = 80) String vehicleMake,
        @Size(max = 80) String vehicleModel,
        Integer vehicleYear,
        @Size(max = 30) String vehicleVin,
        CustomerSource source
) {}
