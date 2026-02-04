package com.medicart.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.medicart.auth.entity.Role;
import com.medicart.auth.entity.User;
import com.medicart.auth.repository.RoleRepository;
import com.medicart.auth.repository.UserRepository;

/**
 * Initialize required roles and admin user on application startup.
 * This ensures that:
 * 1. ROLE_USER and ROLE_ADMIN roles exist in the database
 * 2. Admin user (admin@medicart.com) is created with bcrypt-hashed password
 */
@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("════════════════════════════════════════════════════════════════");
        log.info("🚀 [DataInitializer] Starting application data initialization...");
        log.info("════════════════════════════════════════════════════════════════");

        // ==================== INITIALIZE ROLES ====================
        initializeRoles();

        // ==================== INITIALIZE ADMIN USER ====================
        initializeAdminUser();

        log.info("════════════════════════════════════════════════════════════════");
        log.info("✅ [DataInitializer] Application data initialization completed!");
        log.info("════════════════════════════════════════════════════════════════");
    }

    private void initializeRoles() {
        log.info("🔐 Initializing roles...");

        // Create ROLE_USER if it doesn't exist
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = Role.builder()
                    .name("ROLE_USER")
                    .description("Standard user role")
                    .build();
            roleRepository.save(userRole);
            log.info("   ✅ Created ROLE_USER role");
        } else {
            log.info("   ℹ️  ROLE_USER role already exists");
        }

        // Create ROLE_ADMIN if it doesn't exist
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);
            log.info("   ✅ Created ROLE_ADMIN role");
        } else {
            log.info("   ℹ️  ROLE_ADMIN role already exists");
        }
    }

    private void initializeAdminUser() {
        log.info("👤 Initializing admin user...");

        String adminEmail = "admin@medicart.com";
        String adminPassword = "admin123";

        // Check if admin user already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("   ℹ️  Admin user (admin@medicart.com) already exists in database");
            return;
        }

        try {
            // Get or create ROLE_ADMIN
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            // Create admin user with bcrypt-hashed password
            String hashedPassword = passwordEncoder.encode(adminPassword);

            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(hashedPassword)
                    .fullName("Administrator")
                    .phone("9999999999")
                    .isActive(true)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);

            log.info("   ✅ Created admin user successfully!");
            log.info("      📧 Email: {}", adminEmail);
            log.info("      🔑 Password: {} (bcrypt hashed)", adminPassword);
            log.info("      👥 Role: ROLE_ADMIN");
            log.info("      ✓ Active: true");

        } catch (Exception e) {
            log.error("   ❌ Failed to create admin user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize admin user", e);
        }
    }
}
