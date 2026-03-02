/*
 * ========================================
 * ROLE ENTITY - USER ROLES TABLE
 * ========================================
 * This class represents user ROLES in the database.
 * Each instance = one row in the 'roles' table.
 * 
 * WHAT ARE ROLES?
 * Roles define what a user can do in the system.
 * Example: ROLE_USER (regular user), ROLE_ADMIN (administrator)
 * 
 * FIELDS EXPLAINED:
 * - id: Unique identifier for each role
 * - name: Role name (e.g., "ROLE_USER", "ROLE_ADMIN")
 * - description: What this role is for
 * 
 * ANNOTATIONS EXPLAINED:
 * @Entity - This is a database table
 * @Table - Table name is "roles"
 * @Builder - Easy way to create Role objects
 * @Data - Auto-generates getters, setters, toString, etc.
 */

package com.medicart.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
