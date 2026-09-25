package com.audition.vietphuc.repository;

import com.audition.vietphuc.model.OutfitPost;
import com.audition.vietphuc.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutfitPostRepository extends JpaRepository<OutfitPost, Long> {

    List<OutfitPost> findByIsApprovedTrueOrderByCreatedAtDesc();

    List<OutfitPost> findByAuthorOrderByCreatedAtDesc(User author);

    @Query("SELECT p FROM OutfitPost p WHERE p.isApproved = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.event) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.aiFeedback) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<OutfitPost> searchPosts(@Param("keyword") String keyword);
}
