/*
 * ========================================
 * DATA INITIALIZER - STARTUP CONFIGURATION
 * ========================================
 * This class runs automatically when the application starts.
 * It sets up essential data that must exist in the database.
 * 
 * WHAT IT DOES:
 * 1. Creates ROLE_USER and ROLE_ADMIN roles if they don't exist
 * 2. Creates default admin user (admin@medicart.com / admin123)
 * 3. Ensures admin password is properly encrypted
 * 
 * WHY IS THIS NEEDED?
 * - New users need ROLE_USER to be assigned during registration
 * - System needs at least one admin to manage the application
 * - Ensures admin can always login even if database is reset
 * 
 * WHEN IT RUNS:
 * - Every time the application starts
 * - Checks if data exists before creating (won't duplicate)
 * - Updates admin password if it's incorrect
 * 
 * DEFAULT ADMIN CREDENTIALS:
 * Email: admin@medicart.com
 * Password: admin123
 * 
 * ANNOTATIONS EXPLAINED:
 * @Component - Spring creates and manages this class
 * CommandLineRunner - Interface that runs code on application startup
 * @Autowired - Spring injects dependencies automatically
 */

// This line defines the package (folder structure) for this Java file.
// Packages help organize code and avoid name conflicts.
package com.medicart.auth.config;

// Import statements bring in classes from other libraries so we can use them here.
import org.springframework.beans.factory.annotation.Autowired; // Lets Spring inject dependencies automatically
import org.springframework.boot.CommandLineRunner; // Interface to run code at app startup
import org.springframework.security.crypto.password.PasswordEncoder; // For encrypting passwords
import org.springframework.stereotype.Component; // Marks this class as a Spring-managed bean

import com.medicart.auth.entity.Role; // Role entity (database table)
import com.medicart.auth.entity.User; // User entity (database table)
import com.medicart.auth.repository.RoleRepository; // Repository for Role entity
import com.medicart.auth.repository.UserRepository; // Repository for User entity


// Marks this class as a Spring component (managed by Spring)
@Component
// Implements CommandLineRunner so it runs code at application startup
public class DataInitializer implements CommandLineRunner {


    // Injects the RoleRepository so we can access roles in the database
    @Autowired
    private RoleRepository roleRepository;

    // Injects the UserRepository so we can access users in the database
    @Autowired
    private UserRepository userRepository;

    // Injects the PasswordEncoder for encrypting passwords
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * RUN METHOD
     * This method executes automatically when application starts
     * 
     * STEPS:
     * 1. Initialize roles (ROLE_USER, ROLE_ADMIN)
     * 2. Initialize admin user
     * 3. Log success or skip if already exists
     */

    // This method runs automatically when the application starts
    @Override
    public void run(String... args) throws Exception {
        try {
            // Step 1: Create roles if they don't exist
            initializeRoles();
            // Step 2: Create admin user if needed
            initializeAdminUser();
        } catch (Exception e) {
            // Ignore errors here (could log if needed)
        }
    }

    /**
     * INITIALIZE ROLES
     * Creates ROLE_USER and ROLE_ADMIN if they don't exist
     * 
     * WHY TWO ROLES?
     * - ROLE_USER: Regular users (customers)
     * - ROLE_ADMIN: Administrators (can manage users, view analytics)
     */

    // Creates ROLE_USER and ROLE_ADMIN if they don't exist
    private void initializeRoles() {
        // Check if ROLE_USER exists; if not, create it
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = Role.builder() // Use builder pattern to create Role object
                    .name("ROLE_USER") // Set name
                    .description("Standard user role") // Set description
                    .build(); // Build the Role object
            roleRepository.save(userRole); // Save to database
        }

        // Check if ROLE_ADMIN exists; if not, create it
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);
        }
    }

    /**
     * INITIALIZE ADMIN USER
     * Creates default admin account or updates password if needed
     * 
     * DEFAULT CREDENTIALS:
     * Email: admin@medicart.com
     * Password: admin123
     * 
     * SECURITY NOTE:
     * Password is encrypted using BCrypt before storing in database.
     * Never store plain text passwords!
     * 
     * BEHAVIOR:
     * - If admin exists with correct password: Skip
     * - If admin exists with wrong password: Update password
     * - If admin doesn't exist: Create new admin
     */

    // Creates default admin user if not present, or updates password if needed
    private void initializeAdminUser() {
        String adminEmail = "admin@medicart.com"; // Default admin email
        String adminPassword = "admin123"; // Default admin password

        // Check if admin user already exists in the database
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            User existing = userRepository.findByEmail(adminEmail).get(); // Get existing admin user
            String freshHash = passwordEncoder.encode(adminPassword); // Hash the default password
            // Check if the stored password matches the default password
            if (!passwordEncoder.matches(adminPassword, existing.getPassword())) {
                // If not, update the password to the default
                existing.setPassword(freshHash);
                userRepository.save(existing);
            } 
            return; // Done
        }

        // If admin user doesn't exist, create a new one
        try {
            // Get the ROLE_ADMIN from the database (throws error if not found)
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            // Build a new User object for the admin
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword)) // Encrypt password!
                    .fullName("Administrator")
                    .phone("9999999999")
                    .isActive(true)
                    .role(adminRole)
                    .build();

            // Save the new admin user to the database
            userRepository.save(adminUser);
        } catch (Exception e) {
            // If something goes wrong, throw a runtime exception
            throw new RuntimeException("Failed to initialize admin user", e);
        }
    }
}
