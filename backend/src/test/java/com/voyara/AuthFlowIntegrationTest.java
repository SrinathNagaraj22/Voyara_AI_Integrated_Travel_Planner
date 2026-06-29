package com.voyara;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyara.entity.User;
import com.voyara.repository.UserRepository;
import com.voyara.security.AuthCookieService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
        userRepository.save(User.builder()
                .username("alice")
                .email("alice@example.com")
                .password(passwordEncoder.encode("password123"))
                .bio("test")
                .location("test")
                .avatarUrl("https://example.com/a.jpg")
                .build());
    }

    @Test
    void unauthenticatedAccessToProtectedEndpointReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void loginWithWrongPasswordReturns401WithoutSettingCookie() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"WRONG\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().doesNotExist(AuthCookieService.COOKIE_NAME));
    }

    @Test
    void loginWithMalformedEmailReturns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginSetsHttpOnlyCookieAndReturnsUserWithoutPassword() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("alice"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn();

        String setCookie = result.getResponse().getHeader("Set-Cookie");
        assertNotNull(setCookie, "Set-Cookie header must be present");
        assertTrue(setCookie.contains(AuthCookieService.COOKIE_NAME + "="),
                "Cookie name must match");
        assertTrue(setCookie.contains("HttpOnly"), "Cookie must be HttpOnly");
        assertTrue(setCookie.contains("SameSite="), "Cookie must declare SameSite");
    }

    @Test
    void registerThenMeReturnsAuthenticatedUser() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"email\":\"bob@example.com\",\"password\":\"securepw1\"}"))
                .andExpect(status().isOk())
                .andReturn();

        String setCookie = registerResult.getResponse().getHeader("Set-Cookie");
        assertNotNull(setCookie);
        String tokenValue = extractCookieValue(setCookie);

        mockMvc.perform(get("/api/auth/me")
                        .cookie(new Cookie(AuthCookieService.COOKIE_NAME, tokenValue)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("bob"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void registerWithWeakPasswordRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"weakuser\",\"email\":\"weak@example.com\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithDuplicateEmailRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice2\",\"email\":\"alice@example.com\",\"password\":\"securepw1\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void logoutClearsCookieAndSubsequentMeIs401() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String token = extractCookieValue(login.getResponse().getHeader("Set-Cookie"));

        MvcResult logout = mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie(AuthCookieService.COOKIE_NAME, token)))
                .andExpect(status().isOk())
                .andReturn();

        String clearHeader = logout.getResponse().getHeader("Set-Cookie");
        assertNotNull(clearHeader);
        assertTrue(clearHeader.contains("Max-Age=0"), "Logout must zero out the cookie");

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void passwordIsStoredHashedNotPlaintext() {
        User alice = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertNotEquals("password123", alice.getPassword());
        assertTrue(alice.getPassword().startsWith("$2"), "Should be BCrypt hash");
    }

    private String extractCookieValue(String setCookieHeader) {
        // setCookieHeader: "voyara_session=abc.def.ghi; Path=/; Max-Age=3600; ..."
        int eq = setCookieHeader.indexOf('=');
        int semi = setCookieHeader.indexOf(';');
        return setCookieHeader.substring(eq + 1, semi);
    }
}
