// package com.medicart.auth.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class WebSecurityConfig {

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             .csrf(csrf -> csrf.disable())
//             .authorizeHttpRequests(authorize -> authorize
//                 // Public endpoints - no authentication required
//                 // allow both direct and proxied paths
//                 .requestMatchers("/auth/login", "/api/auth/login").permitAll()
//                 .requestMatchers("/auth/register", "/api/auth/register").permitAll()
//                 .requestMatchers("/auth/forgot-password", "/api/auth/forgot-password").permitAll()
//                 .requestMatchers("/auth/reset-password", "/api/auth/reset-password").permitAll()
//                 .requestMatchers("/auth/validate", "/api/auth/validate").permitAll()
//                 .requestMatchers("/auth/health", "/api/auth/health").permitAll()
//                 .requestMatchers("/auth/otp/**", "/api/auth/otp/**").permitAll()
                
//                 // All other requests require authentication
//                 .anyRequest().authenticated()
//             )
//             .httpBasic(basic -> basic.disable())
//             .formLogin(form -> form.disable())
//             .logout(logout -> logout.disable());
            
//         return http.build();
//     }
// }
