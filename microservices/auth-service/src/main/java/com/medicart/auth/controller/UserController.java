package com.medicart.auth.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicart.auth.service.AuthService;
import com.medicart.common.dto.RegisterRequest;
import com.medicart.common.dto.UserDTO;

@RestController
@RequestMapping("/auth/users")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private AuthService authService;

    // ===== GET ALL USERS (admin) =====
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<UserDTO> users = authService.getAllUsers();
            log.info("Fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Failed to fetch all users: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        try {
            UserDTO user = (UserDTO) authService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to fetch user - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            UserDTO user = (UserDTO) authService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to fetch user profile - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long requestingUserId,
            @RequestBody RegisterRequest request) {
        try {
            if (!userId.equals(requestingUserId)) {
                log.warn("Unauthorized update attempt - user {} trying to update user {}", requestingUserId, userId);
                return ResponseEntity.status(403).body(java.util.Map.of("error", "Cannot update other user's profile"));
            }

            com.medicart.auth.entity.User updatedUser = authService.updateUser(userId, request);
            
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Profile updated successfully",
                    "user", updatedUser.getFullName()
            ));
        } catch (Exception e) {
            log.error("Failed to update user profile - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // ===== DELETE USER (admin) =====
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            authService.deleteUser(userId);
            log.info("User deleted successfully - userId: {}", userId);
            return ResponseEntity.ok(java.util.Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete user - userId: {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
