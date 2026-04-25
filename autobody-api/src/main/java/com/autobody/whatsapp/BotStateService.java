package com.autobody.whatsapp;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BotStateService {

    private static final String KEY_PREFIX = "wa:state:";

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${meta.whatsapp.state-ttl-minutes:30}")
    private long stateTtlMinutes;

    public Optional<BotState> get(String phone) {
        Object value = redisTemplate.opsForValue().get(key(phone));
        if (value instanceof BotState state) {
            return Optional.of(state);
        }
        return Optional.empty();
    }

    public BotState getOrCreate(String phone) {
        return get(phone).orElseGet(() -> {
            BotState initial = BotState.initial(phone);
            put(initial);
            return initial;
        });
    }

    public BotState advance(String phone, BotStep nextStep, boolean escalated) {
        BotState current = getOrCreate(phone);
        BotState updated = new BotState(
                phone,
                nextStep,
                current.attempts() + 1,
                escalated,
                Instant.now()
        );
        put(updated);
        return updated;
    }

    public void clear(String phone) {
        redisTemplate.delete(key(phone));
    }

    private void put(BotState state) {
        redisTemplate.opsForValue()
                .set(key(state.phone()), state, Duration.ofMinutes(stateTtlMinutes));
    }

    private String key(String phone) {
        return KEY_PREFIX + phone;
    }
}
