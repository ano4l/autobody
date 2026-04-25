package com.autobody.user;

import com.autobody.security.AppUserPrincipal;
import com.autobody.security.JwtService;
import com.autobody.security.UserDetailsServiceImpl;
import com.autobody.shared.dto.ApiResponse;
import com.autobody.shared.exception.BusinessRuleException;
import com.autobody.user.dto.LoginRequest;
import com.autobody.user.dto.LoginResponse;
import com.autobody.user.dto.RefreshRequest;
import com.autobody.user.dto.UserDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
@SecurityRequirements
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password()));

        AppUserPrincipal principal = (AppUserPrincipal) auth.getPrincipal();
        JwtService.TokenPair tokens = jwtService.issue(principal.id(), principal.email(), principal.role());
        UserDTO user = userService.get(principal.id());

        log.info("Login success: userId={}, email={}", principal.id(), principal.email());

        return ApiResponse.ok(new LoginResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                java.time.Duration.between(java.time.Instant.now(), tokens.expiresAt()).toMillis(),
                user
        ), "Login successful");
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        Claims claims;
        try {
            claims = jwtService.parse(req.refreshToken());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessRuleException("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
        }
        if (!jwtService.isRefreshToken(claims)) {
            throw new BusinessRuleException("INVALID_REFRESH_TOKEN", "Not a refresh token");
        }

        Long userId = jwtService.userId(claims);
        AppUserPrincipal principal = userDetailsService.loadById(userId);
        if (!principal.isEnabled()) {
            throw new BusinessRuleException("ACCOUNT_DISABLED", "Account is disabled");
        }

        JwtService.TokenPair tokens = jwtService.issue(principal.id(), principal.email(), principal.role());
        UserDTO user = userService.get(principal.id());

        return ApiResponse.ok(new LoginResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                java.time.Duration.between(java.time.Instant.now(), tokens.expiresAt()).toMillis(),
                user
        ), "Token refreshed");
    }
}
