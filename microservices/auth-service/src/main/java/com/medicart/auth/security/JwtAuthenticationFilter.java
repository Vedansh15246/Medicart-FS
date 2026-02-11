package com.medicart.auth.security;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

    String header = request.getHeader(HttpHeaders.AUTHORIZATION);

    // Log whether Authorization header was present (helps diagnose gateway stripping)
    if (header == null || !header.startsWith("Bearer ")) {
        log.debug("No Authorization header present for request {}", request.getRequestURI());
        filterChain.doFilter(request, response);
        return;
    }

    String token = header.substring(7);

    try {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();

        String email = claims.getSubject();
        String role = (String) claims.get("scope");
        Object userIdObj = claims.get("userId");
        String userId = (userIdObj != null) ? userIdObj.toString() : null;

        // Detailed debug logging for troubleshooting 403s
        log.debug("JWT valid - path: {}, email: {}, role: {}, userId: {}",
            request.getRequestURI(), email, role, userId);

        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                email,
                null,
                role != null ? List.of(new SimpleGrantedAuthority(role)) : List.of()
            );

        SecurityContextHolder.getContext()
            .setAuthentication(authentication);

    } catch (Exception ex) {
        // Include exception message in logs to see parsing/signing errors
        log.warn("JWT validation failed for {}: {}", request.getRequestURI(), ex.getMessage());
        SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
    }
}

