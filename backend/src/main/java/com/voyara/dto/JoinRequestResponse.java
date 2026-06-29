package com.voyara.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestResponse {
    private String id;
    private String tripId;
    private String tripTitle;
    private String userId;
    private String username;
    private String avatarUrl;
    private String message;
    private String status;
    /** "guest" if the viewer sent it, "host" if the viewer received it. */
    private String role;
    private String hostId;
    private String hostName;
}
