package com.voyara.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTripRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    private String destination;

    @Size(max = 64)
    private String startDate;

    @Size(max = 64)
    private String endDate;

    @Size(max = 64)
    private String budget;

    @Min(2)
    @Max(50)
    private Integer totalSeats = 4;

    @Size(max = 4000)
    private String description;

    /** Optional embedded itinerary (from AI Planner). Stored as JSON string on the entity. */
    private JsonNode itinerary;
}
