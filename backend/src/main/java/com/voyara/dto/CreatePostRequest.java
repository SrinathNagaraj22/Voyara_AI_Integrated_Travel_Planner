package com.voyara.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotBlank
    @Size(max = 2048)
    private String image;

    @Size(max = 2000)
    private String caption;

    @Size(max = 255)
    private String location;
}
