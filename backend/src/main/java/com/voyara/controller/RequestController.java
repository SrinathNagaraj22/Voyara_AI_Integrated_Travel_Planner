package com.voyara.controller;

import com.voyara.dto.JoinRequestResponse;
import com.voyara.dto.RespondToRequestRequest;
import com.voyara.entity.JoinRequest;
import com.voyara.entity.User;
import com.voyara.mapper.JoinRequestMapper;
import com.voyara.service.JoinRequestService;
import com.voyara.web.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final JoinRequestService joinRequestService;
    private final JoinRequestMapper joinRequestMapper;
    private final AuthenticatedUserResolver currentUser;

    public RequestController(
            JoinRequestService joinRequestService,
            JoinRequestMapper joinRequestMapper,
            AuthenticatedUserResolver currentUser) {
        this.joinRequestService = joinRequestService;
        this.joinRequestMapper = joinRequestMapper;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<JoinRequestResponse>> list(Authentication authentication) {
        User user = currentUser.require(authentication);
        List<JoinRequestResponse> responses = joinRequestService.listForUser(user).stream()
                .map(r -> joinRequestMapper.toResponse(r, user))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{requestId}/respond")
    public ResponseEntity<?> respond(
            Authentication authentication,
            @PathVariable Long requestId,
            @Valid @RequestBody RespondToRequestRequest body) {
        User actingHost = currentUser.require(authentication);
        JoinRequest updated = joinRequestService.respond(requestId, actingHost, body);
        return ResponseEntity.ok(Map.of("message", "Proposal marked as " + updated.getStatus()));
    }
}
