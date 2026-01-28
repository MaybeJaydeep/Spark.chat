package com.sparkchat.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "encrypted_content", columnDefinition = "TEXT")
    private String encryptedContent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    // Self-destructing message feature
    @Column(name = "self_destruct_timer")
    private Integer selfDestructTimer; // in seconds
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "edited_at")
    private LocalDateTime editedAt;
    
    // Constructors
    public Message() {}
    
    public Message(String content, User sender, ChatRoom chatRoom) {
        this.content = content;
        this.sender = sender;
        this.chatRoom = chatRoom;
        this.sentAt = LocalDateTime.now();
    }
    
    public Message(String content, User sender, ChatRoom chatRoom, Integer selfDestructTimer) {
        this(content, sender, chatRoom);
        this.selfDestructTimer = selfDestructTimer;
        if (selfDestructTimer != null && selfDestructTimer > 0) {
            this.expiresAt = LocalDateTime.now().plusSeconds(selfDestructTimer);
        }
    }
    
    // Enum for message types
    public enum MessageType {
        TEXT, IMAGE, FILE, AUDIO
    }
    
    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean hasSelfDestructTimer() {
        return selfDestructTimer != null && selfDestructTimer > 0;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getEncryptedContent() { return encryptedContent; }
    public void setEncryptedContent(String encryptedContent) { this.encryptedContent = encryptedContent; }
    
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    
    public ChatRoom getChatRoom() { return chatRoom; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }
    
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public Integer getSelfDestructTimer() { return selfDestructTimer; }
    public void setSelfDestructTimer(Integer selfDestructTimer) { 
        this.selfDestructTimer = selfDestructTimer;
        if (selfDestructTimer != null && selfDestructTimer > 0) {
            this.expiresAt = LocalDateTime.now().plusSeconds(selfDestructTimer);
        }
    }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    
    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}