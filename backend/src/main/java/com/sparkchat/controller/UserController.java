package com.sparkchat.controller;

import com.sparkchat.dto.UserDto;
import com.sparkchat.model.User;
import com.sparkchat.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for user operations
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Get all users (for contact list)
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            String currentUsername = authentication.getName();
            List<User> users = userService.getAllUsersExcept(currentUsername);
            
            List<UserDto> userDtos = users.stream()
                    .map(user -> {
                        UserDto dto = new UserDto();
                        dto.setUsername(user.getUsername());
                        dto.setDisplayName(user.getDisplayName());
                        dto.setEmail(user.getEmail());
                        return dto;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(userDtos);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get users: " + e.getMessage());
        }
    }
    
    /**
     * Search user by username
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUser(@RequestParam String username, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.badRequest().body("Authentication required");
            }
            
            String currentUsername = authentication.getName();
            if (username.equals(currentUsername)) {
                return ResponseEntity.badRequest().body("Cannot add yourself");
            }
            
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            UserDto userDto = new UserDto();
            userDto.setUsername(user.getUsername());
            userDto.setDisplayName(user.getDisplayName());
            userDto.setEmail(user.getEmail());
            
            return ResponseEntity.ok(userDto);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to search user: " + e.getMessage());
        }
    }
}