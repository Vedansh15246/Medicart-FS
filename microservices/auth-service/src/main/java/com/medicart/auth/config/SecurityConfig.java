package com.medicart.auth.config;

import com.medicart.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
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
                .requestMatchers("/batches/**").hasRole("ADMIN")
                .requestMatchers("/medicines/**").hasRole("ADMIN")
                .requestMatchers("/auth/login", "/api/auth/login").permitAll()
                .requestMatchers("/auth/register", "/api/auth/register").permitAll()
                .requestMatchers("/auth/forgot-password", "/api/auth/forgot-password").permitAll()
                .requestMatchers("/auth/reset-password", "/api/auth/reset-password").permitAll()
                .requestMatchers("/auth/validate", "/api/auth/validate").permitAll()
                .requestMatchers("/auth/health", "/api/auth/health").permitAll()
                .requestMatchers("/auth/otp/**", "/api/auth/otp/**").permitAll()
                .requestMatchers("GET", "/auth/me", "/api/auth/me").authenticated()
                .requestMatchers("GET", "/auth/users/**", "/api/auth/users/**").authenticated()
                .requestMatchers("PUT", "/auth/users/**", "/api/auth/users/**").authenticated()
                .requestMatchers("/prescriptions/**", "/api/prescriptions/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
