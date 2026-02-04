package com.medicart.auth.controller;

import com.medicart.auth.service.AuthService;
import com.medicart.common.dto.UserDTO;
import com.medicart.common.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/users")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private AuthService authService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        try {
            log.info("👤 Fetching user details for userId: {}", userId);
            UserDTO user = (UserDTO) authService.getUserById(userId);
            log.info("✅ User details retrieved for userId: {}", userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("❌ Failed to fetch user (userId: {}): {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("👤 Fetching user profile for userId: {}", userId);
            UserDTO user = (UserDTO) authService.getUserById(userId);
            log.info("✅ User profile retrieved for userId: {}", userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("❌ Failed to fetch user profile (userId: {}): {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long requestingUserId,
            @RequestBody RegisterRequest request) {
        try {
            log.info("✏️ Update user profile attempt for userId: {}", userId);
            log.info("   Requesting user ID: {}", requestingUserId);
            
            // Verify user is updating their own profile
            if (!userId.equals(requestingUserId)) {
                log.warn("⚠️ Unauthorized update attempt - user {} trying to update user {}", requestingUserId, userId);
                return ResponseEntity.status(403).body(java.util.Map.of("error", "Cannot update other user's profile"));
            }

            com.medicart.auth.entity.User updatedUser = authService.updateUser(userId, request);
            log.info("✅ User profile updated successfully for userId: {}", userId);
            
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Profile updated successfully",
                    "user", updatedUser.getFullName()
            ));
        } catch (Exception e) {
            log.error("❌ Failed to update user profile (userId: {}): {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
