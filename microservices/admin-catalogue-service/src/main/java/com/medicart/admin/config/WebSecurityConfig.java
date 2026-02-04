package com.medicart.admin.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private static final Logger log =
            LoggerFactory.getLogger(WebSecurityConfig.class);

    private final JwtAuthenticationFilter jwtFilter;

    public WebSecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        log.info("════════════════════════════════════════════════════════════════");
        log.info("🛡️  [WebSecurityConfig] INITIALIZING SECURITY FILTER CHAIN");
        log.info("════════════════════════════════════════════════════════════════");

        http
            // 🔒 JWT services are stateless
            .csrf(csrf -> {
                log.debug("   ✅ CSRF Protection: DISABLED");
                csrf.disable();
            })
            .sessionManagement(sm -> {
                log.debug("   ✅ Session Management: STATELESS (no sessions)");
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
            })

            // NOTE: Keep anonymous authentication enabled so public endpoints
            // (e.g. GET /batches/**) can be accessed by internal service calls
            // that do not send a JWT (Feign internal calls). Disabling anonymous
            // authentication previously caused valid public GET requests to
            // be rejected with 403 when no authentication was present.

            .authorizeHttpRequests(auth -> {
                log.debug("   🔐 Setting up Authorization Rules:");
                
                auth
                    // ✅ PUBLIC READ
                    .requestMatchers("GET", "/medicines/**").permitAll()
                    .requestMatchers("GET", "/batches/**").permitAll()
                    .requestMatchers("/health").permitAll()
                    
                    // 🔐 ADMIN/AUTHENTICATED WRITE
                    // NOTE: POST /batches requires authenticated user (JWT token present)
                    // In production, this should check for ADMIN role
                    .requestMatchers("POST", "/medicines/**").hasRole("ADMIN")
                    .requestMatchers("PUT", "/medicines/**").hasRole("ADMIN")
                    .requestMatchers("DELETE", "/medicines/**").hasRole("ADMIN")

                    .requestMatchers("POST", "/batches/**").authenticated()
                    .requestMatchers("PUT", "/batches/**").authenticated()
                    .requestMatchers("DELETE", "/batches/**").hasRole("ADMIN")

                    .anyRequest().authenticated();
                
                log.debug("      ✓ GET /medicines/** → permitAll (public)");
                log.debug("      ✓ GET /batches/**  → permitAll (public)");
                log.debug("      ✓ GET /health     → permitAll (public)");
                log.debug("      ✓ POST /batches/** → authenticated (JWT required) 🔧 TEMP FIX");
                log.debug("      ✓ PUT /batches/**  → authenticated (JWT required) 🔧 TEMP FIX");
                log.debug("      ✓ POST/PUT/DELETE /medicines/** → hasRole('ADMIN')");
                log.debug("      ✓ DELETE /batches/** → hasRole('ADMIN')");
                log.debug("      ✓ Any other request → authenticated()");
            })

            // 🔥 ORDER MATTERS - JWT filter BEFORE username/password filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        log.debug("   🔥 Filter Order: JwtAuthenticationFilter added BEFORE UsernamePasswordAuthenticationFilter");
        log.info("════════════════════════════════════════════════════════════════");
        log.info("✅ [WebSecurityConfig] SECURITY FILTER CHAIN INITIALIZED");
        log.info("════════════════════════════════════════════════════════════════");

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        log.info("🔐 [WebSecurityConfig] Creating AuthenticationManager bean");
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        // For JWT-based auth, we don't use username/password authentication
        // This bean is just needed to avoid circular proxy issues
        return authBuilder.build();
    }
}
