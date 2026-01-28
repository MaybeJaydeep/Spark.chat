package com.sparkchat.dto;

import com.sparkchat.model.User;

import java.time.LocalDateTime;

public class UserDto {
    
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String profilePictureUrl;
    private boolean isOnline;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserDto() {}
    
    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.displayName = user.getDisplayName();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.isOnline = user.isOnline();
        this.lastSeen = user.getLastSeen();
        this.createdAt = user.getCreatedAt();
    }
    
    // Static factory method
    public static UserDto fromUser(User user) {
        return new UserDto(user);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }
    
    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}