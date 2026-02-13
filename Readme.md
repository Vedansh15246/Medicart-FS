# Authentication & Authorization — MediCart (microservices)

This document explains, with examples and concrete references to the code in this workspace, how authentication and authorization are implemented end-to-end for the MediCart project. It covers the login flow, JWT issuance, validation by downstream services, the API Gateway role, how role-based access control (RBAC) is enforced, and recommended secure storage/refresh practices.

Important workspace references
- Authentication filter and config in the Auth Service: [`com.medicart.auth.config.SecurityConfig`](microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java) — [microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java](microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java)
- JWT filter used by services: [`com.medicart.auth.security.JwtAuthenticationFilter`](microservices/auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java) — [microservices/auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java](microservices/auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java)
- Frontend calls Auth through the API Gateway: [frontend/src/api/authService.js](frontend/src/api/authService.js) — vite proxy config: [vite.config.js](frontend/vite.config.js)
- API Gateway microservice: [microservices/api-gateway](microservices/api-gateway) (gateway code lives here in the workspace)

Overview (simple)
- The frontend (browser) sends user credentials to the Auth Service (via the API Gateway).
- The Auth Service validates credentials, issues a signed JWT containing user id and roles/claims.
- The frontend stores the token (e.g., in memory or secure storage) and sends it in the Authorization header with each request.
- The API Gateway and/or each backend microservice validate the JWT signature and expiration. Once validated, the service trusts the token's claims (user id, roles) and performs authorization (e.g., RBAC).
- No per-request “is user logged in?” call to the Auth Service is strictly required because signature verification is stateless.

Detailed flow with code & examples

1) Login: frontend → API Gateway → Auth Service
- The frontend uses [frontend/src/api/authService.js](frontend/src/api/authService.js) to call `/auth/login`. The Vite dev proxy rewrites `/api` to the gateway:
  - [vite.config.js](frontend/vite.config.js) shows the proxy: `/api` → `http://localhost:8080` (API Gateway).
  - Example call from frontend:
    - File: [frontend/src/api/authService.js](frontend/src/api/authService.js)

2) Auth Service validates credentials and returns a JWT
- On successful login the Auth Service creates a JWT, signs it, and returns JSON like:
  - Example response (HTTP 200):
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
      "user": { "id": 123, "email": "a@b.com", "roles":[ "ROLE_USER" ] }
    }
- Typical token payload (claims):
  {
    "sub": "123",              // user id
    "email": "a@b.com",
    "roles": ["ROLE_ADMIN"],   // roles or authorities
    "iat": 1670000000,
    "exp": 1670003600
  }

3) Where is authentication enforced server-side?
- The Auth Service registers a filter in the Spring Security chain:
  - See [`com.medicart.auth.config.SecurityConfig`](microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java) — this file disables CSRF, configures URL matchers and adds the JWT filter:
    - Notable lines:
      - `.requestMatchers("/batches/**").hasRole("ADMIN")`
      - `.requestMatchers("/auth/login", "/api/auth/login").permitAll()`
      - `.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);`
  - The filter class is [`com.medicart.auth.security.JwtAuthenticationFilter`](microservices/auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java) and is added before `UsernamePasswordAuthenticationFilter` so JWT-based auth runs for each request.

4) How other microservices know a request is authenticated
There are two common approaches; your project uses the stateless JWT approach:

A. Stateless JWT validation (recommended in this repo)
- Auth Service issues a signed JWT (HMAC secret or RS256 private key).
- Any service (including the API Gateway) that has the signing key (HMAC secret or the public RSA key) can verify:
  - token signature
  - exp / nbf
  - optional issuer (iss) / audience (aud)
- After verification, the service extracts claims (user id, roles) and sets a local SecurityContext (e.g., Spring Security Authentication).
- This lets every service perform authorization without network calls to Auth Service.

B. Central validation / token introspection (alternate)
- Services call Auth Service’s introspect endpoint each request (or cache results).
- Simpler for token revocation, but adds latency and coupling.

Why stateless JWT works here:
- SecurityConfig shows the app applies the JwtAuthenticationFilter to requests (so each service can validate tokens locally).
- The Gateway can optionally validate tokens and forward claims to downstream services (e.g., via headers), or downstream services can validate themselves.

5) Example: Token verification logic (illustrative)
- A JwtAuthenticationFilter (referenced above) typically:
  - Reads Authorization header
  - Extracts Bearer token
  - Uses the signing secret/public key to validate signature and expiration
  - Builds an Authentication object with GrantedAuthorities from token claims
  - Places it into SecurityContextHolder

Example (illustrative Java - verify step):
```java
// language: java
// ... example snippet, compare with:
// com.medicart.auth.security.JwtAuthenticationFilter (microservices/auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java)
String token = extractBearerToken(request.getHeader("Authorization"));
Claims claims = Jwts.parserBuilder()
    .setSigningKey(secretKey) // or public key for RSA
    .build()
    .parseClaimsJws(token)
    .getBody();

String userId = claims.getSubject();
List<String> roles = claims.get("roles", List.class);

// Create auth with authorities and set context
UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
SecurityContextHolder.getContext().setAuthentication(auth);
filterChain.doFilter(request, response);