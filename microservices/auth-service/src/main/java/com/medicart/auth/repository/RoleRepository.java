/*
 * ========================================
 * ROLE REPOSITORY - DATABASE OPERATIONS
 * ========================================
 * This interface handles all database operations for Roles.
 * 
 * WHAT IT DOES:
 * - Find roles by name (e.g., "ROLE_USER", "ROLE_ADMIN")
 * - All basic operations (save, delete, findAll) inherited from JpaRepository
 * 
 * HOW IT WORKS:
 * Spring automatically creates the implementation!
 * You just declare what you need, Spring handles the SQL.
 * 
 * ANNOTATIONS EXPLAINED:
 * @Repository - Marks this as a database access component
 */

package com.medicart.auth.repository;

import com.medicart.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Find a role by its name (e.g., "ROLE_USER")
    // Returns Optional because role might not exist
    Optional<Role> findByName(String name);
}
