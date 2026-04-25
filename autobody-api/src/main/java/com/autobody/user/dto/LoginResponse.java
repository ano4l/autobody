package com.autobody.user.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresInMs,
        UserDTO user
) {}
