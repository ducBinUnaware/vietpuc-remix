package com.audition.vietphuc.repository;

import com.audition.vietphuc.model.WardrobeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardrobeItemRepository extends JpaRepository<WardrobeItem, Long> {
    List<WardrobeItem> findByCategory(String category);
    List<WardrobeItem> findByEra(String era);
    List<WardrobeItem> findByIsHeritage(boolean isHeritage);
}
