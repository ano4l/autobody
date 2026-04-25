package com.autobody.whatsapp;

import java.io.Serializable;
import java.time.Instant;

public record BotState(
        String phone,
        BotStep step,
        int attempts,
        boolean escalated,
        Instant updatedAt
) implements Serializable {

    public static BotState initial(String phone) {
        return new BotState(phone, BotStep.GREETING, 0, false, Instant.now());
    }
}
