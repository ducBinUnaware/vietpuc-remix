package com.audition.vietphuc.service;

import com.audition.vietphuc.model.WardrobeItem;
import com.audition.vietphuc.repository.WardrobeItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WardrobeService {

    private final WardrobeItemRepository wardrobeItemRepository;

    public WardrobeService(WardrobeItemRepository wardrobeItemRepository) {
        this.wardrobeItemRepository = wardrobeItemRepository;
    }

    public List<WardrobeItem> getAllItems() {
        return wardrobeItemRepository.findAll();
    }

    public List<WardrobeItem> getByCategory(String category) {
        return wardrobeItemRepository.findByCategory(category);
    }

    public List<WardrobeItem> getByEra(String era) {
        return wardrobeItemRepository.findByEra(era);
    }

    public Optional<WardrobeItem> getItemById(Long id) {
        return wardrobeItemRepository.findById(id);
    }

    public WardrobeItem saveItem(WardrobeItem item) {
        return wardrobeItemRepository.save(item);
    }
}
