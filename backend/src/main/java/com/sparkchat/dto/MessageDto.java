package com.sparkchat.dto;

import com.sparkchat.model.Message;

import java.time.LocalDateTime;

public class MessageDto {
    
    private Long id;
    private String content;
    private UserDto sender;
    private String recipient; // For DM functionality
    private Long chatRoomId;
    private Message.MessageType messageType;
    private String messageTypeString; // For WebSocket compatibility
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Integer selfDestructTimer;
    private LocalDateTime expiresAt;
    private LocalDateTime sentAt;
    private LocalDateTime editedAt;
    
    // Constructors
    public MessageDto() {}
    
    public MessageDto(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sender = new UserDto(message.getSender());
        this.chatRoomId = message.getChatRoom().getId();
        this.messageType = message.getMessageType();
        this.fileUrl = message.getFileUrl();
        this.fileName = message.getFileName();
        this.fileSize = message.getFileSize();
        this.selfDestructTimer = message.getSelfDestructTimer();
        this.expiresAt = message.getExpiresAt();
        this.sentAt = message.getSentAt();
        this.editedAt = message.getEditedAt();
    }
    
    // Static factory method
    public static MessageDto fromMessage(Message message) {
        return new MessageDto(message);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public UserDto getSender() { return sender; }
    public void setSender(UserDto sender) { this.sender = sender; }
    
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    
    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }
    
    public Message.MessageType getMessageType() { return messageType; }
    public void setMessageType(Message.MessageType messageType) { this.messageType = messageType; }
    
    public String getMessageTypeString() { return messageTypeString; }
    public void setMessageTypeString(String messageTypeString) { 
        this.messageTypeString = messageTypeString;
        // Also set the enum if valid
        try {
            this.messageType = Message.MessageType.valueOf(messageTypeString);
        } catch (IllegalArgumentException e) {
            this.messageType = Message.MessageType.TEXT; // Default fallback
        }
    }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public Integer getSelfDestructTimer() { return selfDestructTimer; }
    public void setSelfDestructTimer(Integer selfDestructTimer) { this.selfDestructTimer = selfDestructTimer; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
}