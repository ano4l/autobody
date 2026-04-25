package com.autobody.user;

import com.autobody.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures the seeded admin account is usable on first boot.
 *
 * V5__seed_admin_user.sql inserts a canned bcrypt hash that is a placeholder —
 * it will not verify against "Admin@1234". This runner detects that exact
 * placeholder and re-encodes a valid hash using the configured PasswordEncoder,
 * so `POST /api/auth/login` works immediately after a fresh migration.
 *
 * A customised password (anything other than the placeholder) is left untouched.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private static final String SEED_EMAIL = "admin@autobody.local";
    private static final String SEED_PASSWORD = "Admin@1234";
    private static final String PLACEHOLDER_HASH =
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN3YCQzqW6e";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByEmailIgnoreCase(SEED_EMAIL).ifPresentOrElse(user -> {
            if (PLACEHOLDER_HASH.equals(user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(SEED_PASSWORD));
                userRepository.save(user);
                log.warn("Seeded admin password hash replaced with a valid bcrypt for '{}'. "
                        + "Login with '{}' / '{}' and change it immediately.",
                        SEED_EMAIL, SEED_EMAIL, SEED_PASSWORD);
            }
        }, () -> {
            User admin = User.builder()
                    .name("System Admin")
                    .email(SEED_EMAIL)
                    .passwordHash(passwordEncoder.encode(SEED_PASSWORD))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.warn("Bootstrapped admin user '{}' with default password '{}'. Change it immediately.",
                    SEED_EMAIL, SEED_PASSWORD);
        });
    }
}
