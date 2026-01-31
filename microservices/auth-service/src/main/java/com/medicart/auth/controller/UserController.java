package com.medicart.auth.controller;

import com.medicart.common.dto.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/users")
@CrossOrigin(origins = "*")
public class UserController {

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        UserDTO user = new UserDTO();
        user.setId(userId);
        user.setEmail("user@example.com");
        user.setFullName("User Name");
        user.setPhone("9876543210");
        user.setIsActive(true);
        user.setRole("ROLE_USER");
        return ResponseEntity.ok(user);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(
            @RequestHeader("X-User-Id") Long userId) {
        UserDTO user = new UserDTO();
        user.setId(userId);
        return ResponseEntity.ok(user);
    }
}
