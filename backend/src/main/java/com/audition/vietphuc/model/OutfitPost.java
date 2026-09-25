package com.audition.vietphuc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "outfit_posts")
public class OutfitPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 150)
    private String event; // Context e.g., "Dạo phố Bùi Viện", "Dự tiệc cưới", "Đi concert rap"

    @Column(columnDefinition = "TEXT")
    private String aiFeedback; // Gatekeeper review with Gen-Z flair and cultural critique

    @Column(nullable = false)
    private Boolean isApproved = true;

    private Integer culturalScore = 85;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnoreProperties({"password", "posts", "email"})
    private User author;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "post_wardrobe_items",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<WardrobeItem> items = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    private Integer likesCount = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public OutfitPost() {
        this.createdAt = LocalDateTime.now();
        this.likesCount = 0;
    }

    public OutfitPost(String title, String event, String aiFeedback, Boolean isApproved, Integer culturalScore, String imageUrl, User author) {
        this.title = title;
        this.event = event;
        this.aiFeedback = aiFeedback;
        this.isApproved = isApproved;
        this.culturalScore = culturalScore;
        this.imageUrl = imageUrl;
        this.author = author;
        this.createdAt = LocalDateTime.now();
        this.likesCount = 0;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.likesCount == null) {
            this.likesCount = 0;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean approved) { isApproved = approved; }

    public Integer getCulturalScore() { return culturalScore; }
    public void setCulturalScore(Integer culturalScore) { this.culturalScore = culturalScore; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public List<WardrobeItem> getItems() { return items; }
    public void setItems(List<WardrobeItem> items) { this.items = items; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
