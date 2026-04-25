package com.autobody.user.dto;

import com.autobody.security.Role;

import java.time.Instant;

public record UserDTO(
        Long id,
        String name,
        String email,
        Role role,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
