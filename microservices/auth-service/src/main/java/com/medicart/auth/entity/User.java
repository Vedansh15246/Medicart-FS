/*
 * ========================================
 * USER ENTITY - DATABASE TABLE DEFINITION
 * ========================================
 * This class represents a USER in the database.
 * Each instance of this class = one row in the 'users' table.
 * 
 * FIELDS EXPLAINED:
 * - id: Unique identifier for each user (auto-generated)
 * - email: User's email address (must be unique)
 * - password: Encrypted password (never store plain text!)
 * - fullName: User's full name
 * - phone: User's phone number
 * - isActive: Whether user account is active (true) or disabled (false)
 * - role: User's role (ROLE_USER or ROLE_ADMIN)
 * - createdAt: When the user account was created
 * - updatedAt: When the user account was last modified
 * 
 * ANNOTATIONS EXPLAINED:
 * @Entity - Tells Spring this is a database table
 * @Table - Specifies the table name in database
 * @Id - Marks this field as the primary key
 * @GeneratedValue - Auto-generates the ID value
 * @Column - Defines column properties (unique, nullable, etc.)
 * @ManyToOne - Many users can have one role (relationship)
 * @Builder - Lombok annotation for easy object creation
 * @Data - Lombok annotation that auto-generates getters/setters
 */

package com.medicart.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Relationship: Many users can have one role
    @ManyToOne(fetch = FetchType.EAGER)// Load role data immediately with user
    @JoinColumn(name = "role_id")  //fkey column to link to Role table
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Automatically set createdAt and updatedAt when creating new user
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // Automatically update updatedAt when modifying user
    @PreUpdate // Called before updating existing user
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
