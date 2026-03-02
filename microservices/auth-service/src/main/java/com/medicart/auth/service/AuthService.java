/*
 * ========================================
 * AUTH SERVICE - BUSINESS LOGIC
 * ========================================
 * This class contains all the business logic for authentication and user management.
 * 
 * WHAT THIS SERVICE DOES:
 * - Register new users
 * - Login existing users
 * - Generate JWT tokens
 * - Manage user profiles
 * - Reset passwords
 * - Provide user analytics
 * 
 * HOW IT WORKS:
 * Controllers call this service → Service processes the request → 
 * Service uses Repository to access database → Returns result to Controller
 * 
 * ANNOTATIONS EXPLAINED:
 * @Service - Tells Spring this is a business logic component
 * @Autowired - Automatically injects dependencies (Spring creates and provides them)
 */

package com.medicart.auth.service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    // Database access for users
    @Autowired
    private UserRepository userRepository;

    // Database access for roles
    @Autowired
    private RoleRepository roleRepository;

    // Used to encrypt passwords (never store plain text passwords!)
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Used to generate JWT tokens for authentication
    @Autowired
    private JwtService jwtService;

    /**
     * REGISTER NEW USER
     * Creates a new user account in the database
     * 
     * STEPS:
     * 1. Check if email already exists (prevent duplicates)
     * 2. Get or create ROLE_USER role
     * 3. Encrypt the password
     * 4. Save user to database
     * 5. Generate JWT token
     * 6. Return login response with token
     */
    public LoginResponse register(RegisterRequest request) {

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists with this email");
        }

        // Get ROLE_USER from database, or create it if it doesn't exist
        com.medicart.auth.entity.Role role = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    com.medicart.auth.entity.Role newRole = new com.medicart.auth.entity.Role();
                    newRole.setName("ROLE_USER");
                    newRole.setDescription("Standard user role");
                    return roleRepository.save(newRole);
                });

        // Create new user with encrypted password
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encrypt password!
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .role(role)
                .build();

        // Save user to database
        user = userRepository.save(user);
        
        // Generate JWT token for this user
        String token = jwtService.generateToken(user);

        // Return response with token and user info
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600L) // Token expires in 1 hour
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(java.util.Arrays.asList(user.getRole().getName()))
                .build();
    }

    /**
     * LOGIN USER
     * Authenticates user and returns JWT token
     * 
     * STEPS:
     * 1. Find user by email
     * 2. Check if account is active
     * 3. Verify password matches
     * 4. Generate JWT token
     * 5. Return login response
     */
    public LoginResponse login(LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Verify password (compare encrypted passwords)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Return response with token and user info
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600L) //(1 hour)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(java.util.List.of(user.getRole().getName())) // this is a list of role names (e.g. ["ROLE_USER"]) 
                .build();
    }

    /**
     * FIND USER BY EMAIL
     * Returns Optional<User> - might be empty if user doesn't exist
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * GET USER BY ID
     * Returns user information as DTO (Data Transfer Object)
     * DTO = simplified version of User without sensitive data
     */
    public Object getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Convert User entity to UserDTO (without password)
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

    /**
     * GET ALL USERS
     * Returns list of all users (for admin panel)
     */
    public List<com.medicart.common.dto.UserDTO> getAllUsers() {
        
        // Get all users and convert each to UserDTO
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

    /**
     * DELETE USER
     * Removes user from database (admin function)
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    /**
     * UPDATE USER PROFILE
     * Updates user's name and phone number
     */
    public User updateUser(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        // Save changes to database
        user = userRepository.save(user);
        return user;
    }

    /**
     * RESET PASSWORD
     * Changes user's password (used in forgot password flow)
     */
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Encrypt new password and save
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * GET USER COUNTS FOR ANALYTICS
     * Returns statistics about user registrations
     * 
     * RETURNS:
     * - Total users
     * - Users registered today
     * - Users registered this week
     * - Users registered this month
     * - Users registered this year
     */
    public Map<String, Long> getUserCounts() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfWeek = today.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();

        // Count users in different time periods
        long totalUsers = userRepository.count();
        long usersToday = userRepository.countByCreatedAtAfter(startOfToday);
        long usersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
        long usersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long usersThisYear = userRepository.countByCreatedAtAfter(startOfYear);

        // Return as a map
        return Map.of(
                "totalUsers", totalUsers,
                "usersToday", usersToday,
                "usersThisWeek", usersThisWeek,
                "usersThisMonth", usersThisMonth,
                "usersThisYear", usersThisYear
        );
    }
}
