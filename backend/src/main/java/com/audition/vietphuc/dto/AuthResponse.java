package com.audition.vietphuc.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String bio;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, String token, Long userId, String username, String fullName, String email, String avatarUrl, String bio) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
    }

    public static AuthResponse success(String token, Long userId, String username, String fullName, String email, String avatarUrl, String bio) {
        return new AuthResponse(true, "Authentication successful", token, userId, username, fullName, email, avatarUrl, bio);
    }

    public static AuthResponse error(String message) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
