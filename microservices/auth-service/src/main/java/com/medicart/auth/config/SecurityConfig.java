package com.medicart.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.medicart.auth.security.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
/**
 * Security configuration for the auth-service.
 *
 * Purpose of the key rules below:
 * - Allow unauthenticated access to OpenAPI and Swagger UI endpoints so the
 *   API Gateway (aggregator) and developers can fetch documentation at
 *   /v3/api-docs without requiring a JWT.
 * - Keep public auth endpoints (login/register/forgot-password) open.
 * - Protect user-management and prescription endpoints as appropriate.
 *
 * Note: We also register a WebSecurityCustomizer that ignores static
 * swagger resources; this is a convenience for the embedded swagger UI.
 */
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Allow OpenAPI and Swagger UI endpoints (for aggregator and documentation)
                .requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml",
                        "/swagger-ui.html", "/swagger-ui/**", "/swagger-resources/**", "/webjars/**").permitAll()
                // Public auth endpoints
                .requestMatchers("/auth/login", "/api/auth/login").permitAll()
                .requestMatchers("/auth/register", "/api/auth/register").permitAll()
                .requestMatchers("/auth/forgot-password", "/api/auth/forgot-password").permitAll()
                .requestMatchers("/auth/forgot-password/**", "/api/auth/forgot-password/**").permitAll()
                .requestMatchers("/auth/reset-password", "/api/auth/reset-password").permitAll()
                .requestMatchers("/auth/validate", "/api/auth/validate").permitAll()
                .requestMatchers("/auth/health", "/api/auth/health").permitAll()
                .requestMatchers("/auth/otp/**", "/api/auth/otp/**").permitAll()
                .requestMatchers("/auth/analytics/**", "/api/auth/analytics/**").permitAll()
                .requestMatchers("GET", "/auth/me", "/api/auth/me").authenticated()
                .requestMatchers("GET", "/auth/users", "/api/auth/users").permitAll()
                .requestMatchers("GET", "/auth/users/**", "/api/auth/users/**").permitAll()
                .requestMatchers("PUT", "/auth/users/**", "/api/auth/users/**").authenticated()
                .requestMatchers("DELETE", "/auth/users/**", "/api/auth/users/**").authenticated()
                .requestMatchers("/prescriptions/**", "/api/prescriptions/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // Exclude swagger/OpenAPI static resources from Spring Security filters.
        // This helps the gateway and local requests access documentation resources
        // without being blocked by security filter chains.
        return (web) -> web.ignoring().requestMatchers(
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**"
        );
    }
}
