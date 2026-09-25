package com.audition.vietphuc.service;

import com.audition.vietphuc.dto.CreatePostRequest;
import com.audition.vietphuc.model.OutfitPost;
import com.audition.vietphuc.model.User;
import com.audition.vietphuc.model.WardrobeItem;
import com.audition.vietphuc.repository.OutfitPostRepository;
import com.audition.vietphuc.repository.UserRepository;
import com.audition.vietphuc.repository.WardrobeItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OutfitPostService {

    private final OutfitPostRepository outfitPostRepository;
    private final UserRepository userRepository;
    private final WardrobeItemRepository wardrobeItemRepository;

    public OutfitPostService(OutfitPostRepository outfitPostRepository, UserRepository userRepository, WardrobeItemRepository wardrobeItemRepository) {
        this.outfitPostRepository = outfitPostRepository;
        this.userRepository = userRepository;
        this.wardrobeItemRepository = wardrobeItemRepository;
    }

    public List<OutfitPost> getFeedPosts(String search) {
        if (search != null && !search.isBlank()) {
            return outfitPostRepository.searchPosts(search.trim());
        }
        return outfitPostRepository.findByIsApprovedTrueOrderByCreatedAtDesc();
    }

    public List<OutfitPost> getUserPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return outfitPostRepository.findByAuthorOrderByCreatedAtDesc(user);
    }

    public Optional<OutfitPost> getPostById(Long id) {
        return outfitPostRepository.findById(id);
    }

    public OutfitPost createPost(CreatePostRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Author not found: " + username));

        List<WardrobeItem> items = wardrobeItemRepository.findAllById(request.getItemIds());

        OutfitPost post = new OutfitPost();
        post.setTitle(request.getTitle());
        post.setEvent(request.getEvent());
        post.setAiFeedback(request.getAiFeedback());
        post.setIsApproved(request.getIsApproved() != null ? request.getIsApproved() : true);
        post.setCulturalScore(request.getCulturalScore() != null ? request.getCulturalScore() : 85);
        post.setImageUrl(request.getImageUrl());
        post.setAuthor(author);
        post.setItems(items);
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }

        return outfitPostRepository.save(post);
    }

    public OutfitPost likePost(Long id) {
        OutfitPost post = outfitPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setLikesCount(post.getLikesCount() + 1);
        return outfitPostRepository.save(post);
    }
}
