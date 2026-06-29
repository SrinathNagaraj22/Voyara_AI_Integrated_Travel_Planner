package com.voyara.dto;

import com.voyara.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Lightweight projection of a user used when nested inside posts/trips. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorSummary {
    private Long id;
    private String username;
    private String avatarUrl;
    private String bio;
    private String location;

    public static AuthorSummary from(User user) {
        return AuthorSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .build();
    }
}
