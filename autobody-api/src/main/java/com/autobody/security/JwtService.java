package com.autobody.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Value("${app.jwt.issuer}")
    private String issuer;

    private SecretKey key;

    @PostConstruct
    void init() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be at least 32 bytes (256 bits). Got " + bytes.length);
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public TokenPair issue(Long userId, String email, Role role) {
        Instant now = Instant.now();
        Instant accessExp = now.plusMillis(expirationMs);
        Instant refreshExp = now.plusMillis(refreshExpirationMs);

        String access = Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role.name())
                .claim("typ", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(accessExp))
                .signWith(key)
                .compact();

        String refresh = Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("typ", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(refreshExp))
                .signWith(key)
                .compact();

        return new TokenPair(access, refresh, accessExp);
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(Claims claims) {
        return "access".equals(claims.get("typ", String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return "refresh".equals(claims.get("typ", String.class));
    }

    public Long userId(Claims claims) {
        return Long.parseLong(claims.getSubject());
    }

    public record TokenPair(String accessToken, String refreshToken, Instant expiresAt) {}

    public Map<String, Object> describe(Claims claims) {
        return Map.of(
                "sub", claims.getSubject(),
                "email", String.valueOf(claims.get("email")),
                "role", String.valueOf(claims.get("role")),
                "exp", claims.getExpiration()
        );
    }
}
