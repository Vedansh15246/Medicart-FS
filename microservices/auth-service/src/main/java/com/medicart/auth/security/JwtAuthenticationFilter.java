package com.medicart.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private static final String SECRET =
            "your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String path = request.getRequestURI();
        
        log.debug("🔍 JWT Filter checking path: {}, Header present: {}", path, header != null);

        if (header == null || !header.startsWith("Bearer ")) {
            log.debug("⏭️ No Bearer token found, continuing without authentication");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            log.debug("🔐 Validating JWT token for path: {}", path);
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.getSubject(); // sub
            String role = (String) claims.get("scope"); // ROLE_ADMIN

            log.info("✅ JWT VALID - email: {}, role: {}, path: {}", email, role, path);

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(role);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(authority)
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (Exception ex) {
            log.error("❌ JWT VALIDATION FAILED - {}: {}", path, ex.getMessage());
            // invalid token → clear context
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

