package com.medicart.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * ========================================
 * SIMPLIFIED SECURITY CONFIGURATION
 * ========================================
 * 
 * WHY THIS IS SIMPLE:
 * This service does NOT validate JWT tokens.
 * API Gateway handles all JWT validation.
 * 
 * HOW IT WORKS:
 * 1. Client sends request with JWT to Gateway (port 8080)
 * 2. Gateway validates JWT token
 * 3. Gateway extracts user info (userId, email, role)
 * 4. Gateway adds headers: X-User-Id, X-User-Email, X-User-Role
 * 5. Gateway forwards request to this service
 * 6. This service trusts the headers from gateway
 * 7. This service processes request using X-User-* headers
 * 
 * SECURITY:
 * - This service is NOT exposed directly to internet
 * - Only Gateway can reach this service
 * - Gateway is the single entry point
 * - All requests are pre-validated by Gateway
 * 
 * WHAT THIS CONFIG DOES:
 * - Disables CSRF (not needed for stateless APIs)
 * - Allows all requests (Gateway already validated)
 * - Stateless sessions (no server-side sessions)
 * - Disables form login and basic auth
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Step 1: Disable CSRF protection
            // Why: Stateless API with JWT doesn't need CSRF protection
            .csrf(csrf -> csrf.disable())
            
            // Step 2: Set session policy to STATELESS
            // Why: We don't use server-side sessions, only JWT tokens
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Step 3: Allow all requests
            // Why: Gateway already validated JWT and user permissions
            // This service trusts that Gateway only forwards valid requests
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // Trust gateway validation
            )
            
            // Step 4: Disable HTTP Basic authentication
            // Why: We use JWT tokens, not basic auth
            .httpBasic(basic -> basic.disable())
            
            // Step 5: Disable form-based login
            // Why: This is an API service, not a web application
            .formLogin(form -> form.disable());

        return http.build();
    }
}
