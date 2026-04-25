package com.autobody.user.dto;

import com.autobody.security.Role;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 100) String name,
        Role role,
        Boolean active,
        @Size(min = 8, max = 100) String password
) {}
