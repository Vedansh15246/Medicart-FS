package com.medicart.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * Gateway-level JWT authentication filter.
 * Validates JWT tokens, extracts user info, and forwards
 * X-User-Id, X-User-Email, X-User-Role headers to downstream services.
 * Public endpoints are excluded from JWT validation.
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String secret;

    /** Paths that never require a JWT token */
    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/validate",
            "/auth/health",
            "/auth/otp/",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/validate",
            "/api/auth/health",
            "/api/auth/otp/",
            "/health",
            "/v3/api-docs",
            "/swagger-ui",
            "/webjars/"
    );

    /** Paths that are public only for GET requests */
    private static final List<String> PUBLIC_GET_PATHS = List.of(
            "/medicines",
            "/batches"
    );

    @Override
    public int getOrder() {
        // Run before routing filter but after CORS
        return -1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // Skip JWT validation for public paths
        if (isPublicPath(path, method)) {
            return chain.filter(exchange);
        }

        // Extract Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for {} {}", method, path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.getSubject();
            String role = claims.get("scope", String.class);
            Object userIdObj = claims.get("userId");

            String userId = (userIdObj != null) ? userIdObj.toString() : "";

            log.debug("JWT valid - userId: {}, email: {}, role: {}, path: {}", userId, email, role, path);

            // Mutate the request to add user info headers for downstream services.
            // Only add X-User-Id when we actually have a value to avoid empty header issues downstream.
            ServerHttpRequest.Builder reqBuilder = request.mutate();
            if (userId != null && !userId.isBlank()) {
                reqBuilder.header("X-User-Id", userId);
            }
            reqBuilder.header("X-User-Email", email != null ? email : "");
            reqBuilder.header("X-User-Role", role != null ? role : "");

            ServerHttpRequest mutatedRequest = reqBuilder.build();

            log.debug("Forwarding headers - X-User-Id: {}, X-User-Email: {}, X-User-Role: {}",
                    userId, email, role);

            // Check role-based access for admin-only endpoints
            if (isAdminOnly(path, method) && !"ROLE_ADMIN".equals(role)) {
                log.warn("Access denied - user {} with role {} attempted {} {}", email, role, method, path);
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (Exception e) {
            log.warn("JWT validation failed for {} {}: {}", method, path, e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isPublicPath(String path, HttpMethod method) {
        // Always-public paths (any method)
        for (String publicPath : PUBLIC_PATHS) {
            if (path.equals(publicPath) || path.startsWith(publicPath)) {
                return true;
            }
        }

        // GET-only public paths (medicines, batches catalog)
        if (HttpMethod.GET.equals(method)) {
            for (String getPath : PUBLIC_GET_PATHS) {
                if (path.equals(getPath) || path.startsWith(getPath + "/") || path.startsWith(getPath + "?")) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks if the endpoint requires ADMIN role.
     * POST/PUT/DELETE on /medicines/** and DELETE on /batches/** require ADMIN.
     */
    private boolean isAdminOnly(String path, HttpMethod method) {
        // POST/PUT/DELETE medicines → ADMIN only
        if ((path.startsWith("/medicines") || path.startsWith("/api/medicines"))
                && (HttpMethod.POST.equals(method) || HttpMethod.PUT.equals(method) || HttpMethod.DELETE.equals(method))) {
            return true;
        }
        // DELETE batches → ADMIN only
        if((path.startsWith("/batches") || path.startsWith("/api/batches"))
                && HttpMethod.DELETE.equals(method)) {
            return true;
        }
        return false;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
