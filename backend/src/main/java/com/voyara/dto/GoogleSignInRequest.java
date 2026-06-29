package com.voyara.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleSignInRequest {

    @NotBlank
    private String credential;
}
