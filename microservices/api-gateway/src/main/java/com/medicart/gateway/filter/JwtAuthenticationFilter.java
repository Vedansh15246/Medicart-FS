// Package declaration for the filter class
package com.medicart.gateway.filter;


// Import JWT and Spring dependencies
import io.jsonwebtoken.Jwts; // For parsing JWT tokens
import io.jsonwebtoken.security.Keys; // For creating signing keys
import org.springframework.beans.factory.annotation.Value; // For injecting property values
import org.springframework.cloud.gateway.filter.GatewayFilterChain; // For chaining filters
import org.springframework.cloud.gateway.filter.GlobalFilter; // For global filter interface
import org.springframework.core.Ordered; // For filter order
import org.springframework.http.HttpHeaders; // For HTTP header constants
import org.springframework.http.HttpStatus; // For HTTP status codes
import org.springframework.stereotype.Component; // For marking as Spring component
import org.springframework.web.server.ServerWebExchange; // For web exchange object
import reactor.core.publisher.Mono; // For reactive programming

/**
 * Gateway-level JWT authentication filter.
 * This filter runs on every request through the API Gateway.
 * It validates JWT tokens for protected endpoints.
 * Public endpoints are excluded from JWT validation.
 */

@Component // Registers this class as a Spring bean
public class JwtAuthenticationFilter implements GlobalFilter, Ordered { // Implements a global filter with order


    @Value("${jwt.secret}") // Injects the JWT secret from application.properties
    private String secret;


    @Override
    public int getOrder() {
        return -1; // Sets filter priority (lower runs earlier)
    }


    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // ServerWebExchange exchange: Represents the entire HTTP request and response in a reactive (non-blocking) way.
        // It gives you access to request details (headers, path, etc.) and lets you modify the response.
        // GatewayFilterChain chain: Represents the chain of filters in the API Gateway.
        // You call chain.filter(exchange) to pass the request to the next filter or the backend service.
        String path = exchange.getRequest().getURI().getPath(); // Get the request path     xchange is an object that represents the entire HTTP request and response in the API Gateway. It lets you read details about the incoming request and modify the outgoing response
        // Allow all /auth/* and documentation endpoints without JWT
        if (path.startsWith("/auth/") || path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui") || path.startsWith("/webjars/")) {
            return chain.filter(exchange); // Let public requests through
                                            //“I’m done with my filter’s logic, please continue with the rest of the filters and eventually send the request to the backend.”
        }
        // Require JWT for all other endpoints
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION); // Get Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) { // If missing or not Bearer
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // Set 401 Unauthorized
            return exchange.getResponse().setComplete(); // End response
        }
        String token = authHeader.substring(7); // Remove 'Bearer ' prefix to get token
        try {
            // Validate the JWT token signature using the secret
            Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes())).build().parseSignedClaims(token);
            return chain.filter(exchange); // Token valid, continue filter chain
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED); // Invalid token, set 401
            return exchange.getResponse().setComplete(); // End response
        }
    }
    // filter: Checks if the request is public or protected. If protected, validates JWT. Allows or blocks request accordingly.
    // getOrder: Sets the priority of this filter in the filter chain.
}
