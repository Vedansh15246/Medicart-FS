/*
 * ========================================
 * USER REPOSITORY - DATABASE OPERATIONS
 * ========================================
 * This interface handles all database operations for Users.
 * Think of it as a bridge between your Java code and the database.
 * 
 * WHAT IT DOES:
 * - Find users by email
 * - Check if email already exists
 * - Count users created after a certain date
 * - All basic operations (save, delete, findAll, etc.) are inherited
 * 
 * HOW IT WORKS:
 * Spring automatically implements these methods for you!
 * You just declare the method signature, Spring does the rest.
 * 
 * ANNOTATIONS EXPLAINED:
 * @Repository - Tells Spring this is a database access component
 */

package com.medicart.auth.repository;

import com.medicart.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their email address
    // Returns Optional because user might not exist
    Optional<User> findByEmail(String email);
    
    // Check if a user with this email already exists
    // Returns true if exists, false if not
    boolean existsByEmail(String email);
    
    // Count how many users were created after a specific date/time
    // Used for analytics (e.g., users registered today, this week, etc.)
    long countByCreatedAtAfter(LocalDateTime start);
}
