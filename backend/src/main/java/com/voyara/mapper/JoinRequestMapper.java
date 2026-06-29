package com.voyara.mapper;

import com.voyara.dto.JoinRequestResponse;
import com.voyara.entity.JoinRequest;
import com.voyara.entity.User;
import org.springframework.stereotype.Component;

@Component
public class JoinRequestMapper {

    /**
     * Convert with viewer context so the response can label whether the request
     * is outgoing ("guest") or incoming ("host") for the current user.
     */
    public JoinRequestResponse toResponse(JoinRequest req, User viewer) {
        boolean isOutgoing = req.getSender().getId().equals(viewer.getId());
        return JoinRequestResponse.builder()
                .id(req.getId().toString())
                .tripId(req.getTrip().getId().toString())
                .tripTitle(req.getTrip().getTitle())
                .userId(req.getSender().getId().toString())
                .username(req.getSender().getUsername())
                .avatarUrl(req.getSender().getAvatarUrl())
                .message(req.getMessage())
                .status(req.getStatus())
                .role(isOutgoing ? "guest" : "host")
                .hostId(req.getHost().getId().toString())
                .hostName(req.getHost().getUsername())
                .build();
    }
}
