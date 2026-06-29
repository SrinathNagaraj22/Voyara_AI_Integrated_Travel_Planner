package com.voyara.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

    public static final String COOKIE_NAME = "voyara_session";

    private final boolean secureCookie;
    private final String sameSite;

    public AuthCookieService(
            @Value("${voyara.auth.cookie.secure:false}") boolean secureCookie,
            @Value("${voyara.auth.cookie.same-site:Lax}") String sameSite) {
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
    }

    public void setAuthCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        StringBuilder sb = new StringBuilder();
        sb.append(COOKIE_NAME).append('=').append(token);
        sb.append("; Path=/");
        sb.append("; Max-Age=").append(maxAgeSeconds);
        sb.append("; HttpOnly");
        sb.append("; SameSite=").append(sameSite);
        if (secureCookie) {
            sb.append("; Secure");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    public void clearAuthCookie(HttpServletResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append(COOKIE_NAME).append('=');
        sb.append("; Path=/");
        sb.append("; Max-Age=0");
        sb.append("; HttpOnly");
        sb.append("; SameSite=").append(sameSite);
        if (secureCookie) {
            sb.append("; Secure");
        }
        response.addHeader("Set-Cookie", sb.toString());
    }

    public String readToken(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (COOKIE_NAME.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}
