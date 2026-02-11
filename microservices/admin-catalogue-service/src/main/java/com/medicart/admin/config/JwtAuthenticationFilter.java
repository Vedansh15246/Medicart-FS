package com.medicart.admin.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

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

        log.debug("════════════════════════════════════════════════════════════════");
        log.debug("📍 [JWT FILTER] START");
        log.debug("METHOD: {} | URI: {}", request.getMethod(), request.getRequestURI());
        log.debug("Remote Address: {}", request.getRemoteAddr());
        log.debug("════════════════════════════════════════════════════════════════");

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        
        log.debug("🔍 [JWT FILTER] Reading Authorization header");
        log.debug("📋 Header value: {}", header == null ? "NULL" : header);
        
        if (header == null) {
            log.warn("⚠️  [JWT FILTER] Authorization header is NULL");
            log.debug("→ Passing request to next filter WITHOUT authentication");
            filterChain.doFilter(request, response);
            return;
        }

        if (!header.startsWith("Bearer ")) {
            log.warn("⚠️  [JWT FILTER] Header does NOT start with 'Bearer '");
            log.warn("   Expected format: 'Bearer <token>'");
            log.warn("   Actual format: '{}'", header);
            log.debug("→ Passing request to next filter WITHOUT authentication");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            log.debug("✂️  [JWT FILTER] Extracting token from header (substring 7)");
            String token = header.substring(7);
            log.debug("📝 Token length: {} characters", token.length());
            log.debug("🔑 Token first 50 chars: {}...", token.length() > 50 ? token.substring(0, 50) : token);

            log.debug("🔓 [JWT FILTER] Parsing JWT with secret key");
            log.debug("   Secret length: {} characters", SECRET.length());
            
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            log.debug("✅ [JWT FILTER] JWT SIGNATURE VERIFIED SUCCESSFULLY");

            String email = claims.getSubject();
            String role = (String) claims.get("scope");
            
            log.debug("════════════════════════════════════════════════════════════════");
            log.debug("✨ [JWT FILTER] JWT CLAIMS EXTRACTED:");
            log.debug("   👤 sub (email):     {}", email);
            log.debug("   🎭 scope (role):    {}", role);
            log.debug("   🕐 iat (issued):    {}", claims.getIssuedAt());
            log.debug("   ⏱️  exp (expiry):    {}", claims.getExpiration());
            log.debug("════════════════════════════════════════════════════════════════");

            if (role == null) {
                log.error("❌ [JWT FILTER] JWT has NO 'scope' claim!");
                log.error("   Available claims: {}", claims.keySet());
                log.debug("→ Clearing SecurityContext and passing to next filter");
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            log.debug("🔐 [JWT FILTER] Creating authentication token");
            log.debug("   Principal (email): {}", email);
            log.debug("   Granted authority: {}", role);
            
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(role))
                    );

            log.debug("🔐 [JWT FILTER] Setting SecurityContext with authentication");
            log.debug("   Before: {} auth={}", 
                SecurityContextHolder.getContext().getAuthentication() == null ? 
                "NULL" : "EXISTS",
                SecurityContextHolder.getContext().getAuthentication()
            );
            
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.debug("   After: auth={}", SecurityContextHolder.getContext().getAuthentication());
            log.debug("✅ [JWT FILTER] SecurityContext POPULATED");
            log.debug("════════════════════════════════════════════════════════════════");

        } catch (Exception e) {
            log.error("❌ [JWT FILTER] EXCEPTION DURING JWT PARSING/VERIFICATION");
            log.error("   Exception type: {}", e.getClass().getName());
            log.error("   Exception message: {}", e.getMessage());
            log.error("   Exception cause: {}", e.getCause());
            log.error("   Stack trace: ", e);
            
            log.warn("⚠️  [JWT FILTER] Clearing SecurityContext due to exception");
            SecurityContextHolder.clearContext();
        }

        log.debug("→ [JWT FILTER] Passing request to next filter in chain");
        log.debug("════════════════════════════════════════════════════════════════");
        filterChain.doFilter(request, response);
    }
}
