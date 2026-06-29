package com.voyara.service;

import com.voyara.dto.RespondToRequestRequest;
import com.voyara.entity.JoinRequest;
import com.voyara.entity.Trip;
import com.voyara.entity.User;
import com.voyara.exception.ForbiddenException;
import com.voyara.exception.NotFoundException;
import com.voyara.repository.JoinRequestRepository;
import com.voyara.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final TripRepository tripRepository;

    public JoinRequestService(
            JoinRequestRepository joinRequestRepository,
            TripRepository tripRepository) {
        this.joinRequestRepository = joinRequestRepository;
        this.tripRepository = tripRepository;
    }

    public List<JoinRequest> listForUser(User viewer) {
        return joinRequestRepository.findBySenderOrHost(viewer, viewer);
    }

    /**
     * Accepting a join request is two writes — update the request, then add the
     * sender to the trip's member set and bump occupied seats. Both happen in
     * a single transaction.
     */
    @Transactional
    public JoinRequest respond(Long requestId, User actingHost, RespondToRequestRequest body) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found."));

        if (!request.getHost().getId().equals(actingHost.getId())) {
            throw new ForbiddenException("Only the trip host can respond to this proposal.");
        }

        String status = body.getStatus().toLowerCase();
        request.setStatus(status);
        joinRequestRepository.save(request);

        if ("accepted".equals(status)) {
            Trip trip = request.getTrip();
            boolean alreadyMember = trip.getMembers().stream()
                    .anyMatch(m -> m.getId().equals(request.getSender().getId()));
            if (!alreadyMember) {
                trip.getMembers().add(request.getSender());
                trip.setOccupiedSeats(Math.min(trip.getTotalSeats(), trip.getOccupiedSeats() + 1));
                tripRepository.save(trip);
            }
        }
        return request;
    }
}
