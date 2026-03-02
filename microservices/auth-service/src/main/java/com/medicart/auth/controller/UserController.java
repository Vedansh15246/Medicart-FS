/*
 * ========================================
 * USER CONTROLLER - USER MANAGEMENT APIs
 * ========================================
 * This controller handles all user-related operations like viewing, updating, and deleting users.
 * 
 * BASE URL: /auth/users
 * 
 * WHAT THIS CONTROLLER DOES:
 * ✅ Get list of all users (for admin panel)
 * ✅ Get specific user by ID
 * ✅ Get current user's profile
 * ✅ Update user profile
 * ✅ Delete user (admin only)
 * 
 * ANNOTATIONS EXPLAINED:
 * @RestController - This class handles HTTP requests and returns JSON responses
 * @RequestMapping - Base URL path for all endpoints in this controller
 * @Autowired - Spring automatically provides the AuthService
 */

package com.medicart.auth.controller;

import java.util.List;

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

    // AuthService handles the business logic
    @Autowired
    private AuthService authService;

    /*
     * ========================================
     * GET ALL USERS
     * ========================================
     * Endpoint: GET /auth/users
     * Access: Public (but typically used by admin)
     * 
     * WHAT IT DOES:
     * Returns a list of all registered users in the system
     * 
     * USE CASE:
     * Admin panel needs to display all users in a table
     * 
     * RESPONSE:
     * Success (200): List of UserDTO objects
     * Error (500): Internal server error
     * 
     * EXAMPLE RESPONSE:
     * [
     *   {
     *     "id": 1,
     *     "email": "user@example.com",
     *     "fullName": "John Doe",
     *     "phone": "1234567890",
     *     "isActive": true,
     *     "role": "ROLE_USER"
     *   }
     * ]
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            // Call service to get all users from database
            List<UserDTO> users = authService.getAllUsers();
            
            // Return success response with user list
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            // If something goes wrong, log error and return 500
            return ResponseEntity.internalServerError().build();
        }
    }

    /*
     * ========================================
     * GET USER BY ID
     * ========================================
     * Endpoint: GET /auth/users/{userId}
     * Access: Public
     * 
     * WHAT IT DOES:
     * Returns details of a specific user by their ID
     * 
     * PARAMETERS:
     * @PathVariable userId - The ID of the user to fetch (from URL)
     * 
     * USE CASE:
     * View details of a specific user
     * Admin viewing user information
     * 
     * RESPONSE:
     * Success (200): UserDTO object
     * Error (404): User not found
     * 
     * EXAMPLE REQUEST:
     * GET /auth/users/1
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "id": 1,
     *   "email": "user@example.com",
     *   "fullName": "John Doe",
     *   "phone": "1234567890",
     *   "isActive": true,
     *   "role": "ROLE_USER"
     * }
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        try {
            // Call service to find user by ID
            UserDTO user = (UserDTO) authService.getUserById(userId);
            
            // Return success response with user data
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            // If user not found, log error and return 404
            return ResponseEntity.notFound().build();
        }
    }

    /*
     * ========================================
     * GET CURRENT USER PROFILE
     * ========================================
     * Endpoint: GET /auth/users/profile
     * Access: Protected (requires JWT token)
     * 
     * WHAT IT DOES:
     * Returns the profile of the currently logged-in user
     * 
     * PARAMETERS:
     * @RequestHeader X-User-Id - User ID extracted from JWT token by API Gateway
     * 
     * HOW IT WORKS:
     * 1. User sends request with JWT token
     * 2. API Gateway validates token and extracts user ID
     * 3. Gateway adds X-User-Id header
     * 4. This endpoint uses that ID to fetch user profile
     * 
     * USE CASE:
     * User wants to view their own profile
     * Display user info in frontend
     * 
     * RESPONSE:
     * Success (200): UserDTO object
     * Error (404): User not found
     * 
     * EXAMPLE REQUEST:
     * GET /auth/users/profile
     * Headers:
     *   Authorization: Bearer <jwt-token>
     *   X-User-Id: 1
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "id": 1,
     *   "email": "user@example.com",
     *   "fullName": "John Doe",
     *   "phone": "1234567890",
     *   "isActive": true,
     *   "role": "ROLE_USER"
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            // Get user profile using ID from header
            UserDTO user = (UserDTO) authService.getUserById(userId);
            
            // Return success response with profile data
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            // If user not found, log error and return 404
            return ResponseEntity.notFound().build();
        }
    }

    /*
     * ========================================
     * UPDATE USER PROFILE
     * ========================================
     * Endpoint: PUT /auth/users/{userId}
     * Access: Protected (requires JWT token)
     * 
     * WHAT IT DOES:
     * Updates user's profile information (name and phone)
     * 
     * PARAMETERS:
     * @PathVariable userId - ID of user to update (from URL)
     * @RequestHeader X-User-Id - ID of logged-in user (from JWT token)
     * @RequestBody RegisterRequest - New user data (fullName, phone)
     * 
     * SECURITY:
     * Users can only update their OWN profile
     * If userId != requestingUserId, returns 403 Forbidden
     * 
     * USE CASE:
     * User wants to update their name or phone number
     * 
     * RESPONSE:
     * Success (200): {"message": "Profile updated successfully", "user": "John Doe"}
     * Error (403): Trying to update another user's profile
     * Error (400): Invalid data or user not found
     * 
     * EXAMPLE REQUEST:
     * PUT /auth/users/1
     * Headers:
     *   Authorization: Bearer <jwt-token>
     *   X-User-Id: 1
     * Body:
     * {
     *   "fullName": "John Updated",
     *   "phone": "9876543210"
     * }
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "message": "Profile updated successfully",
     *   "user": "John Updated"
     * }
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long requestingUserId,
            @RequestBody RegisterRequest request) {
        try {
            // SECURITY CHECK: User can only update their own profile
            if (!userId.equals(requestingUserId)) {
                return ResponseEntity.status(403)
                    .body(java.util.Map.of("error", "Cannot update other user's profile"));
            }

            // Call service to update user in database
            com.medicart.auth.entity.User updatedUser = authService.updateUser(userId, request);
            
            // Return success response
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Profile updated successfully",
                    "user", updatedUser.getFullName()
            ));
        } catch (Exception e) {
            // If update fails, log error and return 400
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /*
     * ========================================
     * DELETE USER
     * ========================================
     * Endpoint: DELETE /auth/users/{userId}
     * Access: Protected (typically admin only)
     * 
     * WHAT IT DOES:
     * Permanently deletes a user from the database
     * 
     * PARAMETERS:
     * @PathVariable userId - ID of user to delete (from URL)
     * 
     * WARNING:
     * This is a destructive operation!
     * User data will be permanently removed
     * 
     * USE CASE:
     * Admin wants to remove a user account
     * User requests account deletion
     * 
     * RESPONSE:
     * Success (200): {"message": "User deleted successfully"}
     * Error (400): User not found or deletion failed
     * 
     * EXAMPLE REQUEST:
     * DELETE /auth/users/1
     * Headers:
     *   Authorization: Bearer <admin-jwt-token>
     * 
     * EXAMPLE RESPONSE:
     * {
     *   "message": "User deleted successfully"
     * }
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            // Call service to delete user from database
            authService.deleteUser(userId);
            
            // Return success response
            return ResponseEntity.ok(java.util.Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            // If deletion fails, log error and return 400
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
