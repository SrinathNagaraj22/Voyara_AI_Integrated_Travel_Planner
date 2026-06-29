package com.voyara.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinTripRequest {

    @Size(max = 2000)
    private String message;
}
