package com.voyara.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private Long creatorId;
    private String creatorName;
    private String creatorAvatar;
    private AuthorSummary creator;
    private String title;
    private String destination;
    private String startDate;
    private String endDate;
    private String budget;
    private Integer totalSeats;
    private Integer occupiedSeats;
    private String description;
    private JsonNode itinerary;
    private List<Long> members;
    private List<TripMemberSummary> memberDetails;
}
