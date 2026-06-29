package com.voyara.controller;

import com.voyara.dto.CreateTripRequest;
import com.voyara.dto.JoinTripRequest;
import com.voyara.dto.TripResponse;
import com.voyara.entity.JoinRequest;
import com.voyara.entity.Trip;
import com.voyara.entity.User;
import com.voyara.mapper.TripMapper;
import com.voyara.service.TripService;
import com.voyara.web.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;
    private final TripMapper tripMapper;
    private final AuthenticatedUserResolver currentUser;

    public TripController(
            TripService tripService,
            TripMapper tripMapper,
            AuthenticatedUserResolver currentUser) {
        this.tripService = tripService;
        this.tripMapper = tripMapper;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> list(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "destination", required = false) String destination) {
        List<TripResponse> responses = tripService.search(query, destination).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<TripResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateTripRequest body) {
        User user = currentUser.require(authentication);
        Trip created = tripService.create(user, body);
        return ResponseEntity.ok(tripMapper.toResponse(created));
    }

    @PostMapping("/{tripId}/join")
    public ResponseEntity<?> requestToJoin(
            Authentication authentication,
            @PathVariable Long tripId,
            @Valid @RequestBody(required = false) JoinTripRequest body) {
        User sender = currentUser.require(authentication);
        JoinRequest request = tripService.requestToJoin(tripId, sender, body);
        return ResponseEntity.ok(Map.of(
                "message", "Travel proposal delivered to host.",
                "id", request.getId()));
    }
}
