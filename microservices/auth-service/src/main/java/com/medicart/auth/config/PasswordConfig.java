/*
 * ========================================
 * PASSWORD ENCODER CONFIGURATION
 * ========================================
 * This class configures how passwords are encrypted.
 * 
 * WHY ENCRYPT PASSWORDS?
 * NEVER store passwords in plain text! If someone hacks your database,
 * they would see everyone's passwords. Instead, we encrypt (hash) them.
 * 
 * WHAT IS BCRYPT?
 * BCrypt is a password hashing algorithm that:
 * - Is very secure (hard to crack)
 * - Is slow on purpose (prevents brute force attacks)
 * - Adds random "salt" to each password (same password = different hash)
 * 
 * HOW IT WORKS:
 * - When user registers: password → BCrypt → encrypted hash → save to database
 * - When user logs in: entered password → BCrypt → compare with stored hash
 * 
 * EXAMPLE:
 * Password: "admin123"
 * Encrypted: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 * 
 * ANNOTATIONS EXPLAINED:
 * @Configuration - This is a configuration class
 * @Bean - Creates a Spring-managed object that can be injected elsewhere
 */

package com.medicart.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    /**
     * PASSWORD ENCODER BEAN
     * Creates a BCryptPasswordEncoder that will be used throughout the application
     * 
     * USAGE:
     * - AuthService uses this to encrypt passwords during registration
     * - AuthService uses this to verify passwords during login
     * - DataInitializer uses this to create admin user password
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
