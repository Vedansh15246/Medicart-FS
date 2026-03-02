# JwtAuthenticationFilter (API Gateway)

This document explains the purpose, flow, and code of the `JwtAuthenticationFilter` used in the Medicart-FS API Gateway.

---

## What is JwtAuthenticationFilter?

- It is a **Spring Cloud Gateway Global Filter**.
- It runs for every HTTP request passing through the API Gateway.
- Its job is to check if a request (except for public endpoints) has a valid JWT (JSON Web Token).
- It blocks requests without a valid token and lets valid requests through to backend services.

---

## When is this filter used?

- Automatically applied to every HTTP request in the API Gateway.
- Runs before backend microservices see the request.
- Blocks any request to protected endpoints (anything except `/auth/*` and docs) that does not have a valid JWT.

---

## How does it work? (Step-by-step)

1. **Request comes to API Gateway**
2. **Filter checks if path is public** (auth/docs endpoints)
3. **If public, request is allowed through**
4. **If protected, filter checks for Bearer token**
5. **If missing/invalid, returns 401 Unauthorized**
6. **If present, verifies JWT signature**
7. **If valid, request continues to backend**
8. **If invalid, returns 401 Unauthorized**

---

## Code Explanation

```java
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    @Value("${jwt.secret}")
    private String secret;

    @Override
    public int getOrder() {
        return -1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        // Allow all /auth/* and documentation endpoints without JWT
        if (path.startsWith("/auth/") || path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui") || path.startsWith("/webjars/")) {
            return chain.filter(exchange);
        }
        // Require JWT for all other endpoints
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authHeader.substring(7);
        try {
            Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes())).build().parseSignedClaims(token);
            return chain.filter(exchange);
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}
```

### Key Points:
- **@Component**: Registers the filter with Spring.
- **@Value("${jwt.secret}")**: Loads the JWT secret from configuration.
- **filter(...)**: Main method that runs for every request.
- **Public endpoints**: `/auth/*`, `/v3/api-docs`, `/swagger-ui`, `/webjars/` are always allowed.
- **Protected endpoints**: Must have a valid Bearer JWT token.
- **JWT validation**: Uses the secret to verify the token signature.
- **401 Unauthorized**: Returned if the token is missing or invalid.

---

## Example Flow

1. User tries to access `/api/products` without a token → **401 Unauthorized**
2. User logs in, gets a JWT, and tries again with `Authorization: Bearer <token>` → **Request allowed**
3. User accesses `/auth/login` or `/swagger-ui` → **Request allowed without token**

---

## Why is this important?
- Ensures only authenticated users can access protected resources.
- Keeps your backend microservices secure and stateless.
- Centralizes authentication logic in the API Gateway.

---

If you need more details or want a diagram, let me know!
