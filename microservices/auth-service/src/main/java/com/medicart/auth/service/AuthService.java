package com.medicart.auth.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicart.auth.entity.User;
import com.medicart.auth.repository.RoleRepository;
import com.medicart.auth.repository.UserRepository;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;

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
        log.info("Registration attempt for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists with this email");
        }

        com.medicart.auth.entity.Role role = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    com.medicart.auth.entity.Role newRole = new com.medicart.auth.entity.Role();
                    newRole.setName("ROLE_USER");
                    newRole.setDescription("Standard user role");
                    return roleRepository.save(newRole);
                });

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .role(role)
                .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        log.info("User registered successfully - userId: {}", user.getId());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(java.util.Arrays.asList(user.getRole().getName()))
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user);
        log.info("Login successful - userId: {}, role: {}", user.getId(), user.getRole().getName());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(java.util.List.of(user.getRole().getName()))
                .build();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Object getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return com.medicart.common.dto.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .isActive(user.getIsActive())
                .role(user.getRole().getName())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public List<com.medicart.common.dto.UserDTO> getAllUsers() {
        log.info("Fetching all users from database");
        return userRepository.findAll().stream()
                .map(user -> com.medicart.common.dto.UserDTO.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phone(user.getPhone())
                        .isActive(user.getIsActive())
                        .role(user.getRole().getName())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
        log.info("User deleted - userId: {}", userId);
    }

    public User updateUser(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        user = userRepository.save(user);
        log.info("User profile updated - userId: {}", userId);
        return user;
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset successfully for email: {}", email);
    }
}
