package com.voyara.dto;

import com.voyara.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripMemberSummary {
    private Long id;
    private String username;
    private String avatarUrl;

    public static TripMemberSummary from(User user) {
        return TripMemberSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
