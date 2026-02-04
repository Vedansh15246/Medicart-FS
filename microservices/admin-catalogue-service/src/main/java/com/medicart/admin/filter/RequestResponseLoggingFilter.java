package com.medicart.admin.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 🔍 COMPREHENSIVE LOGGING FILTER
 * Tracks all requests/responses to identify 403 errors
 * Logs at ENTRY POINT and EXIT POINT of admin-catalogue-service
 */
@Component
public class RequestResponseLoggingFilter implements Filter {
    
    private static final Logger log = LoggerFactory.getLogger(RequestResponseLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        long startTime = System.currentTimeMillis();
        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();
        String authHeader = httpRequest.getHeader("Authorization");
        String userId = httpRequest.getHeader("X-User-Id");
        
        // ════════════════════════════════════════════════════════════════
        // 📥 REQUEST ENTRY POINT
        // ════════════════════════════════════════════════════════════════
        log.info("╔════════════════════════════════════════════════════════════════════════╗");
        log.info("║                    🔍 REQUEST ENTRY POINT                             ║");
        log.info("║              ADMIN-CATALOGUE-SERVICE (Port 8082)                       ║");
        log.info("╠════════════════════════════════════════════════════════════════════════╣");
        log.info("║ ⏰ Timestamp: {}", System.currentTimeMillis());
        log.info("║ 📍 Method: {} | Path: {}", method, path);
        log.info("║ 🔑 Authorization Header:");
        
        if (authHeader == null) {
            log.error("║    ❌ NULL - No token sent!");
        } else if (!authHeader.startsWith("Bearer ")) {
            log.error("║    ❌ Invalid format: {} (should be 'Bearer ...')", authHeader.substring(0, 30));
        } else {
            log.info("║    ✓ Present");
            log.info("║    ├─ Format: Bearer");
            log.info("║    ├─ Token length: {} chars", authHeader.length() - 7);
            log.info("║    └─ First 40 chars: {}...", authHeader.substring(0, Math.min(40, authHeader.length())));
        }
        
        log.info("║ 👤 X-User-Id: {}", userId != null ? userId : "❌ NOT PROVIDED");
        log.info("║ 📦 Content-Type: {}", httpRequest.getContentType());
        log.info("║ 🌐 Remote Address: {}", httpRequest.getRemoteAddr());
        log.info("║ 📊 All Headers:");
        
        // Log all headers
        java.util.Enumeration<String> headerNames = httpRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = httpRequest.getHeader(headerName);
            
            if ("Authorization".equalsIgnoreCase(headerName)) {
                log.info("║    ├─ {}: {} (PRESENT ✓)", headerName, 
                    headerValue.substring(0, Math.min(30, headerValue.length())) + "...");
            } else if ("X-User-Id".equalsIgnoreCase(headerName)) {
                log.info("║    ├─ {}: {}", headerName, headerValue);
            } else {
                log.debug("║    ├─ {}: {}", headerName, headerValue);
            }
        }
        
        log.info("╚════════════════════════════════════════════════════════════════════════╝");
        
        // Process request through filter chain
        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = httpResponse.getStatus();
            
            // ════════════════════════════════════════════════════════════════
            // 📤 RESPONSE EXIT POINT
            // ════════════════════════════════════════════════════════════════
            log.info("╔════════════════════════════════════════════════════════════════════════╗");
            log.info("║                    📤 RESPONSE EXIT POINT                             ║");
            log.info("║              ADMIN-CATALOGUE-SERVICE (Port 8082)                      ║");
            log.info("╠════════════════════════════════════════════════════════════════════════╣");
            log.info("║ ⏱️  Processing Time: {}ms", duration);
            log.info("║ 📍 Path: {} | Method: {}", path, method);
            
            // Status codes
            if (status == 200 || status == 201) {
                log.info("║ ✅ Status: {} OK", status);
            } else if (status == 400) {
                log.warn("║ ⚠️  Status: {} Bad Request", status);
            } else if (status == 401) {
                log.error("║ ❌ Status: {} Unauthorized (No valid auth)", status);
            } else if (status == 403) {
                log.error("║ 🚫 Status: {} FORBIDDEN - ACCESS DENIED!", status);
                log.error("║    This is the 403 error!");
                log.error("║    User-Id: {}", userId);
                log.error("║    Path: {}", path);
                logReason(method, path, authHeader, userId);
            } else if (status == 404) {
                log.warn("║ ⚠️  Status: {} Not Found", status);
            } else if (status == 500) {
                log.error("║ ❌ Status: {} Internal Server Error", status);
            } else {
                log.info("║ ℹ️  Status: {}", status);
            }
            
            log.info("║ 🔄 Response Headers:");
            log.info("║    └─ Content-Type: {}", httpResponse.getContentType());
            log.info("╚════════════════════════════════════════════════════════════════════════╝");
        }
    }

    /**
     * 🔍 Diagnostic function to determine 403 reason
     */
    private void logReason(String method, String path, String authHeader, String userId) {
        log.error("╔════════════════════════════════════════════════════════════════════════╗");
        log.error("║              🔍 403 ERROR ROOT CAUSE ANALYSIS                          ║");
        log.error("╠════════════════════════════════════════════════════════════════════════╣");
        
        // Reason 1: No Authorization header
        if (authHeader == null) {
            log.error("║ ❌ REASON #1: No Authorization Header");
            log.error("║    └─ Token not sent from frontend");
            log.error("║    └─ Check: localStorage.getItem('accessToken')");
            log.error("║    └─ Check: axios headers in catalogService.js");
            return;
        }
        
        // Reason 2: Invalid Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            log.error("║ ❌ REASON #2: Invalid Bearer Format");
            log.error("║    └─ Expected: 'Bearer eyJ...'");
            log.error("║    └─ Got: '{}'", authHeader.substring(0, 30));
            return;
        }
        
        // Reason 3: JWT signature invalid
        log.error("║ ⚠️  Token is present and format is correct");
        log.error("║    Possible reasons:");
        log.error("║    1️⃣  JWT signature invalid (SECRET key mismatch)");
        log.error("║        ├─ Check: auth-service jwt.secret");
        log.error("║        └─ Check: admin-service jwt.secret (MUST MATCH)");
        log.error("║");
        log.error("║    2️⃣  JWT 'scope' claim is NULL");
        log.error("║        ├─ Check: User has NULL role in database");
        log.error("║        └─ Solution: Run MIGRATION_FIX_USER_ROLES.sql");
        log.error("║");
        log.error("║    3️⃣  JwtAuthenticationFilter not setting SecurityContext");
        log.error("║        ├─ Check: JwtAuthenticationFilter logs");
        log.error("║        └─ Check: Exception in JWT parsing");
        log.error("║");
        log.error("║    4️⃣  WebSecurityConfig requires .hasRole('ADMIN')");
        log.error("║        ├─ User has: ROLE_USER or ROLE_CUSTOMER");
        log.error("║        └─ Solution: Change to .authenticated()");
        log.error("║");
        log.error("║    5️⃣  API Gateway not forwarding Authorization header");
        log.error("║        ├─ Check: api-gateway/WebSecurityConfig.java");
        log.error("║        └─ Check: gateway route configuration");
        
        log.error("║");
        log.error("║ 📋 NEXT STEPS:");
        log.error("║    1. Check JWT Filter logs for 'JWT VALID' or 'JWT FAILED'");
        log.error("║    2. Check WebSecurityConfig logs for authorization decision");
        log.error("║    3. Check BatchController - does request reach it?");
        log.error("║    4. Enable TRACE logging for complete details");
        
        log.error("╚════════════════════════════════════════════════════════════════════════╝");
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        log.info("✅ RequestResponseLoggingFilter initialized");
    }

    @Override
    public void destroy() {
        log.info("✅ RequestResponseLoggingFilter destroyed");
    }
}
