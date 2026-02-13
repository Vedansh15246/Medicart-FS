# 10 — API Gateway & Service Discovery (Eureka)

## 📌 What This Feature Does

The **API Gateway** is the single entry point for ALL frontend requests. Instead of the frontend calling 5 different backend services on 5 different ports, it calls ONE gateway (port 8080) which routes requests to the correct service.

**Eureka** is the **service registry** — a directory where all microservices register themselves. The gateway uses Eureka to find where each service is running.

```
Without Gateway:
Frontend → http://localhost:8081/auth/login        (Auth Service)
Frontend → http://localhost:8082/medicines          (Catalogue Service)
Frontend → http://localhost:8083/api/cart            (Cart-Orders Service)
Frontend → http://localhost:8086/api/payment         (Payment Service)
Frontend → http://localhost:8085/api/analytics       (Analytics Service)

With Gateway:
Frontend → http://localhost:8080/auth/login          ──→ Auth Service
Frontend → http://localhost:8080/medicines            ──→ Catalogue Service
Frontend → http://localhost:8080/api/cart              ──→ Cart-Orders Service
Frontend → http://localhost:8080/api/payment           ──→ Payment Service
Frontend → http://localhost:8080/api/analytics         ──→ Analytics Service

The frontend only knows about port 8080!
```

---

## 🏗️ Architecture

```
┌──────────────┐
│   Frontend   │ (React, port 5173)
│   client.js  │ ← All requests go to http://localhost:8080
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────────────────────┐
│      API Gateway (8080)      │
│  ┌──────────────────────┐    │
│  │ CorsWebFilter        │    │ ← Handles CORS (cross-origin)
│  ├──────────────────────┤    │
│  │ JwtAuthenticationFilter│   │ ← Validates JWT, extracts user info
│  ├──────────────────────┤    │
│  │ Route Matching        │    │ ← Matches URL to service
│  └──────────────────────┘    │
└──────┬──────┬──────┬────┬────┘
       │      │      │    │
       ▼      ▼      ▼    ▼
   ┌──────┐┌──────┐┌──────┐┌──────┐
   │ Auth ││Catalog││ Cart ││Payment│   ← Backend services
   │ 8081 ││ 8082 ││ 8083 ││ 8086 │       registered in Eureka
   └──────┘└──────┘└──────┘└──────┘

┌────────────────────────────────────┐
│    Eureka Server (8761)            │
│    Service Registry                │
│    Knows where each service lives  │
└────────────────────────────────────┘
```

---

## 📂 File Map

### API Gateway (port 8080)

| File | Purpose |
|------|---------|
| `api-gateway/src/.../filter/JwtAuthenticationFilter.java` | JWT validation + header forwarding |
| `api-gateway/src/.../config/SecurityConfig.java` | CORS config + permit all through Spring Security |
| `api-gateway/src/main/resources/application.properties` | Routes, Eureka config, JWT secret |

### Eureka Server (port 8761)

| File | Purpose |
|------|---------|
| `eureka-server/src/main/resources/application.properties` | Eureka server config |
| `eureka-server/src/.../EurekaServerApplication.java` | Main class with `@EnableEurekaServer` |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/api/client.js` | Axios instance pointing to gateway (port 8080) |

---

## 🔧 Eureka Server — Service Discovery

### What is Eureka?

Think of Eureka as a **phone book** for microservices:
1. Each service starts up and **registers** itself: "I'm auth-service, I'm at localhost:8081"
2. The Gateway asks Eureka: "Where is auth-service?" → "It's at localhost:8081"
3. Gateway forwards the request to that address

### Eureka Server Configuration

```properties
# eureka-server/application.properties

spring.application.name=eureka-server
server.port=8761

# Eureka server settings
eureka.instance.hostname=localhost
eureka.instance.prefer-ip-address=false

# DON'T register yourself with Eureka (you ARE Eureka)
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# Self-preservation mode: don't evict services too quickly
eureka.server.enable-self-preservation=true
eureka.server.eviction-interval-timer-in-ms=60000
```

**Key settings explained:**
- `register-with-eureka=false` — The Eureka server doesn't register with itself
- `fetch-registry=false` — The Eureka server doesn't need to fetch the registry from itself
- `enable-self-preservation=true` — If many services stop sending heartbeats at once, Eureka assumes it's a network issue and keeps them registered (prevents mass de-registration)
- `eviction-interval-timer-in-ms=60000` — Check for dead services every 60 seconds

### How Services Register

Every microservice has this in its `application.properties`:

```properties
# In auth-service, admin-catalogue-service, cart-orders-service, etc.
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=false
eureka.instance.hostname=localhost
```

This tells Spring Boot: "On startup, register with the Eureka server at port 8761."

### Eureka Dashboard

Visit `http://localhost:8761` in your browser to see all registered services:

```
Application                AMIs    Zones   Status
AUTH-SERVICE                n/a     1       UP (1) - localhost:8081
ADMIN-CATALOGUE-SERVICE     n/a     1       UP (1) - localhost:8082
CART-ORDERS-SERVICE         n/a     1       UP (1) - localhost:8083
ANALYTICS-SERVICE           n/a     1       UP (1) - localhost:8085
PAYMENT-SERVICE             n/a     1       UP (1) - localhost:8086
API-GATEWAY                 n/a     1       UP (1) - localhost:8080
```

---

## 🔧 API Gateway — Route Configuration

### All Routes

```properties
# api-gateway/application.properties

# Route 0: Auth Service
spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=lb://auth-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/auth/**,/api/auth/**,/prescriptions/**
spring.cloud.gateway.routes[0].filters[0]=StripPrefix=0

# Route 1: Medicines (Admin-Catalogue)
spring.cloud.gateway.routes[1].id=medicines-service
spring.cloud.gateway.routes[1].uri=lb://admin-catalogue-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/medicines/**,/medicines

# Route 2: Batches (Admin-Catalogue)
spring.cloud.gateway.routes[2].id=batches-service
spring.cloud.gateway.routes[2].uri=lb://admin-catalogue-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/batches/**

# Route 3: Cart (Cart-Orders)
spring.cloud.gateway.routes[3].id=cart-service
spring.cloud.gateway.routes[3].uri=lb://cart-orders-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/cart/**

# Route 4: Orders (Cart-Orders)
spring.cloud.gateway.routes[4].id=orders-service
spring.cloud.gateway.routes[4].uri=lb://cart-orders-service
spring.cloud.gateway.routes[4].predicates[0]=Path=/api/orders/**

# Route 5: Address (Cart-Orders)
spring.cloud.gateway.routes[5].id=address-service
spring.cloud.gateway.routes[5].uri=lb://cart-orders-service
spring.cloud.gateway.routes[5].predicates[0]=Path=/api/address/**

# Route 6: Analytics
spring.cloud.gateway.routes[6].id=analytics-service
spring.cloud.gateway.routes[6].uri=lb://analytics-service
spring.cloud.gateway.routes[6].predicates[0]=Path=/api/analytics/**

# Route 7: Reports (same analytics service)
spring.cloud.gateway.routes[7].id=reports-service
spring.cloud.gateway.routes[7].uri=lb://analytics-service
spring.cloud.gateway.routes[7].predicates[0]=Path=/api/reports/**

# Route 8: Payment
spring.cloud.gateway.routes[8].id=payment-service
spring.cloud.gateway.routes[8].uri=lb://payment-service
spring.cloud.gateway.routes[8].predicates[0]=Path=/api/payment/**
```

### How Routing Works

```
Frontend sends: GET http://localhost:8080/api/cart/total
                                            │
Gateway matches predicates:                 │
  /auth/**          → No match              │
  /medicines/**     → No match              │
  /api/cart/**      → ✅ MATCH!             │
                                            ▼
Uses URI: lb://cart-orders-service
  │
  │  "lb://" means "load-balanced" → asks Eureka for address
  ▼
Eureka returns: localhost:8083
  │
  ▼
Gateway forwards: GET http://localhost:8083/api/cart/total
```

**Key syntax explained:**
- `lb://` — "Load Balanced" prefix. Tells the gateway to look up the service in Eureka
- `Path=/api/cart/**` — Match any URL starting with `/api/cart/`
- `StripPrefix=0` — Don't remove any path segments (forward the URL as-is)

---

## 🔒 API Gateway — JWT Authentication Filter

This is the **most important file** in the gateway. It runs on EVERY request.

### Filter Order

```java
@Override
public int getOrder() {
    return -1;  // Run before routing (-1 = high priority)
}
```

### The Filter Pipeline

```
Every HTTP request enters the filter:

1. Is this a PUBLIC path? (login, register, medicine catalog)
   ├── YES → Skip JWT check, forward to service
   └── NO → Continue ▼

2. Does the request have an Authorization header?
   ├── NO → Return 401 Unauthorized
   └── YES → Continue ▼

3. Parse and validate the JWT token
   ├── INVALID → Return 401 Unauthorized
   └── VALID → Extract: userId, email, role → Continue ▼

4. Is this an ADMIN-ONLY route? (POST/PUT/DELETE medicines)
   ├── YES and role ≠ ROLE_ADMIN → Return 403 Forbidden
   └── NO, or YES and role = ROLE_ADMIN → Continue ▼

5. Mutate the request: Add headers X-User-Id, X-User-Email, X-User-Role
   │
   ▼
6. Forward to the appropriate backend service
```

### Public Paths (No JWT Required)

```java
private static final List<String> PUBLIC_PATHS = List.of(
    "/auth/login",              // Login endpoint
    "/auth/register",           // Registration
    "/auth/forgot-password",    // Forgot password
    "/auth/reset-password",     // Reset password
    "/auth/otp/",               // OTP endpoints
    "/health",                  // Health checks
    "/v3/api-docs",             // Swagger docs
    "/swagger-ui"               // Swagger UI
);

// These are public ONLY for GET requests (browse catalog without login)
private static final List<String> PUBLIC_GET_PATHS = List.of(
    "/medicines",    // Anyone can view medicines
    "/batches"       // Anyone can view batches
);
```

### JWT Validation and Header Forwarding

```java
// Extract JWT from "Bearer <token>"
String token = authHeader.substring(7);

// Parse and validate
Claims claims = Jwts.parser()
    .verifyWith(getSigningKey())      // Same secret as auth-service
    .build()
    .parseSignedClaims(token)
    .getPayload();

// Extract user info from JWT claims
String email = claims.getSubject();               // "john@test.com"
String role = claims.get("scope", String.class);  // "ROLE_USER" or "ROLE_ADMIN"
Object userIdObj = claims.get("userId");           // 42

// Add headers for downstream services
ServerHttpRequest mutatedRequest = request.mutate()
    .header("X-User-Id", userId)        // Backend reads this
    .header("X-User-Email", email)
    .header("X-User-Role", role)
    .build();
```

**Why forward headers instead of the JWT?**
Backend services don't need to parse the JWT themselves — the gateway already did it. They just read the simple headers:
```java
// In any backend controller:
@RequestHeader("X-User-Id") Long userId
// That's it! No JWT library needed in each service.
```

### Admin-Only Route Check

```java
private boolean isAdminOnly(String path, HttpMethod method) {
    // POST/PUT/DELETE on /medicines → ADMIN only
    if (path.startsWith("/medicines") &&
        (method.equals(POST) || method.equals(PUT) || method.equals(DELETE))) {
        return true;
    }
    // DELETE on /batches → ADMIN only
    if (path.startsWith("/batches") && method.equals(DELETE)) {
        return true;
    }
    return false;
}
```

**Examples:**
| Request | Admin Required? | Result |
|---------|----------------|--------|
| `GET /medicines` | No (public) | Anyone can browse |
| `POST /medicines` | Yes | Only ROLE_ADMIN can create |
| `PUT /medicines/5` | Yes | Only ROLE_ADMIN can edit |
| `DELETE /medicines/5` | Yes | Only ROLE_ADMIN can delete |
| `GET /api/cart` | No (needs JWT though) | Any logged-in user |
| `POST /auth/login` | No (public) | Anyone |

---

## 🔧 API Gateway — CORS Configuration

### What is CORS?

**Cross-Origin Resource Sharing** — A browser security feature that blocks requests from one domain to another.

Your frontend is at `http://localhost:5173` (Vite dev server), but the API is at `http://localhost:8080` (Gateway). Different ports = different "origins" = browser blocks the request.

CORS configuration tells the browser: "It's OK, allow requests from these origins."

### SecurityConfig.java

```java
@Bean
@Order(Ordered.HIGHEST_PRECEDENCE)  // Run BEFORE everything else
public CorsWebFilter corsWebFilter() {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    
    // Which origins can make requests
    corsConfiguration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",   // Vite dev server
        "http://localhost:3000",   // Alternative dev port
        "http://localhost:5174"    // Vite fallback port
    ));
    
    // Which HTTP methods are allowed
    corsConfiguration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
    ));
    
    // Which headers can be sent
    corsConfiguration.setAllowedHeaders(Arrays.asList("*"));  // Allow all
    
    // Allow cookies/auth headers
    corsConfiguration.setAllowCredentials(true);
    
    // Cache preflight response for 1 hour
    corsConfiguration.setMaxAge(3600L);
    
    // Apply to all routes
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", corsConfiguration);
    
    return new CorsWebFilter(source);
}
```

### Spring Security — Permit All

```java
@Bean
public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
    http
        .csrf(csrf -> csrf.disable())           // Disable CSRF (we use JWT instead)
        .httpBasic(httpBasic -> httpBasic.disable())   // No basic auth popup
        .formLogin(formLogin -> formLogin.disable())    // No form login page
        .authorizeExchange(authorize ->
            authorize.anyExchange().permitAll()   // Let everything through
        );
    return http.build();
}
```

**Why permitAll?** Because the `JwtAuthenticationFilter` (a GlobalFilter) handles all authentication. We disable Spring Security's built-in auth to avoid conflicts.

---

## 🎨 Frontend — Axios Client (`client.js`)

### Base Configuration

```javascript
const client = axios.create({
    baseURL: "http://localhost:8080",  // All requests go to the Gateway
    headers: {
        "Content-Type": "application/json",
    },
});
```

### Request Interceptor — Token & User ID

Every request automatically gets:
1. `Authorization: Bearer <token>` header
2. `X-User-Id: <userId>` header

```javascript
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    // Add JWT token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Extract userId from JWT and add as header
    let userId = extractUserIdFromToken(token);
    if (!userId) {
        userId = localStorage.getItem("userId");  // Fallback
    }
    if (userId !== null && userId !== undefined) {
        config.headers["X-User-Id"] = String(userId);
    }

    return config;
});
```

### JWT Decoding (Client-Side)

```javascript
const extractUserIdFromToken = (token) => {
    // JWT format: header.payload.signature
    const base64Url = token.split('.')[1];         // Get payload part
    const base64 = base64Url                        // Convert URL-safe to standard base64
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)                                // Decode base64 → string
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    const payload = JSON.parse(jsonPayload);       // Parse JSON
    return payload.userId || payload.id;            // Extract userId
};
```

### Response Interceptor — Error Handling

```javascript
client.interceptors.response.use(
    (res) => res,  // Success: pass through
    (err) => {
        if (err.response?.status === 401) {
            // Token expired or invalid
            logger.warn("Session expired");
        }
        if (err.response?.status === 403) {
            // Not authorized (e.g., regular user trying admin action)
            logger.error("Access Forbidden");
        }
        return Promise.reject(err);  // Re-throw for component to handle
    }
);
```

---

## 🔄 Complete Request Flow

Here's what happens when a logged-in user views their cart:

```
1. Frontend: CartPage calls dispatch(fetchCart())
      │  GET http://localhost:8080/api/cart
      │  Headers: Authorization: Bearer eyJhbGci..., X-User-Id: 42
      ▼
2. API Gateway receives the request
      │  CorsWebFilter: ✅ Origin localhost:5173 is allowed
      ▼
3. JwtAuthenticationFilter runs
      │  isPublicPath("/api/cart")? → NO
      │  Has Authorization header? → YES ("Bearer eyJhbGci...")
      │  Parse JWT → Valid! Claims: { sub: "john@test.com", scope: "ROLE_USER", userId: 42 }
      │  isAdminOnly? → NO (GET request)
      │  Mutate request: Add X-User-Id: 42, X-User-Email: john@test.com, X-User-Role: ROLE_USER
      ▼
4. Route matching
      │  /api/cart/** matches route[3] → lb://cart-orders-service
      │  Eureka lookup: cart-orders-service → localhost:8083
      ▼
5. Gateway forwards to: GET http://localhost:8083/api/cart
      │  Headers: X-User-Id: 42, X-User-Email: john@test.com
      ▼
6. CartController receives the request
      │  @RequestHeader("X-User-Id") Long userId → 42
      │  Returns user's cart items
      ▼
7. Response flows back: Service → Gateway → Frontend
```

---

## 🧠 Key Concepts for Beginners

### 1. What is an API Gateway?
A single entry point for all API requests. Benefits:
- **Single URL** — Frontend only needs to know one address
- **Security** — JWT validation happens once, at the gate
- **Routing** — Maps URLs to backend services automatically
- **CORS** — Configured in one place
- **Load balancing** — Can distribute traffic across multiple instances

### 2. What is `GlobalFilter`?
A Spring Cloud Gateway interface. A GlobalFilter runs on EVERY request, before routing. Our `JwtAuthenticationFilter implements GlobalFilter` runs before every request to check the JWT.

### 3. What is `lb://`?
"Load Balanced" URI scheme. Instead of hardcoding `http://localhost:8081`, you write `lb://auth-service`. The gateway looks up "auth-service" in Eureka and gets the actual address. If you had 3 instances of auth-service, `lb://` would distribute requests across them.

### 4. What is `ServerWebExchange`?
In Spring's reactive stack (WebFlux), `ServerWebExchange` is the equivalent of `HttpServletRequest` + `HttpServletResponse` combined. The gateway uses reactive programming because it handles many concurrent connections.

### 5. What is a Predicate?
A route predicate is a **condition** that must be true for the route to match:
```properties
predicates[0]=Path=/api/cart/**
```
"If the URL path starts with `/api/cart/`, use this route."

### 6. What is `StripPrefix`?
A filter that removes path segments:
- `StripPrefix=0` — Keep the URL as-is
- `StripPrefix=1` — Remove first segment: `/api/cart/total` → `/cart/total`
All our routes use `StripPrefix=0` because the backend URLs match the frontend URLs.

### 7. What is JWT Secret Sharing?
The gateway and auth-service must use the **same secret key** to sign/verify tokens:
```properties
# auth-service/application.properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart

# api-gateway/application.properties (MUST be identical!)
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```
If they don't match, the gateway can't verify tokens created by the auth-service.

---

## ⚡ Quick Reference

| Concept | Value |
|---------|-------|
| Gateway Port | 8080 |
| Eureka Port | 8761 |
| Eureka Dashboard | http://localhost:8761 |
| JWT Secret | `your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart` |
| CORS Origins | localhost:5173, 5174, 3000 |
| Total Routes | 9 routes to 5 services |
| Public Paths | /auth/login, /auth/register, /auth/forgot-password, GET /medicines, GET /batches |
| Admin Paths | POST/PUT/DELETE /medicines, DELETE /batches |

### Route Summary Table

| URL Pattern | Destination Service | Port |
|-------------|-------------------|------|
| `/auth/**` | auth-service | 8081 |
| `/medicines/**` | admin-catalogue-service | 8082 |
| `/batches/**` | admin-catalogue-service | 8082 |
| `/api/cart/**` | cart-orders-service | 8083 |
| `/api/orders/**` | cart-orders-service | 8083 |
| `/api/address/**` | cart-orders-service | 8083 |
| `/api/analytics/**` | analytics-service | 8085 |
| `/api/reports/**` | analytics-service | 8085 |
| `/api/payment/**` | payment-service | 8086 |
