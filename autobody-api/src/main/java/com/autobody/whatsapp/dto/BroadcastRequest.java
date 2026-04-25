package com.autobody.whatsapp.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BroadcastRequest(
        @NotNull @NotEmpty List<@Size(min = 6, max = 30) String> recipients,
        @NotNull @Size(min = 1, max = 4096) String message
) {}
