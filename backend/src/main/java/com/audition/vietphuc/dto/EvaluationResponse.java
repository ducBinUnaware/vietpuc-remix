package com.audition.vietphuc.dto;

import java.util.List;

public class EvaluationResponse {
    private String status; // APPROVED, REJECTED
    private int culturalScore; // 0 - 100
    private String gatekeeperTitle; // e.g. "Chị Gatekeeper Thần Cung", "Bà Trùm Di Sản", etc.
    private String feedback; // Witty Gen-Z feedback with cultural critiques
    private String culturalNotes; // In-depth historical rules & historical significance
    private String stylingTips; // How to elevate or fix the outfit
    private List<String> hashtags; // e.g. #VietPhucRemix, #AoNhatBinh, #GenZHeritage
    private boolean isApproved;

    public EvaluationResponse() {}

    public EvaluationResponse(String status, int culturalScore, String gatekeeperTitle, String feedback, String culturalNotes, String stylingTips, List<String> hashtags, boolean isApproved) {
        this.status = status;
        this.culturalScore = culturalScore;
        this.gatekeeperTitle = gatekeeperTitle;
        this.feedback = feedback;
        this.culturalNotes = culturalNotes;
        this.stylingTips = stylingTips;
        this.hashtags = hashtags;
        this.isApproved = isApproved;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCulturalScore() { return culturalScore; }
    public void setCulturalScore(int culturalScore) { this.culturalScore = culturalScore; }

    public String getGatekeeperTitle() { return gatekeeperTitle; }
    public void setGatekeeperTitle(String gatekeeperTitle) { this.gatekeeperTitle = gatekeeperTitle; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getCulturalNotes() { return culturalNotes; }
    public void setCulturalNotes(String culturalNotes) { this.culturalNotes = culturalNotes; }

    public String getStylingTips() { return stylingTips; }
    public void setStylingTips(String stylingTips) { this.stylingTips = stylingTips; }

    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }

    public boolean isApproved() { return isApproved; }
    public void setApproved(boolean approved) { isApproved = approved; }
}
