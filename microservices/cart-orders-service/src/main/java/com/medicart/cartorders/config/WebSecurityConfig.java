package com.medicart.cartorders.config;

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
 * EXAMPLE:
 * Controller receives request with headers:
 * - X-User-Id: 1
 * - X-User-Email: user@example.com
 * - X-User-Role: ROLE_USER
 * 
 * Controller uses these headers directly:
 * @GetMapping("/cart")
 * public Cart getCart(@RequestHeader("X-User-Id") Long userId) {
 *     return cartService.getCartByUserId(userId);
 * }
 * 
 * SECURITY:
 * - This service is NOT exposed directly to internet
 * - Only Gateway can reach this service
 * - Gateway is the single entry point
 * - All requests are pre-validated by Gateway
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless APIs)
            .csrf(csrf -> csrf.disable())
            
            // Stateless sessions (no server-side sessions)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Allow all requests (Gateway already validated)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            
            // Disable HTTP Basic authentication
            .httpBasic(basic -> basic.disable())
            
            // Disable form-based login
            .formLogin(form -> form.disable());

        return http.build();
    }
}
