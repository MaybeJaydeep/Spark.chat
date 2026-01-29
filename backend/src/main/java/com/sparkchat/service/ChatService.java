package com.sparkchat.service;

import com.sparkchat.dto.MessageDto;
import com.sparkchat.dto.UserDto;
import com.sparkchat.model.ChatRoom;
import com.sparkchat.model.Message;
import com.sparkchat.model.User;
import com.sparkchat.repository.ChatRoomRepository;
import com.sparkchat.repository.MessageRepository;
import com.sparkchat.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing chat operations
 * 
 * This service will handle:
 * - Creating and managing chat rooms
 * - Sending and receiving messages
 * - Real-time message broadcasting
 * - Message history retrieval
 * - Self-destructing message management
 * 
 * TODO: Implement full chat functionality
 */
@Service
@Transactional
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    
    public ChatService(ChatRoomRepository chatRoomRepository, 
                      MessageRepository messageRepository,
                      UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Save a WebSocket message to database (for DM functionality)
     */
    public Message saveMessage(MessageDto messageDto) {
        try {
            // Find the user by username
            Optional<User> userOpt = userRepository.findByUsername(messageDto.getSender().getUsername());
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found: " + messageDto.getSender().getUsername());
            }
            
            User sender = userOpt.get();
            
            // For DM messages, create a special DM chat room or use a different approach
            ChatRoom dmRoom = getOrCreateDmChatRoom(messageDto.getSender().getUsername(), messageDto.getRecipient());
            
            // Create and save message
            Message message = new Message();
            message.setContent(messageDto.getContent());
            message.setSender(sender);
            message.setChatRoom(dmRoom);
            
            // Handle message type
            String messageTypeStr = messageDto.getMessageTypeString();
            if (messageTypeStr == null || messageTypeStr.isEmpty()) {
                messageTypeStr = "TEXT";
            }
            message.setMessageType(Message.MessageType.valueOf(messageTypeStr));
            message.setSentAt(LocalDateTime.now());
            
            return messageRepository.save(message);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to save message: " + e.getMessage());
        }
    }
    
    /**
     * Get or create a DM chat room between two users
     */
    private ChatRoom getOrCreateDmChatRoom(String user1, String user2) {
        // Create a consistent room name regardless of order
        String roomName = user1.compareTo(user2) < 0 ? 
            "DM_" + user1 + "_" + user2 : 
            "DM_" + user2 + "_" + user1;
            
        Optional<ChatRoom> dmRoom = chatRoomRepository.findByName(roomName);
        
        if (dmRoom.isPresent()) {
            return dmRoom.get();
        }
        
        // Create new DM chat room
        ChatRoom newRoom = new ChatRoom();
        newRoom.setName(roomName);
        newRoom.setDescription("Direct message between " + user1 + " and " + user2);
        newRoom.setCreatedAt(LocalDateTime.now());
        
        return chatRoomRepository.save(newRoom);
    }
    
    /**
     * Get or create the default public chat room
     */
    private ChatRoom getOrCreatePublicChatRoom() {
        Optional<ChatRoom> publicRoom = chatRoomRepository.findByName("Public Chat");
        
        if (publicRoom.isPresent()) {
            return publicRoom.get();
        }
        
        // Create default public chat room
        ChatRoom newRoom = new ChatRoom();
        newRoom.setName("Public Chat");
        newRoom.setDescription("Default public chat room for all users");
        newRoom.setCreatedAt(LocalDateTime.now());
        
        return chatRoomRepository.save(newRoom);
    }
    
    /**
     * Convert Message entity to MessageDto
     */
    public MessageDto convertToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setContent(message.getContent());
        dto.setMessageTypeString(message.getMessageType().name());
        dto.setSentAt(message.getSentAt());
        
        // Set sender information
        UserDto senderDto = new UserDto();
        senderDto.setUsername(message.getSender().getUsername());
        senderDto.setDisplayName(message.getSender().getDisplayName());
        dto.setSender(senderDto);
        
        return dto;
    }
    
    /**
     * Send a message to a chat room
     * TODO: Implement message sending with real-time broadcasting
     */
    public MessageDto sendMessage(String content, Long chatRoomId, User sender) {
        // Implementation coming soon
        return null;
    }
    
    /**
     * Get message history for a chat room
     */
    public List<MessageDto> getMessageHistory(Long chatRoomId, int page, int size) {
        try {
            ChatRoom chatRoom;
            if (chatRoomId != null) {
                Optional<ChatRoom> roomOpt = chatRoomRepository.findById(chatRoomId);
                if (roomOpt.isEmpty()) {
                    throw new RuntimeException("Chat room not found");
                }
                chatRoom = roomOpt.get();
            } else {
                // Get or create public chat room
                chatRoom = getOrCreatePublicChatRoom();
            }
            
            // Get recent messages (for now, get last 50 messages)
            List<Message> messages = messageRepository.findByChatRoomOrderBySentAtDesc(chatRoom, 
                org.springframework.data.domain.PageRequest.of(0, 50));
            
            // Reverse to show oldest first
            Collections.reverse(messages);
            
            return messages.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to get message history: " + e.getMessage());
        }
    }
    
    /**
     * Get DM history between two users
     */
    public List<MessageDto> getDmHistory(String user1, String user2, int page, int size) {
        try {
            // Find both users
            Optional<User> user1Opt = userRepository.findByUsername(user1);
            Optional<User> user2Opt = userRepository.findByUsername(user2);
            
            if (user1Opt.isEmpty() || user2Opt.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Get the DM chat room
            ChatRoom dmRoom = getOrCreateDmChatRoom(user1, user2);
            
            // Get messages from the DM room
            List<Message> dmMessages = messageRepository.findByChatRoomOrderBySentAtAsc(dmRoom, 
                org.springframework.data.domain.PageRequest.of(page, size));
            
            return dmMessages.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to get DM history: " + e.getMessage());
        }
    }
    
    /**
     * Get user's chat rooms
     * TODO: Implement user chat room retrieval
     */
    public List<ChatRoom> getUserChatRooms(Long userId) {
        // Implementation coming soon
        return null;
    }
    
    /**
     * Handle self-destructing messages
     * TODO: Implement message expiration logic
     */
    public void processExpiredMessages() {
        // Implementation coming soon
    }
}