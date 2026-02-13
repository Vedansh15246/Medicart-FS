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
        try {
            log.info("Starting application data initialization...");
            initializeRoles();
            initializeAdminUser();
            log.info("Application data initialization completed.");
        } catch (Exception e) {
            log.warn("Data initialization skipped (may already exist): {}", e.getMessage());
        }
    }

    private void initializeRoles() {
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = Role.builder()
                    .name("ROLE_USER")
                    .description("Standard user role")
                    .build();
            roleRepository.save(userRole);
            log.info("Created ROLE_USER");
        }

        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);
            log.info("Created ROLE_ADMIN");
        }
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@medicart.com";
        String adminPassword = "admin123";

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Admin user already exists");
            return;
        }

        try {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Administrator")
                    .phone("9999999999")
                    .isActive(true)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            log.info("Created admin user: {}", adminEmail);
        } catch (Exception e) {
            log.error("Failed to create admin user: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize admin user", e);
        }
    }
}
