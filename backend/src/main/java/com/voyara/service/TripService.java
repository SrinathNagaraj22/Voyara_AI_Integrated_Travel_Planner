package com.voyara.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyara.dto.CreateTripRequest;
import com.voyara.dto.JoinTripRequest;
import com.voyara.entity.JoinRequest;
import com.voyara.entity.Trip;
import com.voyara.entity.User;
import com.voyara.exception.BadRequestException;
import com.voyara.exception.NotFoundException;
import com.voyara.repository.JoinRequestRepository;
import com.voyara.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final ObjectMapper objectMapper;

    public TripService(
            TripRepository tripRepository,
            JoinRequestRepository joinRequestRepository,
            ObjectMapper objectMapper) {
        this.tripRepository = tripRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.objectMapper = objectMapper;
    }

    public List<Trip> search(String query, String destination) {
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasDest = destination != null && !destination.trim().isEmpty();

        if (hasQuery && hasDest) {
            return tripRepository.findByDestinationContainingIgnoreCaseAndTitleContainingIgnoreCase(destination, query);
        }
        if (hasDest) {
            return tripRepository.findByDestinationContainingIgnoreCase(destination);
        }
        if (hasQuery) {
            return tripRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        }
        return tripRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public Trip create(User creator, CreateTripRequest req) {
        String budget = (req.getBudget() == null || req.getBudget().isBlank()) ? "$500" : req.getBudget();
        Trip trip = Trip.builder()
                .creator(creator)
                .title(req.getTitle().trim())
                .destination(req.getDestination().trim())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .budget(budget)
                .totalSeats(req.getTotalSeats() == null ? 4 : req.getTotalSeats())
                .occupiedSeats(1)
                .description(req.getDescription())
                .itineraryJson(serializeItinerary(req.getItinerary()))
                .members(new HashSet<>(List.of(creator)))
                .build();
        return tripRepository.save(trip);
    }

    @Transactional
    public JoinRequest requestToJoin(Long tripId, User sender, JoinTripRequest req) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("Trip not found."));

        if (trip.getCreator().getId().equals(sender.getId())) {
            throw new BadRequestException("You are already the host of this trip.");
        }

        String message = (req != null && req.getMessage() != null && !req.getMessage().isBlank())
                ? req.getMessage()
                : "I would love to travel together!";

        JoinRequest request = JoinRequest.builder()
                .trip(trip)
                .sender(sender)
                .host(trip.getCreator())
                .message(message)
                .status("pending")
                .build();
        return joinRequestRepository.save(request);
    }

    private String serializeItinerary(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) return null;
        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            throw new BadRequestException("Could not serialize itinerary.");
        }
    }
}
