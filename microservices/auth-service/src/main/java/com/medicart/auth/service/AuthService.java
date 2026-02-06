package com.medicart.auth.service;

import com.medicart.auth.entity.User;
import com.medicart.auth.repository.UserRepository;
import com.medicart.auth.repository.RoleRepository;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public LoginResponse register(RegisterRequest request) {
        try {
            log.info("🔐 Registration processing for email: {}", request.getEmail());
            
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                log.warn("⚠️ Registration failed - user already exists: {}", request.getEmail());
                throw new RuntimeException("User already exists with this email");
            }

            log.info("✅ Email is available, creating new user");
            
            // Create new user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .isActive(true)
                    .role(roleRepository.findByName("ROLE_USER")
                            .orElseThrow(() -> new RuntimeException("Role not found")))
                    .build();

            user = userRepository.save(user);
            log.info("✅ User created successfully - userId: {}", user.getId());

            // Generate JWT token
            String token = jwtService.generateToken(user);
            log.info("✅ JWT token generated for userId: {}", user.getId());

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .roles(java.util.Arrays.asList(user.getRole().getName()))
                    .build();
        } catch (Exception e) {
            log.error("❌ Registration failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    public LoginResponse login(LoginRequest request) {
        try {
            log.info("🔐 LOGIN ATTEMPT");
            log.info("📧 Email received: {}", request.getEmail());
            log.info("🔑 Password length: {}", request.getPassword() != null ? request.getPassword().length() : "NULL");

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.error("❌ USER NOT FOUND IN DB - Email: {}", request.getEmail());
                        return new RuntimeException("User not found");
                    });

            log.info("✅ User found: {}", user.getEmail());
            log.info("🟢 isActive = {}", user.getIsActive());
            log.info("🎭 Role = {}", user.getRole().getName());

            boolean passwordMatch = passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword()
            );

            log.info("🔍 Password matches? {}", passwordMatch);

            if (!user.getIsActive()) {
                log.error("🚫 ACCOUNT INACTIVE - Email: {}", request.getEmail());
                throw new RuntimeException("User account is inactive");
            }

            if (!passwordMatch) {
                log.error("🚫 INVALID PASSWORD - Email: {}", request.getEmail());
                throw new RuntimeException("Invalid password");
            }

            log.info("✅ PASSWORD OK — GENERATING TOKEN");

            String token = jwtService.generateToken(user);
            log.info("✅ JWT Token generated successfully for userId: {}", user.getId());

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .roles(java.util.List.of(user.getRole().getName()))
                    .build();
        } catch (Exception e) {
            log.error("❌ LOGIN FAILED: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Object getUserById(Long userId) {
        try {
            log.info("👤 Fetching user data for userId: {}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("❌ User not found - userId: {}", userId);
                        return new RuntimeException("User not found");
                    });
            
            log.info("✅ User found - email: {}, name: {}", user.getEmail(), user.getFullName());
            
            return com.medicart.common.dto.UserDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .isActive(user.getIsActive())
                    .role(user.getRole().getName())
                    .build();
        } catch (Exception e) {
            log.error("❌ Error fetching user (userId: {}): {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public User updateUser(Long userId, RegisterRequest request) {
        try {
            log.info("✏️ Updating user - userId: {}", userId);
            log.info("   Full Name: {}", request.getFullName());
            log.info("   Phone: {}", request.getPhone());
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("❌ User not found for update - userId: {}", userId);
                        return new RuntimeException("User not found");
                    });

            user.setFullName(request.getFullName());
            user.setPhone(request.getPhone());

            user = userRepository.save(user);
            log.info("✅ User updated successfully - userId: {}", userId);
            
            return user;
        } catch (Exception e) {
            log.error("❌ Error updating user (userId: {}): {}", userId, e.getMessage(), e);
            throw e;
        }
    }
}
