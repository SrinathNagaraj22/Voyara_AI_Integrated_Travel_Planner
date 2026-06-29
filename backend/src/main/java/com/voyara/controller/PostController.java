package com.voyara.controller;

import com.voyara.dto.CreatePostRequest;
import com.voyara.dto.PostResponse;
import com.voyara.entity.Post;
import com.voyara.entity.User;
import com.voyara.mapper.PostMapper;
import com.voyara.service.PostService;
import com.voyara.web.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final PostMapper postMapper;
    private final AuthenticatedUserResolver currentUser;

    public PostController(
            PostService postService,
            PostMapper postMapper,
            AuthenticatedUserResolver currentUser) {
        this.postService = postService;
        this.postMapper = postMapper;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> list() {
        List<PostResponse> responses = postService.listAll().stream()
                .map(postMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreatePostRequest body) {
        User user = currentUser.require(authentication);
        Post created = postService.create(user, body);
        return ResponseEntity.ok(postMapper.toResponse(created));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            Authentication authentication,
            @PathVariable Long postId) {
        User user = currentUser.require(authentication);
        Post updated = postService.toggleLike(postId, user);
        return ResponseEntity.ok(Map.of("likes", postMapper.toResponse(updated).getLikes()));
    }
}
