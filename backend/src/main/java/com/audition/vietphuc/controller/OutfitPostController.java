package com.audition.vietphuc.controller;

import com.audition.vietphuc.dto.CreatePostRequest;
import com.audition.vietphuc.model.OutfitPost;
import com.audition.vietphuc.service.OutfitPostService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/outfits")
@CrossOrigin(origins = "*")
public class OutfitPostController {

    private final OutfitPostService outfitPostService;

    public OutfitPostController(OutfitPostService outfitPostService) {
        this.outfitPostService = outfitPostService;
    }

    @GetMapping
    public ResponseEntity<List<OutfitPost>> getFeedPosts(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(outfitPostService.getFeedPosts(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutfitPost> getPostById(@PathVariable Long id) {
        return outfitPostService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<OutfitPost>> getUserPosts(@PathVariable String username) {
        try {
            return ResponseEntity.ok(outfitPostService.getUserPosts(username));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @Valid @RequestBody CreatePostRequest request,
            @RequestHeader(value = "X-User-Username", defaultValue = "vietphuc_slayer") String username) {
        try {
            OutfitPost created = outfitPostService.createPost(request, username);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        try {
            OutfitPost updated = outfitPostService.likePost(id);
            return ResponseEntity.ok(Map.of("id", updated.getId(), "likesCount", updated.getLikesCount()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
