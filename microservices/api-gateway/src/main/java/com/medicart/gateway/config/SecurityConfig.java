package com.medicart.gateway.config;

import java.util.Arrays; // For creating lists of allowed origins, methods, headers

import org.springframework.context.annotation.Bean; // For defining beans
import org.springframework.context.annotation.Configuration; // For marking as configuration class
import org.springframework.core.Ordered; // For setting filter order
import org.springframework.core.annotation.Order; // For ordering beans
import org.springframework.security.config.web.server.ServerHttpSecurity; // For configuring security
import org.springframework.security.web.server.SecurityWebFilterChain; // For reactive security filter chain
import org.springframework.web.cors.CorsConfiguration; // For CORS config
import org.springframework.web.cors.reactive.CorsWebFilter; // For CORS filter
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource; // For mapping CORS config to URLs

/**
 * Gateway Security Configuration.
 * JWT validation is handled by {@link com.medicart.gateway.filter.JwtAuthenticationFilter}.
 * This config disables Spring Security's default auth so the custom GlobalFilter controls access.
 */
@Configuration // Marks this class as a Spring configuration
public class SecurityConfig {

    /**
     * Reactive CORS Web Filter for reactive stack.
     * MUST be ordered BEFORE security filters to allow OPTIONS preflight requests.
     */
    @Bean // Registers this method as a Spring bean
    @Order(Ordered.HIGHEST_PRECEDENCE) // Ensures this filter runs before others
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration(); // Create a new CORS config object
        corsConfiguration.setAllowedOrigins(Arrays.asList(
             "http://localhost:5173", // Allow frontend dev server
                "http://localhost:3000", // Allow another frontend (React default)
                "http://localhost:5174" // Allow another dev server
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD" // Allow these HTTP methods
        ));
        corsConfiguration.setAllowedHeaders(Arrays.asList("*")); // Allow all headers
        corsConfiguration.setAllowCredentials(true); // Allow cookies/credentials
        corsConfiguration.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Source for CORS config
        source.registerCorsConfiguration("/**", corsConfiguration); // Apply CORS config to all paths

        return new CorsWebFilter(source); // Return the CORS filter bean
    }

    /**
     * Permit all exchanges through Spring Security.
     * Actual JWT authentication and route-level authorization
     * are enforced by the JwtAuthenticationFilter GlobalFilter.
     */
    @Bean // Registers this method as a Spring bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF protection (not needed for APIs)
            .httpBasic(httpBasic -> httpBasic.disable()) // Disable HTTP Basic auth
            .formLogin(formLogin -> formLogin.disable()) // Disable form login
            .authorizeExchange(authorize -> authorize.anyExchange().permitAll()); // Allow all requests (auth handled by filter)

        return http.build(); // Build and return the security filter chain
    }
}
