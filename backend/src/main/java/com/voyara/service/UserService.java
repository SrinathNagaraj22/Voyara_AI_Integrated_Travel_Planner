package com.voyara.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.voyara.dto.LoginRequest;
import com.voyara.dto.RegisterRequest;
import com.voyara.dto.UpdateProfileRequest;
import com.voyara.entity.User;
import com.voyara.exception.ConflictException;
import com.voyara.exception.NotFoundException;
import com.voyara.exception.UnauthorizedException;
import com.voyara.repository.UserRepository;
import com.voyara.security.GoogleTokenVerifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Domain operations on users — registration, password login, Google sign-in,
 * profile updates. Controllers should never touch UserRepository directly.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleTokenVerifier googleVerifier;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            GoogleTokenVerifier googleVerifier) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleVerifier = googleVerifier;
    }

    @Transactional
    public User register(RegisterRequest req) {
        String username = req.getUsername().trim();
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new ConflictException("Username is already taken.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email is already registered.");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(req.getPassword()))
                .bio(orDefault(req.getBio(), "Enthusiastic Nomad"))
                .location(orDefault(req.getLocation(), "Global"))
                .avatarUrl(orDefault(req.getAvatarUrl(),
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"))
                .build();
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()
                || userOpt.get().getPassword() == null
                || !passwordEncoder.matches(req.getPassword(), userOpt.get().getPassword())) {
            throw new UnauthorizedException("Incorrect email or password.");
        }
        return userOpt.get();
    }

    @Transactional
    public User signInWithGoogle(String credential) {
        if (!googleVerifier.isEnabled()) {
            throw new UnauthorizedException("Google sign-in is not configured on this server.");
        }
        GoogleIdToken.Payload payload = googleVerifier.verify(credential)
                .orElseThrow(() -> new UnauthorizedException("Invalid Google credential."));

        Boolean emailVerified = payload.getEmailVerified();
        if (emailVerified == null || !emailVerified) {
            throw new UnauthorizedException("Google account email is not verified.");
        }

        String googleId = payload.getSubject();
        String email = payload.getEmail().toLowerCase();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        return userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setGoogleId(googleId);
                            if (existing.getAvatarUrl() == null && picture != null) {
                                existing.setAvatarUrl(picture);
                            }
                            return userRepository.save(existing);
                        }))
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(generateUniqueUsername(email, name))
                        .email(email)
                        .password(null)
                        .googleId(googleId)
                        .bio("Joined via Google")
                        .location("")
                        .avatarUrl(picture)
                        .build()));
    }

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User no longer exists."));

        if (req.getUsername() != null && !req.getUsername().isBlank()
                && !req.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(req.getUsername()).isPresent()) {
                throw new ConflictException("Username is already taken.");
            }
            user.setUsername(req.getUsername());
        }
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return userRepository.save(user);
    }

    public User requireById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    private String generateUniqueUsername(String email, String name) {
        String base;
        if (name != null && !name.isBlank()) {
            base = name.toLowerCase().replaceAll("[^a-z0-9_]", "_");
        } else {
            base = email.substring(0, email.indexOf('@')).replaceAll("[^a-z0-9_]", "_");
        }
        if (base.length() < 3) base = "user_" + base;
        if (base.length() > 24) base = base.substring(0, 24);
        if (userRepository.findByUsername(base).isEmpty()) return base;
        for (int i = 2; i < 1000; i++) {
            String candidate = base + i;
            if (userRepository.findByUsername(candidate).isEmpty()) return candidate;
        }
        return base + System.currentTimeMillis();
    }

    private static String orDefault(String s, String fallback) {
        return (s == null || s.isBlank()) ? fallback : s;
    }
}
