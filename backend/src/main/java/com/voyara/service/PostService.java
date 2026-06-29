package com.voyara.service;

import com.voyara.dto.CreatePostRequest;
import com.voyara.entity.Post;
import com.voyara.entity.User;
import com.voyara.exception.NotFoundException;
import com.voyara.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> listAll() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Post create(User author, CreatePostRequest req) {
        String location = (req.getLocation() == null || req.getLocation().isBlank())
                ? "Global coordinates" : req.getLocation();
        Post post = Post.builder()
                .author(author)
                .caption(req.getCaption())
                .image(req.getImage())
                .location(location)
                .likes(new HashSet<>())
                .build();
        return postRepository.save(post);
    }

    @Transactional
    public Post toggleLike(Long postId, User viewer) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found."));
        boolean alreadyLiked = post.getLikes().stream()
                .anyMatch(u -> u.getId().equals(viewer.getId()));
        if (alreadyLiked) {
            post.getLikes().removeIf(u -> u.getId().equals(viewer.getId()));
        } else {
            post.getLikes().add(viewer);
        }
        return postRepository.save(post);
    }
}
