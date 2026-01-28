package com.sparkchat.controller;

import com.sparkchat.dto.*;
import com.sparkchat.model.User;
import com.sparkchat.security.JwtUtils;
import com.sparkchat.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    
    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        try {
            System.out.println("Login attempt for username: " + loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );
            
            System.out.println("Authentication successful for: " + loginRequest.getUsername());
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken((User) authentication.getPrincipal());
            
            User user = (User) authentication.getPrincipal();
            UserDto userDto = UserDto.fromUser(user);
            
            // Update user online status
            userService.updateUserOnlineStatus(user.getId(), true);
            
            return ResponseEntity.ok(new AuthResponse(jwt, userDto));
        } catch (Exception e) {
            System.out.println("Login failed for username: " + loginRequest.getUsername() + ", Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: Invalid username or password!"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            User user = userService.createUser(signUpRequest);
            UserDto userDto = UserDto.fromUser(user);
            
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(Authentication authentication) {
        if (authentication != null) {
            User user = (User) authentication.getPrincipal();
            userService.updateUserOnlineStatus(user.getId(), false);
        }
        return ResponseEntity.ok(new MessageResponse("User logged out successfully!"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: User not authenticated!"));
        }
        
        User user = (User) authentication.getPrincipal();
        UserDto userDto = UserDto.fromUser(user);
        
        return ResponseEntity.ok(userDto);
    }
}