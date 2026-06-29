package com.voyara.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private Long userId;
    private AuthorSummary author;
    private String image;
    private String caption;
    private String location;
    /** Usernames who liked the post (stable identifier independent of numeric id). */
    private List<String> likes;
    private String createdAt;
}
