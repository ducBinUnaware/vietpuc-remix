package com.audition.vietphuc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class EvaluationRequest {

    @NotBlank(message = "Event context cannot be empty")
    private String event; // e.g., "Dạo phố Bùi Viện", "Dự tiệc cưới", "Đi concert rap"

    @NotEmpty(message = "Please select at least one wardrobe item")
    private List<Long> itemIds;

    private String remixStyle; // e.g., "Cyberpunk Y2K", "Vintage Royal", "Street Casual"
    private String customNotes; // User's personal description or styling intent

    public EvaluationRequest() {}

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public List<Long> getItemIds() { return itemIds; }
    public void setItemIds(List<Long> itemIds) { this.itemIds = itemIds; }

    public String getRemixStyle() { return remixStyle; }
    public void setRemixStyle(String remixStyle) { this.remixStyle = remixStyle; }

    public String getCustomNotes() { return customNotes; }
    public void setCustomNotes(String customNotes) { this.customNotes = customNotes; }
}
