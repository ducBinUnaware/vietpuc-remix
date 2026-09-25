package com.audition.vietphuc.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wardrobe_items")
public class WardrobeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // OUTERWEAR, INNERWEAR, BOTTOMS, ACCESSORIES, FOOTWEAR

    @Column(nullable = false, length = 50)
    private String era; // TRIEU_NGUYEN, THOI_LE, THOI_TRAN, THOI_LY, NAM_BO_DAN_GIAN, MODERN_GENZ

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 1000)
    private String description;

    @Column(length = 1500)
    private String culturalContext;

    @Column(nullable = false)
    private boolean isHeritage = true;

    public WardrobeItem() {}

    public WardrobeItem(String name, String category, String era, String imageUrl, String description, String culturalContext, boolean isHeritage) {
        this.name = name;
        this.category = category;
        this.era = era;
        this.imageUrl = imageUrl;
        this.description = description;
        this.culturalContext = culturalContext;
        this.isHeritage = isHeritage;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCulturalContext() { return culturalContext; }
    public void setCulturalContext(String culturalContext) { this.culturalContext = culturalContext; }

    public boolean isHeritage() { return isHeritage; }
    public void setHeritage(boolean heritage) { isHeritage = heritage; }
}
