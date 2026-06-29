package com.voyara.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyara.dto.AuthorSummary;
import com.voyara.dto.TripMemberSummary;
import com.voyara.dto.TripResponse;
import com.voyara.entity.Trip;
import com.voyara.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TripMapper {

    private static final Logger log = LoggerFactory.getLogger(TripMapper.class);

    private final ObjectMapper objectMapper;

    public TripMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public TripResponse toResponse(Trip trip) {
        User creator = trip.getCreator();

        List<Long> memberIds = trip.getMembers().stream()
                .map(User::getId)
                .collect(Collectors.toList());

        List<TripMemberSummary> memberDetails = trip.getMembers().stream()
                .map(TripMemberSummary::from)
                .collect(Collectors.toList());

        JsonNode itinerary = parseItinerary(trip.getItineraryJson());

        return TripResponse.builder()
                .id(trip.getId())
                .creatorId(creator.getId())
                .creatorName(creator.getUsername())
                .creatorAvatar(creator.getAvatarUrl())
                .creator(AuthorSummary.from(creator))
                .title(trip.getTitle())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .budget(trip.getBudget())
                .totalSeats(trip.getTotalSeats())
                .occupiedSeats(trip.getOccupiedSeats())
                .description(trip.getDescription())
                .itinerary(itinerary)
                .members(memberIds)
                .memberDetails(memberDetails)
                .build();
    }

    private JsonNode parseItinerary(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            log.warn("Stored itinerary JSON is malformed, omitting from response: {}", ex.getMessage());
            return null;
        }
    }
}
