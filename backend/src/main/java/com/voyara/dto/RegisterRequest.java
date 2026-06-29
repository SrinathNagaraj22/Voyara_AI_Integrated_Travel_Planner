package com.voyara.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 32)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "must be alphanumeric or underscore")
    private String username;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 8, max = 128, message = "must be between 8 and 128 characters")
    private String password;

    @Size(max = 2000)
    private String bio;

    @Size(max = 255)
    private String location;

    @Size(max = 1024)
    private String avatarUrl;
}
