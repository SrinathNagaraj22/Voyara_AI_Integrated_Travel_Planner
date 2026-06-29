package com.voyara.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RespondToRequestRequest {

    @NotBlank
    @Pattern(regexp = "accepted|rejected", flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "must be 'accepted' or 'rejected'")
    private String status;
}
