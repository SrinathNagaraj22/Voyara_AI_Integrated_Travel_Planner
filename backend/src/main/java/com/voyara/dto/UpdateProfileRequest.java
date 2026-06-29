package com.voyara.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 32)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "must be alphanumeric or underscore")
    private String username;

    @Size(max = 2000)
    private String bio;

    @Size(max = 255)
    private String location;

    @Size(max = 1024)
    private String avatarUrl;
}
