# Medicart Microservices — Developer README 🏥🚀

This file documents the `microservices/` module for senior engineers: system architecture, authentication (deep-dive on JWT), per-service code logic, inter-service communication patterns, and runnable examples. It uses Mermaid diagrams for visual flow, HTML details for collapsible code blocks, and Markdown callouts for explanations.

---

## Tech Stack & Badges

- Java 17+ / JDK 21 (developer terminals show JDK 21)
- Spring Boot (Spring Security, Spring Cloud Netflix/Eureka)
- Maven (multi-module, `microservices/pom.xml`)
- JWT for stateless authentication
- Optional async: Kafka (see repo docs) or messaging/event topics for analytics

![Maven](https://img.shields.io/badge/build-maven-blue)
![Java](https://img.shields.io/badge/java-17%2B-orange)
![Spring Boot](https://img.shields.io/badge/spring-boot-green)

---

## System Architecture (Visual) 🗺️

```mermaid
graph LR
  Client["Client (Browser / Mobile)"] -->|HTTPS| APIGW["API Gateway"]
  APIGW -->|Routes| AuthService["Auth Service"]
  APIGW --> Catalogue["Admin Catalogue Service"]
  APIGW --> CartOrders["Cart & Orders Service"]
  APIGW --> Payment["Payment Service"]
  APIGW --> Analytics["Analytics Service"]
  Eureka["Eureka Service"] ---|Service Discovery| APIGW
  Eureka --- AuthService
  Eureka --- Catalogue
  Eureka --- CartOrders
  Eureka --- Payment
  Eureka --- Analytics
  AuthService -->|Issues JWT| Client
  CartOrders -->|Publishes events| Analytics
  Payment -->|Publishes events| Analytics
```

> [!NOTE]
> The API Gateway centralizes inbound traffic, handles routing and optional authentication. Each service also validates JWTs to maintain a zero-trust model inside the mesh.

---

## Sequence Diagram — Auth & Request Flow ⏱️

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Service
    participant S as Service (e.g., Cart)
    C->>G: POST /api/auth/login (credentials)
    G->>A: POST /auth/login (forward)
    A-->>G: 200 { token }
    G-->>C: 200 { token }
    C->>G: GET /api/cart (Authorization: Bearer token)
    G->>S: GET /cart (Authorization header forwarded)
    S->>S: Validate JWT locally (signature & claims)
    S-->>G: 200 {cart}
    G-->>C: 200 {cart}

    Note over S,A: Async events (payment/completed) -> Kafka -> Analytics (eventual consistency)
```

> [!NOTE]
> The sequence above shows synchronous request/response flows. Asynchronous events (payments, order-created) should use an event bus (Kafka) for resiliency and decoupling.

---

## Deep Dive: JWT Auth Flow (complete) 🔐

JWTs are used as stateless access tokens. The Auth Service issues signed tokens; the Gateway can validate them and/or forward them to downstream services which also validate locally.

### JWT Structure (table)

| Part | Purpose | Example (JSON) |
|---|---:|---|
| Header | Signing algorithm & token type | { "alg": "HS256", "typ": "JWT" } |
| Payload (Claims) | Identity claims, roles, issued/expiry | { "sub": "123", "email": "a@b.com", "roles": ["ROLE_USER"], "iat": 1670000000, "exp": 1670003600 } |
| Signature | Signed header.payload using secret/private key | HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret) |

### How Auth Service issues tokens (exact flow)

1. Client POSTs credentials to `/auth/login` (routed via Gateway). Auth Service authenticates credentials (DB lookup + password hash check).
2. On success, Auth Service builds a JWT with claims (sub, roles, issuedAt, expiry). The token is signed using either an HMAC secret or RSA private key per `application.yml` configuration.
3. Auth Service returns JSON: `{ "token": "<JWT>", "user": { ... } }`.

Example pseudocode (Auth Service issuer):

```java
// Pseudocode: issuing JWT (Auth Service)
Map<String,Object> claims = new HashMap<>();
claims.put("roles", user.getRoles());
String jwt = Jwts.builder()
    .setSubject(user.getId().toString())
    .addClaims(claims)
    .setIssuedAt(now)
    .setExpiration(expiry)
    .signWith(secretKeyOrPrivateKey)
    .compact();
return ResponseEntity.ok(Map.of("token", jwt, "user", userDto));
```

> [!NOTE]
> Use RSA (RS256) in production: keep private key on Auth Service only; distribute public key to all services for verification.

### How Gateway validates tokens (exact flow)

Two common approaches supported in this project:

- Gateway verifies token and forwards Authorization header. Optionally extracts claims and injects `X-User-Id`/`X-Roles` headers for downstream services.
- Gateway simply forwards the Authorization header and each downstream service validates independently.

Validation pseudocode (used by Gateway or any downstream service):

```java
String token = extractBearer(request.getHeader("Authorization"));
Claims claims = Jwts.parserBuilder().setSigningKey(publicOrSecret).build().parseClaimsJws(token).getBody();
if (claims.getExpiration().before(now)) throw new TokenExpiredException();
List<String> roles = claims.get("roles", List.class);
// Build Authentication and set SecurityContext
```

---

## Per-service Code Logic (clean snippets + explanations) 🧩

Below we provide a short 'Code Logic' snippet for the primary microservices. Each snippet illustrates the key security or routing logic and is annotated with callouts.

### 1) Auth Service — Security configuration (actual file)

<details>
<summary>Show `com.medicart.auth.config.SecurityConfig`</summary>

```java
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
                // Allow OpenAPI and Swagger UI endpoints (for aggregator and documentation)
                .requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/webjars/**").permitAll()
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
```

</details>

> [!NOTE]
> This is the actual `SecurityConfig` used by `auth-service`. It:
> - Disables CSRF for API usage.
> - Explicitly permits login/register/health endpoints so that unauthenticated clients can reach them.
> - Adds a `JwtAuthenticationFilter` before the username/password filter so token-based auth runs on each request.

### 2) API Gateway — routing + optional validation (example)

<details>
<summary>Example Gateway filter (illustrative)</summary>

```java
// GatewayFilter: extract Authorization, optionally validate, and forward
public class JwtForwardingFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            // Optionally validate token here (using public key)
            // Or simply forward header and let downstream services validate
        }
        return chain.filter(exchange);
    }
}
```

</details>

> [!NOTE]
> Place token validation in the gateway if you want a centralized early rejection and header enrichment. Keep validation in downstream services for defense in depth.

### 3) Admin Catalogue, Cart/Orders, Payment, Analytics — token validation (pattern)

<details>
<summary>Example JwtAuthenticationFilter pattern (illustrative)</summary>

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) { filterChain.doFilter(request, response); return; }
        String token = header.substring(7);
        Claims claims = jwtService.parse(token); // verify signature, exp
        Authentication auth = new UsernamePasswordAuthenticationToken(claims.getSubject(), null, authoritiesFromClaims(claims));
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }
}
```

</details>

> [!NOTE]
> The pattern above is used across microservices: validate signature/expiry, build an Authentication, and set it to Spring's SecurityContext.

---

## API Simulation — curl examples & expected outputs 🧪

1) Login to get a token

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'
```

Expected response (200):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 42, "email": "user@example.com", "roles": ["ROLE_USER"] }
}
```

2) Call protected endpoint (list prescriptions)

```bash
curl -s http://localhost:8080/api/prescriptions \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

Expected response (200):

```json
[
  { "id": 1, "patientId": 42, "medicines": [ ... ] },
  { "id": 2, "patientId": 42, "medicines": [ ... ] }
]
```

3) Call admin-only endpoint (batches) with non-admin token

```bash
curl -s http://localhost:8080/api/batches \
  -H 'Authorization: Bearer <user-token>'
```

Expected response (403):

```json
{ "timestamp": "2026-02-07T..Z", "status": 403, "error": "Forbidden", "message": "Access is denied" }
```

---

## Inter-service Communication — Why & How 🔁

- Synchronous calls (REST over HTTP) via API Gateway for request/response flows (e.g., user requests cart, gateway routes to `cart-orders-service`). Good for low-latency API calls.
- Asynchronous events (Kafka or message broker) for eventual consistency and loose coupling (order-created, payment-completed, analytics aggregation). Use topics so multiple consumers can subscribe without blocking the caller.
- When low latency and strong typing are needed, consider gRPC for service-to-service RPC (not currently required by this project but an option).

> [!NOTE]
> Prefer async for cross-cutting concerns (analytics, notifications). Prefer sync for immediate user interactions (checkout, login).

---

## Security & Best Practices Checklist ✅

- Use RS256 keys in production. Keep private key secret.
- Short-lived access tokens + refresh tokens for long sessions.
- Use HTTPS, HttpOnly & Secure cookies or Authorization header with strong XSS protections.
- Implement token revocation strategy (revocation list or short token lifetime + refresh validation).
- Rate-limit authentication endpoints and add monitoring for failed logins.

---

## Where to look next in the repo 🧭

- `microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java` — auth security config (included above)
- `GenerateTestJWT.java` — helper for testing token issuance
- `microservices/api-gateway` — gateway routing and filters
- `microservices/eureka-server` — service registry
- `COMPLETE_JWT_FLOW_WITH_FIX.md`, `JWT_AUTH_FLOW_COMPLETE_ANALYSIS.md` — historical fixes and analysis

---

If you'd like, I can now:

1. Add a `scripts/start-local.ps1` that starts Eureka, API Gateway, and Auth Service in separate terminals and captures logs. (Fast)
2. Generate a table of `server.port` per microservice by scanning `src/main/resources/application*.yml` files and add it to this README. (I can run this and commit)
3. Replace illustrative filter snippets with exact `JwtAuthenticationFilter` implementations from each microservice (if you want the real code inserted). (Requires reading more files)

Tell me which follow-up you want and I'll implement it next. ✨
