package com.voyara.web;

import com.voyara.entity.User;
import com.voyara.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedUserResolver {

    public User require(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Not authenticated.");
        }
        return user;
    }
}
