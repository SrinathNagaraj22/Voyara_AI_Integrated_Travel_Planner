package com.voyara.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean enabled;

    public GoogleTokenVerifier(@Value("${voyara.google.client-id:}") String clientId) {
        if (clientId == null || clientId.isBlank()) {
            this.verifier = null;
            this.enabled = false;
        } else {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            this.enabled = true;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Optional<GoogleIdToken.Payload> verify(String idTokenString) {
        if (!enabled) return Optional.empty();
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) return Optional.empty();
            return Optional.of(idToken.getPayload());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
