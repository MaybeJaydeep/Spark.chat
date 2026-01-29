package com.sparkchat.controller;

import com.sparkchat.dto.MessageDto;
import com.sparkchat.model.User;
import com.sparkchat.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for chat operations
 * 
 * Handles HTTP requests for chat functionality including:
 * - Chat room management
 * - Message operations
 * - File uploads
 * - Message history retrieval
 * 
 * @author Spark.chat Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    /**
     * Get user's chat rooms
     * 
     * @param authentication Current user authentication
     * @return List of user's chat rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<?> getUserChatRooms(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body("Authentication required");
        }
        // Implementation will be added in next iteration
        return ResponseEntity.ok("Chat rooms endpoint - Coming soon!");
    }
    
    /**
     * Get message history for a chat room
     * 
     * @param roomId Chat room ID (optional, defaults to public chat)
     * @param page Page number for pagination
     * @param size Page size
     * @param authentication Current user authentication
     * @return Paginated message history
     */
    @GetMapping("/messages")
    public ResponseEntity<?> getMessageHistory(
            @RequestParam(required = false) Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        try {
            if (authentication == null) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            List<MessageDto> messages = chatService.getMessageHistory(roomId, page, size);
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get message history: " + e.getMessage());
        }
    }
    
    /**
     * Get DM history between current user and another user
     */
    @GetMapping("/dm/{username}")
    public ResponseEntity<?> getDmHistory(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        
        try {
            if (authentication == null) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            String currentUsername = authentication.getName();
            List<MessageDto> messages = chatService.getDmHistory(currentUsername, username, page, size);
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get DM history: " + e.getMessage());
        }
    }
    
    /**
     * Send a new message
     * 
     * @param messageRequest Message content and metadata
     * @param authentication Current user authentication
     * @return Created message
     */
    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(
            @RequestBody Object messageRequest,
            Authentication authentication) {
        // Implementation will be added in next iteration
        return ResponseEntity.ok("Send message endpoint - Coming soon!");
    }
    
    /**
     * Create a new chat room
     * 
     * @param roomRequest Chat room details
     * @param authentication Current user authentication
     * @return Created chat room
     */
    @PostMapping("/rooms")
    public ResponseEntity<?> createChatRoom(
            @RequestBody Object roomRequest,
            Authentication authentication) {
        // Implementation will be added in next iteration
        return ResponseEntity.ok("Create chat room endpoint - Coming soon!");
    }
}