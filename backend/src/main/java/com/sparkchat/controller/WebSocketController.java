package com.sparkchat.controller;

import com.sparkchat.dto.MessageDto;
import com.sparkchat.dto.UserDto;
import com.sparkchat.model.Message;
import com.sparkchat.model.User;
import com.sparkchat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for real-time messaging
 * 
 * Handles WebSocket messages for real-time chat functionality including:
 * - Message broadcasting to chat rooms
 * - Private messaging between users
 * - User connection/disconnection events
 * - Typing indicators
 * 
 * @author Spark.chat Team
 * @version 1.0.0
 */
@Controller
public class WebSocketController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Handle incoming chat messages for DM
     * 
     * @param messageDto The message to be sent
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageDto messageDto, 
                           SimpMessageHeaderAccessor headerAccessor) {
        
        try {
            // Get user from session
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            
            if (username == null || username.isEmpty()) {
                System.err.println("No username in session, using sender from message");
                username = messageDto.getSender() != null ? messageDto.getSender().getUsername() : "anonymous";
            }
            
            // Ensure sender information is set
            if (messageDto.getSender() == null) {
                messageDto.setSender(new UserDto());
            }
            messageDto.getSender().setUsername(username);
            
            // Ensure messageType is set
            if (messageDto.getMessageTypeString() == null || messageDto.getMessageTypeString().isEmpty()) {
                messageDto.setMessageTypeString("TEXT");
            }
            
            System.out.println("Processing DM from: " + username + ", content: " + messageDto.getContent());
            
            // Save message to database
            Message savedMessage = chatService.saveMessage(messageDto);
            
            // Convert back to DTO with updated information
            MessageDto responseDto = chatService.convertToDto(savedMessage);
            
            // Send to recipient only (not to sender to avoid duplicates)
            String recipientUsername = messageDto.getRecipient();
            if (recipientUsername != null && !recipientUsername.equals(username)) {
                messagingTemplate.convertAndSendToUser(
                    recipientUsername, 
                    "/queue/messages", 
                    responseDto
                );
                System.out.println("Message sent to user: " + recipientUsername);
            }
            
        } catch (Exception e) {
            // Log error
            System.err.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Handle user joining a chat room
     * 
     * @param messageDto Join message
     * @param headerAccessor WebSocket session information
     * @return Join notification message
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload MessageDto messageDto,
                       SimpMessageHeaderAccessor headerAccessor) {
        
        // Add username to WebSocket session
        String username = messageDto.getSender().getUsername();
        headerAccessor.getSessionAttributes().put("username", username);
        
        System.out.println("User joined: " + username);
        // Don't broadcast join messages to avoid spam
    }
    
    /**
     * Handle typing indicators
     * 
     * @param typingData Typing indicator data
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Object typingData,
                           SimpMessageHeaderAccessor headerAccessor) {
        
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        
        // Broadcast typing indicator to room
        messagingTemplate.convertAndSend("/topic/typing", 
            "{ \"username\": \"" + username + "\", \"typing\": true }");
    }
    
    /**
     * Send private message to specific user
     * 
     * @param messageDto Private message
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload MessageDto messageDto,
                                  SimpMessageHeaderAccessor headerAccessor) {
        
        String senderUsername = (String) headerAccessor.getSessionAttributes().get("username");
        messageDto.getSender().setUsername(senderUsername);
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(
            messageDto.getSender().getUsername(), 
            "/queue/messages", 
            messageDto
        );
    }
}