package com.medicart.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * ========================================
 * SIMPLIFIED SECURITY CONFIGURATION
 * ========================================
 * 
 * AUTH SERVICE - SPECIAL CASE:
 * - Generates JWT tokens (needs JwtService)
 * - Does NOT validate JWT tokens (Gateway does that)
 * - Trusts Gateway for authentication
 * 
 * HOW IT WORKS:
 * 1. Client sends request to Gateway (port 8080)
 * 2. Gateway validates JWT token
 * 3. Gateway adds headers: X-User-Id, X-User-Email, X-User-Role
 * 4. Gateway forwards to this service
 * 5. This service trusts Gateway's validation
 * 6. This service uses X-User-* headers
 * 
 * PUBLIC ENDPOINTS:
 * - /auth/login - Anyone can login
 * - /auth/register - Anyone can register
 * - /auth/forgot-password - Anyone can reset password
 * 
 * PROTECTED ENDPOINTS:
 * - Gateway validates JWT and forwards with headers
 * - This service trusts Gateway
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless APIs)
            .csrf(csrf -> csrf.disable())
            
            // Stateless sessions (no server-side sessions)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Allow all requests (Gateway already validated)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
