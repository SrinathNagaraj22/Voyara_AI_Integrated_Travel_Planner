package com.voyara.controller;

import com.voyara.dto.GoogleSignInRequest;
import com.voyara.dto.LoginRequest;
import com.voyara.dto.RegisterRequest;
import com.voyara.dto.UpdateProfileRequest;
import com.voyara.dto.UserResponse;
import com.voyara.entity.User;
import com.voyara.exception.UnauthorizedException;
import com.voyara.security.AuthCookieService;
import com.voyara.security.GoogleTokenVerifier;
import com.voyara.security.JwtService;
import com.voyara.security.LoginRateLimiter;
import com.voyara.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Thin orchestrator: validates input, delegates to {@link UserService}, issues the
 * auth cookie, returns a response DTO. No business logic, no JPA writes here.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthCookieService cookieService;
    private final LoginRateLimiter rateLimiter;
    private final GoogleTokenVerifier googleVerifier;
    private final String googleClientId;

    public AuthController(
            UserService userService,
            JwtService jwtService,
            AuthCookieService cookieService,
            LoginRateLimiter rateLimiter,
            GoogleTokenVerifier googleVerifier,
            @Value("${voyara.google.client-id:}") String googleClientId) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.cookieService = cookieService;
        this.rateLimiter = rateLimiter;
        this.googleVerifier = googleVerifier;
        this.googleClientId = googleClientId == null ? "" : googleClientId;
    }

    @GetMapping("/config")
    public ResponseEntity<?> authConfig() {
        return ResponseEntity.ok(Map.of(
                "googleEnabled", googleVerifier.isEnabled(),
                "googleClientId", googleClientId));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest body,
            HttpServletResponse response) {
        User user = userService.register(body);
        issueSession(response, user);
        return ResponseEntity.ok(Map.of("user", UserResponse.from(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        String rateKey = request.getRemoteAddr() + "|" + body.getEmail().trim().toLowerCase();
        if (!rateLimiter.tryConsume(rateKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many login attempts. Please wait a minute and try again."));
        }
        User user = userService.authenticate(body);
        issueSession(response, user);
        return ResponseEntity.ok(Map.of("user", UserResponse.from(user)));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(
            @Valid @RequestBody GoogleSignInRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        String rateKey = "google|" + request.getRemoteAddr();
        if (!rateLimiter.tryConsume(rateKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many sign-in attempts. Please wait a minute."));
        }
        User user = userService.signInWithGoogle(body.getCredential());
        issueSession(response, user);
        return ResponseEntity.ok(Map.of("user", UserResponse.from(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        cookieService.clearAuthCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        return ResponseEntity.ok(UserResponse.from(requirePrincipal(authentication)));
    }

    @PostMapping("/profile/update")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest body) {
        User principal = requirePrincipal(authentication);
        User updated = userService.updateProfile(principal.getId(), body);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    private void issueSession(HttpServletResponse response, User user) {
        String token = jwtService.issueToken(user.getId(), user.getUsername());
        cookieService.setAuthCookie(response, token, jwtService.getExpirationSeconds());
    }

    private User requirePrincipal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Not authenticated.");
        }
        return user;
    }
}
