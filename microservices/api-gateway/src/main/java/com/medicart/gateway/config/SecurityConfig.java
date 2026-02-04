package com.medicart.gateway.config;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret:your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart-2025}")
    private String jwtSecret;

    @Bean
    public JwtDecoder jwtDecoder() {
        // Using HmacSHA512 with the same secret as auth and resource services
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec key = new SecretKeySpec(secretBytes, 0, secretBytes.length, "HmacSHA512");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    /**
     * Reactive CORS Web Filter for reactive stack
     * MUST be ordered BEFORE security filters to allow OPTIONS preflight requests
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",  // Frontend dev server
                "http://localhost:3000",  // Alternative frontend
                "http://localhost:5174"   // Vite alternative port
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsWebFilter(source);
    }

    /**
     * Configure security to allow CORS preflight requests (OPTIONS) to pass through
     * without requiring authentication/JWT validation
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            // Disable CSRF for API calls
            .csrf(csrf -> csrf.disable())
            // Disable HTTP Basic auth
            .httpBasic(httpBasic -> httpBasic.disable())
            // Disable form login
            .formLogin(formLogin -> formLogin.disable())
            // Allow all requests through (CORS will handle origin validation)
            .authorizeExchange(authorize -> authorize.anyExchange().permitAll());

        return http.build();
    }
}
