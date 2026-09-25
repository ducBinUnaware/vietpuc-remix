package com.audition.vietphuc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CreatePostRequest {
    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Event context cannot be empty")
    private String event;

    private String aiFeedback;
    private Boolean isApproved;
    private Integer culturalScore;

    @NotBlank(message = "Image URL cannot be empty")
    private String imageUrl;

    @NotEmpty(message = "Items list cannot be empty")
    private List<Long> itemIds;

    private List<String> tags;

    public CreatePostRequest() {}

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

    public List<Long> getItemIds() { return itemIds; }
    public void setItemIds(List<Long> itemIds) { this.itemIds = itemIds; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
