package com.voyara.mapper;

import com.voyara.dto.AuthorSummary;
import com.voyara.dto.PostResponse;
import com.voyara.entity.Post;
import com.voyara.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PostMapper {

    public PostResponse toResponse(Post post) {
        List<String> likeUsernames = post.getLikes().stream()
                .map(User::getUsername)
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getAuthor().getId())
                .author(AuthorSummary.from(post.getAuthor()))
                .image(post.getImage())
                .caption(post.getCaption())
                .location(post.getLocation())
                .likes(likeUsernames)
                .createdAt(post.getCreatedAt() == null ? null : post.getCreatedAt().toString() + "Z")
                .build();
    }
}
