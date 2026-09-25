package com.audition.vietphuc.controller;

import com.audition.vietphuc.model.WardrobeItem;
import com.audition.vietphuc.service.WardrobeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wardrobe")
@CrossOrigin(origins = "*")
public class WardrobeController {

    private final WardrobeService wardrobeService;

    public WardrobeController(WardrobeService wardrobeService) {
        this.wardrobeService = wardrobeService;
    }

    @GetMapping
    public ResponseEntity<List<WardrobeItem>> getAllItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String era) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(wardrobeService.getByCategory(category));
        }
        if (era != null && !era.isBlank()) {
            return ResponseEntity.ok(wardrobeService.getByEra(era));
        }
        return ResponseEntity.ok(wardrobeService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WardrobeItem> getItemById(@PathVariable Long id) {
        return wardrobeService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
