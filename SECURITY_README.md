# 🔐 MediCart Security — Complete Guide (Beginner Friendly)

> This document explains **everything** about how security works in the MediCart project.
> Every step, every file, every line of code — explained so that a complete beginner can understand it.

---

## 📌 Table of Contents

1. [What is Security and Why Do We Need It?](#1-what-is-security-and-why-do-we-need-it)
2. [What is JWT (JSON Web Token)?](#2-what-is-jwt-json-web-token)
3. [Architecture Overview — How Security Flows](#3-architecture-overview--how-security-flows)
4. [Step-by-Step: What Happens When a User Registers](#4-step-by-step-what-happens-when-a-user-registers)
5. [Step-by-Step: What Happens When a User Logs In](#5-step-by-step-what-happens-when-a-user-logs-in)
6. [Step-by-Step: What Happens on Every API Request](#6-step-by-step-what-happens-on-every-api-request)
7. [Step-by-Step: Forgot Password & OTP Flow](#7-step-by-step-forgot-password--otp-flow)
8. [All Security Files Explained (Backend)](#8-all-security-files-explained-backend)
9. [All Security Files Explained (Frontend)](#9-all-security-files-explained-frontend)
10. [Role-Based Access Control (RBAC)](#10-role-based-access-control-rbac)
11. [CORS — Cross-Origin Resource Sharing](#11-cors--cross-origin-resource-sharing)
12. [Password Hashing with BCrypt](#12-password-hashing-with-bcrypt)
13. [Complete File Map](#13-complete-file-map)
14. [Security Flow Diagram](#14-security-flow-diagram)
15. [Common Questions](#15-common-questions)

---

## 1. What is Security and Why Do We Need It?

### The Problem
Imagine a medical store website (MediCart). Without security:
- Anyone can pretend to be any user
- Anyone can access admin pages and delete medicines
- Anyone can see other people's orders
- Passwords stored as plain text can be stolen

### The Solution
We use **JWT-based authentication** and **role-based authorization**:
- **Authentication** = "Who are you?" (prove you are who you say you are)
- **Authorization** = "What can you do?" (admin vs normal user permissions)

### Technologies Used
| Technology | What It Does |
|---|---|
| **Spring Security** | Java framework that handles security in Spring Boot |
| **JWT (JSON Web Token)** | A token (like a digital ID card) sent with every request |
| **BCrypt** | Algorithm to safely hash (encrypt) passwords |
| **CORS** | Rules that allow our frontend (port 5173) to talk to backend (port 8080) |
| **HMAC-SHA256 (HS256)** | Algorithm used to sign/verify JWT tokens |

---

## 2. What is JWT (JSON Web Token)?

### Simple Explanation
JWT is like a **digital ID card** that the server gives you when you log in.

- You show your username and password → Server checks them → Server gives you a JWT token
- For every future request, you show this token instead of typing your password again
- The token contains your info (user ID, email, role) encoded inside it

### JWT Structure
A JWT looks like this:
```
eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfVVNFUiIsImVtYWlsIjoiam9obkBnbWFpbC5jb20iLCJ1c2VySWQiOjEsInN1YiI6ImpvaG5AZ21haWwuY29tIiwiZXhwIjoxNjk5MDAwMDAwfQ.abc123signature
```

It has **3 parts** separated by dots (`.`):

```
HEADER.PAYLOAD.SIGNATURE
```

| Part | What It Contains | Example |
|---|---|---|
| **Header** | Algorithm used (HS256) | `{"alg": "HS256"}` |
| **Payload** | User data (email, role, userId, expiry time) | `{"email": "john@gmail.com", "scope": "ROLE_USER", "userId": 1}` |
| **Signature** | A cryptographic signature to verify the token hasn't been tampered with | `HMACSHA256(header + payload, secret_key)` |

### Important Concepts
- **Secret Key**: A password known only to the server. Used to sign and verify tokens.
  - Our secret: `your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart`
  - This SAME secret must be used in **both** auth-service AND api-gateway
- **Expiration**: Token expires after 1 hour (3600000 milliseconds)
- **Bearer Token**: The format used in HTTP headers: `Authorization: Bearer <token>`

---

## 3. Architecture Overview — How Security Flows

```
┌──────────────────┐
│   React Frontend │  (Port 5173)
│   (Browser)      │
└────────┬─────────┘
         │
         │  Every request has:
         │  - Authorization: Bearer <JWT_TOKEN>
         │  - X-User-Id: 1
         │
         ▼
┌──────────────────────────────────┐
│         API GATEWAY              │  (Port 8080)
│                                  │
│  1. CORS Filter (allow frontend) │
│  2. JWT Filter (check token)     │
│  3. Route to correct service     │
│  4. Add X-User-Id, X-User-Email │
│     X-User-Role headers          │
└────────┬─────────────────────────┘
         │
         │  Forwards request + user headers
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Auth    │ │Admin   │ │Cart    │ │Payment │
│Service │ │Catalog │ │Orders  │ │Service │
│(8081)  │ │(8082)  │ │(8083)  │ │(8086)  │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Key Idea: Two Levels of Security

1. **API Gateway** (Port 8080) — The "Front Door"
   - Checks JWT token validity
   - Extracts user info from token
   - Passes user info to downstream services via headers
   - Blocks unauthorized requests BEFORE they reach any service

2. **Individual Services** — The "Inner Doors"
   - Each service has its own Spring Security config
   - They trust the headers set by the gateway
   - They have their own JWT filter as backup

---

## 4. Step-by-Step: What Happens When a User Registers

Let's follow the complete flow when a user registers:

### Step 1: User Fills Registration Form (Frontend)
**File: `frontend/src/features/auth/pages/Register.jsx`**

User fills in: Full Name, Email, Phone, Password

### Step 2: Frontend Sends Registration Request
**File: `frontend/src/api/authService.js`**

```javascript
// Line 14-25: Register function
register: async (userData) => {
    const payload = {
        email: userData.email?.trim() || "",
        password: userData.password?.trim() || "",
        fullName: userData.fullName?.trim() || "",
        phone: String(userData.phone).trim() || "",
    };
    const response = await client.post("/auth/register", payload);
    return response.data;
},
```
**What happens:** Sends a POST request to `http://localhost:8080/auth/register` with user data.

### Step 3: Request Goes Through API Gateway
**File: `microservices/api-gateway/src/main/resources/application.properties`**

```properties
# Line 14-17: Gateway route for auth-service
spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=lb://auth-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/auth/**,/api/auth/**,...
```
**What happens:** Gateway sees `/auth/register`, matches route `auth-service`, forwards to auth-service on port 8081.

### Step 4: Gateway JWT Filter SKIPS This Request
**File: `microservices/api-gateway/src/main/java/com/medicart/gateway/filter/JwtAuthenticationFilter.java`**

```java
// Line 39-56: Public paths list
private static final List<String> PUBLIC_PATHS = List.of(
    "/auth/login",
    "/auth/register",    // ← Registration is public!
    "/auth/forgot-password",
    ...
);
```
**What happens:** `/auth/register` is in the PUBLIC_PATHS list, so the JWT filter says "this is a public path, no token needed" and lets the request pass through.

### Step 5: Auth Service Receives the Request
**File: `microservices/auth-service/src/main/java/com/medicart/auth/controller/AuthController.java`**

```java
// Line 33-40: Register endpoint
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    try {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```
**What happens:** Controller receives the request and calls `authService.register()`.

### Step 6: AuthService Creates the User
**File: `microservices/auth-service/src/main/java/com/medicart/auth/service/AuthService.java`**

```java
// Line 38-72: Registration logic
public LoginResponse register(RegisterRequest request) {
    // 1. Check if email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("User already exists with this email");
    }

    // 2. Find the "ROLE_USER" role (or create it if it doesn't exist)
    Role role = roleRepository.findByName("ROLE_USER")
            .orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName("ROLE_USER");
                return roleRepository.save(newRole);
            });

    // 3. Create the user object
    //    PASSWORD IS HASHED with BCrypt (never stored as plain text!)
    User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))  // ← HASHING!
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .isActive(true)
            .role(role)
            .build();

    // 4. Save user to MySQL database
    user = userRepository.save(user);

    // 5. Generate JWT token for this new user
    String token = jwtService.generateToken(user);

    // 6. Return token + user info
    return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(3600L)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(Arrays.asList(user.getRole().getName()))
            .build();
}
```

### Step 7: JWT Token is Generated
**File: `microservices/auth-service/src/main/java/com/medicart/auth/service/JwtService.java`**

```java
// Line 26-43: Token generation
public String generateToken(User user) {
    // 1. Create claims (data stored inside the token)
    Map<String, Object> claims = new HashMap<>();
    claims.put("scope", "ROLE_" + user.getRole().getName().replace("ROLE_", ""));
    // scope = "ROLE_USER" or "ROLE_ADMIN"
    claims.put("email", user.getEmail());
    claims.put("fullName", user.getFullName());
    claims.put("userId", user.getId());  // numeric user ID

    // 2. Build the JWT token
    return Jwts.builder()
            .claims(claims)                                        // user data
            .subject(user.getEmail())                              // main identifier
            .issuedAt(new Date())                                  // when token was created
            .expiration(new Date(System.currentTimeMillis() + expiration))  // when it expires (1 hour)
            .signWith(getSigningKey())                              // sign with secret key
            .compact();                                            // build the token string
}
```
**What happens:** Creates a JWT token containing: email, role (ROLE_USER), userId, fullName. Signs it with the secret key.

### Step 8: Frontend Stores the Token
**File: `frontend/src/features/auth/pages/Register.jsx`** (in handleSubmit)

After registration, the frontend stores the token in `localStorage`:
```javascript
localStorage.setItem("accessToken", response.token);
localStorage.setItem("userId", response.userId);
localStorage.setItem("userRole", response.roles[0]);
localStorage.setItem("userName", response.fullName);
localStorage.setItem("userEmail", response.email);
```
**What happens:** The JWT token is saved in the browser's localStorage. From now on, every API request will include this token.

---

## 5. Step-by-Step: What Happens When a User Logs In

### Step 1: User Enters Email and Password
### Step 2: Frontend Sends Login Request

**File: `frontend/src/api/authService.js`**
```javascript
// Line 8-11: Login function
login: async (email, password) => {
    const response = await client.post("/auth/login", { email, password });
    return response.data;
},
```

### Step 3: Gateway Skips JWT Check (Public Path)
`/auth/login` is in the PUBLIC_PATHS list → no token needed.

### Step 4: AuthService Validates Credentials

**File: `microservices/auth-service/src/main/java/com/medicart/auth/service/AuthService.java`**

```java
// Line 74-97: Login logic
public LoginResponse login(LoginRequest request) {
    // 1. Find user by email
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 2. Check if account is active
    if (!user.getIsActive()) {
        throw new RuntimeException("User account is inactive");
    }

    // 3. Compare entered password with stored hashed password
    //    BCrypt.matches("admin123", "$2a$10$hashedValue...") → true/false
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    // 4. Generate new JWT token
    String token = jwtService.generateToken(user);

    // 5. Return token + user info
    return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(3600L)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(List.of(user.getRole().getName()))
            .build();
}
```

### Step 5: Frontend Stores Token (Same as Registration Step 8)

---

## 6. Step-by-Step: What Happens on Every API Request

After login, when the user does ANYTHING (view medicines, add to cart, place order), this is what happens:

### Step 1: Frontend Axios Interceptor Adds Token
**File: `frontend/src/api/client.js`**

```javascript
// Line 38-88: Request interceptor
client.interceptors.request.use((config) => {
    // 1. Get token from localStorage
    const token = localStorage.getItem("accessToken");
    
    // 2. Add Authorization header if token exists
    if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = token.startsWith("Bearer ") 
            ? token 
            : `Bearer ${token}`;
    }
    
    // 3. Also add X-User-Id header
    let userId = extractUserIdFromToken(token);
    if (userId !== null && userId !== undefined) {
        config.headers["X-User-Id"] = String(userId);
    }
    
    return config;
});
```
**What happens:** Before EVERY request, the interceptor automatically:
1. Reads the JWT token from localStorage
2. Adds `Authorization: Bearer <token>` header
3. Extracts userId from the token and adds `X-User-Id` header

So the actual HTTP request looks like:
```
GET /api/cart HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzY29...
X-User-Id: 1
Content-Type: application/json
```

### Step 2: Request Hits API Gateway
**File: `microservices/api-gateway/src/main/java/com/medicart/gateway/filter/JwtAuthenticationFilter.java`**

```java
// Line 72-134: Gateway JWT filter
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = request.getURI().getPath();
    HttpMethod method = request.getMethod();

    // 1. Check if it's a public path → skip JWT check
    if (isPublicPath(path, method)) {
        return chain.filter(exchange);
    }

    // 2. Extract Authorization header
    String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        // No token → 401 Unauthorized
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    // 3. Extract and validate the JWT token
    String token = authHeader.substring(7);
    Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())      // Use same secret key
            .build()
            .parseSignedClaims(token)
            .getPayload();

    // 4. Extract user info from token
    String email = claims.getSubject();
    String role = claims.get("scope", String.class);
    String userId = claims.get("userId").toString();

    // 5. Add user info as HTTP headers (for downstream services)
    ServerHttpRequest mutatedRequest = request.mutate()
            .header("X-User-Id", userId)
            .header("X-User-Email", email)
            .header("X-User-Role", role)
            .build();

    // 6. Check if admin-only endpoint
    if (isAdminOnly(path, method) && !"ROLE_ADMIN".equals(role)) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);  // 403
        return exchange.getResponse().setComplete();
    }

    // 7. Forward to downstream service with user headers
    return chain.filter(exchange.mutate().request(mutatedRequest).build());
}
```

### Step 3: Gateway Routes to Correct Service
Based on the path:
| Path | Routed To |
|---|---|
| `/auth/**` | Auth Service (8081) |
| `/medicines/**` | Admin Catalogue Service (8082) |
| `/batches/**` | Admin Catalogue Service (8082) |
| `/api/cart/**` | Cart Orders Service (8083) |
| `/api/orders/**` | Cart Orders Service (8083) |
| `/api/payment/**` | Payment Service (8086) |
| `/api/analytics/**` | Analytics Service (8085) |

### Step 4: Downstream Service Reads User Headers
Each service reads `X-User-Id`, `X-User-Email`, `X-User-Role` from request headers to know who the user is.

---

## 7. Step-by-Step: Forgot Password & OTP Flow

### Step 1: User Enters Email
Frontend sends: `POST /auth/forgot-password` with `{ "email": "user@example.com" }`

### Step 2: Backend Generates OTP
**File: `microservices/auth-service/src/main/java/com/medicart/auth/service/OtpService.java`**

```java
public Map<String, Object> generateAndSendOtp(String email) {
    // 1. Generate random 6-digit OTP
    String otp = generateOtp();  // e.g., "482931"
    
    // 2. Store OTP in memory with timestamp
    otpStore.put(email, new OtpData(otp, System.currentTimeMillis()));
    
    // 3. Return OTP in response (for demo — in production, this would be sent via email)
    Map<String, Object> response = new HashMap<>();
    response.put("message", "OTP sent successfully");
    response.put("otp", otp);  // Shown in alert on frontend for demo
    return response;
}
```

### Step 3: User Enters OTP → Verified
`POST /auth/forgot-password/verify-otp` with `{ "email": "...", "otp": "482931" }`

### Step 4: User Sets New Password
`POST /auth/reset-password` with `{ "email": "...", "newPassword": "newPass123" }`

Password is hashed with BCrypt and saved to database.

---

## 8. All Security Files Explained (Backend)

### 📁 Auth Service Files

#### 1. `auth-service/src/main/java/com/medicart/auth/entity/User.java`
**Purpose:** Database entity that represents a user.

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                    // Auto-generated unique ID

    @Column(unique = true, nullable = false)
    private String email;               // Login identifier (must be unique)

    @Column(nullable = false)
    private String password;            // BCrypt-hashed password (NOT plain text!)

    @Column(nullable = false)
    private String fullName;            // Display name

    @Column(nullable = false)
    private String phone;               // Phone number

    @Builder.Default
    private Boolean isActive = true;    // Can disable accounts

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;                  // Links to Role table (ROLE_USER or ROLE_ADMIN)

    private LocalDateTime createdAt;    // When account was created
    private LocalDateTime updatedAt;    // Last update time
}
```
**Database Table Created:**
```
users table:
| id | email           | password (hashed)           | fullName | phone      | role_id | isActive |
|----|-----------------|------------------------------|----------|------------|---------|----------|
| 1  | admin@medicart  | $2a$10$xyz...               | Admin    | 9999999999 | 2       | true     |
| 2  | john@gmail.com  | $2a$10$abc...               | John     | 1234567890 | 1       | true     |
```

---

#### 2. `auth-service/src/main/java/com/medicart/auth/entity/Role.java`
**Purpose:** Defines user roles.

```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;          // "ROLE_USER" or "ROLE_ADMIN"

    private String description;   // "Standard user role" or "Administrator role"
}
```
**Database Table:**
```
roles table:
| id | name       | description        |
|----|------------|--------------------|
| 1  | ROLE_USER  | Standard user role |
| 2  | ROLE_ADMIN | Administrator role |
```

---

#### 3. `auth-service/src/main/java/com/medicart/auth/config/PasswordConfig.java`
**Purpose:** Configures BCrypt password encoder.

```java
@Configuration
public class PasswordConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
        // This tells Spring: "whenever you need a PasswordEncoder, use BCrypt"
    }
}
```
**Why BCrypt?**
- Plain text: `admin123` → Stored as: `admin123` (DANGEROUS! Anyone can read it)
- BCrypt: `admin123` → Stored as: `$2a$10$N9qo8uLOickgx2ZMRZoMye...` (SAFE! Can't reverse)
- BCrypt is **one-way** — you can check if a password matches, but you can't decrypt it back
- Even the same password gives a different hash each time (uses random "salt")

---

#### 4. `auth-service/src/main/java/com/medicart/auth/config/DataInitializer.java`
**Purpose:** Creates default roles and admin user when the application starts.

```java
@Component
public class DataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // 1. Create ROLE_USER if it doesn't exist
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            roleRepository.save(Role.builder()
                .name("ROLE_USER")
                .description("Standard user role")
                .build());
        }

        // 2. Create ROLE_ADMIN if it doesn't exist
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(Role.builder()
                .name("ROLE_ADMIN")
                .description("Administrator role")
                .build());
        }

        // 3. Create admin user if it doesn't exist
        if (userRepository.findByEmail("admin@medicart.com").isEmpty()) {
            User adminUser = User.builder()
                .email("admin@medicart.com")
                .password(passwordEncoder.encode("admin123"))  // Hashed!
                .fullName("Administrator")
                .phone("9999999999")
                .isActive(true)
                .role(adminRole)
                .build();
            userRepository.save(adminUser);
        }
    }
}
```
**What happens:** Every time the auth-service starts, it ensures that:
- `ROLE_USER` role exists in the database
- `ROLE_ADMIN` role exists in the database
- Default admin account (`admin@medicart.com` / `admin123`) exists

---

#### 5. `auth-service/src/main/java/com/medicart/auth/service/JwtService.java`
**Purpose:** Generates and validates JWT tokens.

```java
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;  // Read from application.properties

    @Value("${jwt.expiration}")
    private long expiration;   // 3600000 ms = 1 hour

    // Create the signing key from the secret string
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // GENERATE TOKEN — Called after login/register
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "ROLE_USER");        // or "ROLE_ADMIN"
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName());
        claims.put("userId", user.getId());

        return Jwts.builder()
            .claims(claims)                      // Embed user data
            .subject(user.getEmail())            // Main subject
            .issuedAt(new Date())                // Created now
            .expiration(new Date(now + 3600000)) // Expires in 1 hour
            .signWith(getSigningKey())           // Sign with secret
            .compact();                          // Build token string
    }

    // VALIDATE TOKEN — Check if token is valid (not expired, not tampered)
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())     // Same secret key
                .build()
                .parseSignedClaims(token);       // Will throw if invalid
            return true;
        } catch (Exception e) {
            return false;  // Token is expired, tampered, or malformed
        }
    }

    // EXTRACT EMAIL — Read email from token
    public String extractEmail(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();  // subject = email
    }
}
```

---

#### 6. `auth-service/src/main/java/com/medicart/auth/security/JwtAuthenticationFilter.java`
**Purpose:** Intercepts every HTTP request and validates the JWT token.

This is a **filter** — it runs BEFORE your controller code. Think of it like a security guard at the door.

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // OncePerRequestFilter = runs exactly once for each HTTP request

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,    // The incoming request
        HttpServletResponse response,  // The response we'll send back
        FilterChain filterChain        // The chain of other filters
    ) throws ServletException, IOException {

        // STEP 1: Read the Authorization header
        String header = request.getHeader("Authorization");
        // header = "Bearer eyJhbGciOiJIUzI1NiJ9..." or null

        // STEP 2: If no token, let request pass (Spring Security will decide)
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // STEP 3: Extract the token (remove "Bearer " prefix)
        String token = header.substring(7);

        try {
            // STEP 4: Parse and validate the token
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

            // STEP 5: Extract user info from token
            String email = claims.getSubject();       // "john@gmail.com"
            String role = (String) claims.get("scope"); // "ROLE_USER"

            // STEP 6: Create Spring Security Authentication object
            // This tells Spring Security: "This user is authenticated and has ROLE_USER"
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    email,    // principal (who)
                    null,     // credentials (password - not needed, already verified)
                    List.of(new SimpleGrantedAuthority(role))  // authorities (roles)
                );

            // STEP 7: Set authentication in SecurityContext
            // Now Spring Security knows who this user is for the rest of the request
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception ex) {
            // Token is invalid → clear any authentication
            SecurityContextHolder.clearContext();
        }

        // STEP 8: Continue to the next filter / controller
        filterChain.doFilter(request, response);
    }
}
```

---

#### 7. `auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java`
**Purpose:** Defines which endpoints are public and which require authentication.

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (not needed for JWT-based APIs)
            .csrf(csrf -> csrf.disable())

            // 2. Define access rules
            .authorizeHttpRequests(auth -> auth
                // PUBLIC — Anyone can access (no login needed)
                .requestMatchers("/auth/login").permitAll()
                .requestMatchers("/auth/register").permitAll()
                .requestMatchers("/auth/forgot-password").permitAll()
                .requestMatchers("/auth/reset-password").permitAll()
                .requestMatchers("/auth/health").permitAll()
                .requestMatchers("/auth/otp/**").permitAll()

                // ADMIN ONLY
                .requestMatchers("/batches/**").hasRole("ADMIN")
                .requestMatchers("/medicines/**").hasRole("ADMIN")

                // AUTHENTICATED — Must be logged in
                .requestMatchers("GET", "/auth/me").authenticated()
                .requestMatchers("/prescriptions/**").authenticated()

                // Everything else — Must be authenticated
                .anyRequest().authenticated()
            )

            // 3. Add JWT filter BEFORE Spring's default authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

**Flow of a request through filters:**
```
Request → CORS Filter → JWT Filter → Security Rules → Controller
                          ↑
                   Our custom filter
                   runs here (BEFORE
                   Spring's default)
```

---

### 📁 API Gateway Files

#### 8. `api-gateway/src/main/java/com/medicart/gateway/filter/JwtAuthenticationFilter.java`
**Purpose:** Gateway-level JWT validation. This is the FIRST security checkpoint.

**Key difference from auth-service filter:**
- Auth-service filter uses `OncePerRequestFilter` (servlet/MVC style)
- Gateway filter uses `GlobalFilter` (reactive/WebFlux style)
- Gateway extracts user info and passes it as HTTP headers to downstream services

```java
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    // PUBLIC_PATHS — These paths NEVER need a token
    private static final List<String> PUBLIC_PATHS = List.of(
        "/auth/login", "/auth/register", "/auth/forgot-password",
        "/auth/reset-password", "/auth/validate", "/auth/health", "/auth/otp/"
    );

    // PUBLIC_GET_PATHS — These are public ONLY for GET requests
    // (viewing medicines is public, but adding/editing requires admin)
    private static final List<String> PUBLIC_GET_PATHS = List.of(
        "/medicines", "/batches"
    );

    // isAdminOnly — These require ROLE_ADMIN
    private boolean isAdminOnly(String path, HttpMethod method) {
        // POST/PUT/DELETE on /medicines → ADMIN only
        if (path.startsWith("/medicines") && 
            (POST.equals(method) || PUT.equals(method) || DELETE.equals(method))) {
            return true;
        }
        // DELETE on /batches → ADMIN only
        if (path.startsWith("/batches") && DELETE.equals(method)) {
            return true;
        }
        return false;
    }
}
```

---

#### 9. `api-gateway/src/main/java/com/medicart/gateway/config/SecurityConfig.java`
**Purpose:** Gateway security — permits all (JWT check is in the custom filter).

```java
@Configuration
public class SecurityConfig {

    // CORS Filter — Allows frontend (localhost:5173) to call backend (localhost:8080)
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)  // Run FIRST, before all other filters
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",    // Vite dev server
            "http://localhost:3000",    // Alternate port
            "http://localhost:5174"     // Fallback port
        ));
        cors.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        cors.setAllowedHeaders(Arrays.asList("*"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        ...
    }

    // Permit all at Spring Security level (our custom filter handles auth)
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .authorizeExchange(auth -> auth.anyExchange().permitAll());
        return http.build();
    }
}
```

---

### 📁 Admin Catalogue Service Files

#### 10. `admin-catalogue-service/src/main/java/com/medicart/admin/config/WebSecurityConfig.java`
**Purpose:** Permits all requests (trusts the gateway for authentication).

```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // Trust gateway — it already validated the token
            )
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());
        return http.build();
    }
}
```

---

## 9. All Security Files Explained (Frontend)

#### 1. `frontend/src/api/client.js` — Axios HTTP Client
**Purpose:** Central HTTP client that automatically adds JWT token to every request.

**Key Parts:**

**a) Token extraction from JWT:**
```javascript
const extractUserIdFromToken = (token) => {
    // JWT has 3 parts: header.payload.signature
    const base64Url = cleanToken.split('.')[1];  // Get the payload part
    const jsonPayload = atob(base64);            // Decode from Base64
    const payload = JSON.parse(jsonPayload);     // Parse as JSON
    return payload.userId;                        // Return the user ID
};
```

**b) Request interceptor (runs before EVERY request):**
```javascript
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;  // Add token
    }
    config.headers["X-User-Id"] = String(userId);           // Add user ID
    return config;
});
```

**c) Response interceptor (handles errors):**
```javascript
client.interceptors.response.use(
    (res) => res,  // Success — pass through
    (err) => {
        if (err.response?.status === 401) {
            // Token expired or invalid → user needs to login again
        }
        if (err.response?.status === 403) {
            // User doesn't have permission (e.g., non-admin trying admin action)
        }
        return Promise.reject(err);
    }
);
```

---

#### 2. `frontend/src/api/authService.js` — Auth API Functions
**Purpose:** Functions to call auth endpoints.

| Function | Endpoint | Purpose |
|---|---|---|
| `login(email, password)` | `POST /auth/login` | Login and get token |
| `register(userData)` | `POST /auth/register` | Create account |
| `getCurrentUser()` | `GET /auth/me` | Get logged-in user profile |
| `updateProfile(userId, data)` | `PUT /auth/users/:id` | Update profile |
| `getAllUsers()` | `GET /auth/users` | Admin: list all users |
| `deleteUser(userId)` | `DELETE /auth/users/:id` | Admin: delete user |
| `logout()` | (client-side) | Remove token from localStorage |
| `forgotPassword(email)` | `POST /auth/forgot-password` | Start password reset |
| `resetPassword(email, newPass)` | `POST /auth/reset-password` | Set new password |

---

#### 3. `frontend/src/features/auth/authSlice.js` — Redux Auth State
**Purpose:** Manages authentication state in the React app using Redux.

```javascript
const initialState = {
    user: null,    // Current user object {id, name, email}
    token: null,   // JWT token string
    userId: null,  // User's numeric ID
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,    // Error message
};
```

| Action | What It Does |
|---|---|
| `setUser` | Store user + token after login |
| `logout` | Clear all user data |
| `initializeAuth` | On app start, check localStorage for existing login |
| `setError` | Store login/register error |

---

#### 4. `frontend/src/store/store.js` — Redux Store
**Purpose:** Combines all Redux slices.

```javascript
export const store = configureStore({
    reducer: {
        products: productReducer,  // Medicine catalog
        cart: cartReducer,         // Shopping cart
        auth: authReducer,        // Authentication state ← THIS ONE
    },
});
```

---

## 10. Role-Based Access Control (RBAC)

### Two Roles in MediCart

| Role | Access |
|---|---|
| `ROLE_USER` | View medicines, add to cart, place orders, manage own profile, upload prescriptions |
| `ROLE_ADMIN` | Everything above + add/edit/delete medicines, manage batches, view all users, view all orders, view analytics |

### Where Roles Are Checked

#### Level 1: API Gateway
```java
// Gateway checks: Is this an admin-only endpoint?
if (isAdminOnly(path, method) && !"ROLE_ADMIN".equals(role)) {
    return 403 FORBIDDEN;
}
```

#### Level 2: Auth Service SecurityConfig
```java
.requestMatchers("/medicines/**").hasRole("ADMIN")   // Only ADMIN can manage medicines
.requestMatchers("/batches/**").hasRole("ADMIN")      // Only ADMIN can manage batches
.requestMatchers("/prescriptions/**").authenticated() // Any logged-in user
.requestMatchers("/auth/login").permitAll()            // Anyone (even not logged in)
```

#### Level 3: Frontend
```javascript
// Frontend checks role to show/hide admin pages
const userRole = localStorage.getItem("userRole");
if (userRole === "ROLE_ADMIN") {
    // Show admin navigation (Users, Orders, Analytics)
}
```

---

## 11. CORS — Cross-Origin Resource Sharing

### The Problem
- Frontend runs on `http://localhost:5173` (Vite)
- Backend runs on `http://localhost:8080` (Gateway)
- Browsers BLOCK requests between different origins by default (security feature)

### The Solution
The API Gateway tells the browser: "It's okay, I trust requests from localhost:5173"

**File: `api-gateway/src/main/java/com/medicart/gateway/config/SecurityConfig.java`**

```java
CorsConfiguration cors = new CorsConfiguration();
cors.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",   // ← Our frontend
    "http://localhost:3000",
    "http://localhost:5174"
));
cors.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS","PATCH","HEAD"));
cors.setAllowedHeaders(Arrays.asList("*"));     // Allow any header (including Authorization)
cors.setAllowCredentials(true);                  // Allow cookies/credentials
cors.setMaxAge(3600L);                           // Cache CORS preflight for 1 hour
```

### How CORS Works
```
Browser: "Hey Gateway, can Frontend (localhost:5173) make a GET request to you?"
         → OPTIONS /medicines (preflight request)

Gateway: "Yes, I allow localhost:5173 to make GET, POST, PUT, DELETE requests"
         → 200 OK with CORS headers

Browser: "Great!" → Now sends the actual GET /medicines request
```

---

## 12. Password Hashing with BCrypt

### Why Not Store Plain Text Passwords?
If a hacker gets access to your database:
```
PLAIN TEXT (BAD):
| email           | password    |
|-----------------|-------------|
| admin@mc.com    | admin123    |  ← Hacker can read this!
| john@gmail.com  | mypass456   |  ← Stolen!

BCRYPT HASHED (GOOD):
| email           | password                                                     |
|-----------------|--------------------------------------------------------------|
| admin@mc.com    | $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy |
| john@gmail.com  | $2a$10$Xg2qTKhr9M7fHH3lGXqYB.VcPqXr6qdEQF8MN5PBOW3kOz3aHFJNy |
```
- Hacker sees `$2a$10$N9qo8u...` — cannot reverse it back to `admin123`
- Each hash is unique even for same password (because of random "salt")

### How BCrypt Works in Our Code

**Encoding (Registration):**
```java
// AuthService.java — When saving a new user
user.setPassword(passwordEncoder.encode(request.getPassword()));
// "admin123" → "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
```

**Matching (Login):**
```java
// AuthService.java — When checking password
passwordEncoder.matches(request.getPassword(), user.getPassword());
// matches("admin123", "$2a$10$N9qo8uLOickgx2ZMRZoMye...") → true
// matches("wrongpass", "$2a$10$N9qo8uLOickgx2ZMRZoMye...") → false
```

---

## 13. Complete File Map

```
📁 Security-Related Files
│
├── 🔵 AUTH SERVICE (Port 8081) — "The Identity Provider"
│   ├── entity/
│   │   ├── User.java              → Database table for users
│   │   └── Role.java              → Database table for roles
│   ├── config/
│   │   ├── SecurityConfig.java    → Which endpoints are public/protected
│   │   ├── PasswordConfig.java    → BCrypt password encoder bean
│   │   ├── DataInitializer.java   → Creates default roles + admin user on startup
│   │   └── JwtConfigProperties.java → Reads jwt.secret and jwt.expiration from properties
│   ├── security/
│   │   └── JwtAuthenticationFilter.java → Validates JWT on every request to auth-service
│   ├── service/
│   │   ├── JwtService.java        → Generates and validates JWT tokens
│   │   ├── AuthService.java       → Login, register, password reset logic
│   │   └── OtpService.java        → OTP generation and verification
│   ├── controller/
│   │   └── AuthController.java    → REST endpoints (/auth/login, /auth/register, etc.)
│   └── application.properties     → jwt.secret, jwt.expiration, database config
│
├── 🟢 API GATEWAY (Port 8080) — "The Front Door"
│   ├── config/
│   │   └── SecurityConfig.java    → CORS config + permitAll (JWT handled by custom filter)
│   ├── filter/
│   │   └── JwtAuthenticationFilter.java → Gateway JWT validation + header forwarding
│   └── application.properties     → jwt.secret (MUST match auth-service!), routes, CORS
│
├── 🟡 ADMIN CATALOGUE SERVICE (Port 8082)
│   └── config/
│       ├── WebSecurityConfig.java → permitAll (trusts gateway)
│       └── JwtAuthenticationFilter.java → Backup JWT validation
│
└── 🔴 FRONTEND (Port 5173)
    ├── api/
    │   ├── client.js              → Axios client with JWT interceptors
    │   └── authService.js         → Auth API functions (login, register, etc.)
    ├── features/auth/
    │   └── authSlice.js           → Redux state for authentication
    └── store/
        └── store.js               → Redux store (includes auth reducer)
```

---

## 14. Security Flow Diagram

### Login Flow
```
User                  Frontend              Gateway                Auth Service           Database
  │                      │                     │                       │                      │
  │  Enter email/pass    │                     │                       │                      │
  │─────────────────────>│                     │                       │                      │
  │                      │  POST /auth/login   │                       │                      │
  │                      │────────────────────>│                       │                      │
  │                      │                     │  Public path → skip   │                      │
  │                      │                     │  JWT check            │                      │
  │                      │                     │──────────────────────>│                      │
  │                      │                     │                       │  Find user by email  │
  │                      │                     │                       │─────────────────────>│
  │                      │                     │                       │  User found          │
  │                      │                     │                       │<─────────────────────│
  │                      │                     │                       │                      │
  │                      │                     │                       │  BCrypt.matches()    │
  │                      │                     │                       │  password correct!   │
  │                      │                     │                       │                      │
  │                      │                     │                       │  Generate JWT token  │
  │                      │                     │                       │  {email, role, userId}│
  │                      │                     │                       │                      │
  │                      │                     │  {token, userId, ...}  │                      │
  │                      │                     │<──────────────────────│                      │
  │                      │  {token, userId}    │                       │                      │
  │                      │<────────────────────│                       │                      │
  │                      │                     │                       │                      │
  │                      │  Save token in      │                       │                      │
  │                      │  localStorage       │                       │                      │
  │  Login successful!   │                     │                       │                      │
  │<─────────────────────│                     │                       │                      │
```

### Authenticated Request Flow
```
User                  Frontend              Gateway                  Service              Database
  │                      │                     │                       │                      │
  │  Click "My Orders"   │                     │                       │                      │
  │─────────────────────>│                     │                       │                      │
  │                      │  GET /api/orders    │                       │                      │
  │                      │  + Authorization:   │                       │                      │
  │                      │    Bearer <token>   │                       │                      │
  │                      │  + X-User-Id: 1     │                       │                      │
  │                      │────────────────────>│                       │                      │
  │                      │                     │                       │                      │
  │                      │                     │  1. Not public path   │                      │
  │                      │                     │  2. Extract token     │                      │
  │                      │                     │  3. Verify signature  │                      │
  │                      │                     │  4. Check not expired │                      │
  │                      │                     │  5. Extract: email,   │                      │
  │                      │                     │     role, userId      │                      │
  │                      │                     │  6. Not admin-only    │                      │
  │                      │                     │     → ALLOW           │                      │
  │                      │                     │                       │                      │
  │                      │                     │  Forward with headers:│                      │
  │                      │                     │  X-User-Id: 1         │                      │
  │                      │                     │  X-User-Email: john@  │                      │
  │                      │                     │  X-User-Role: ROLE_USER                      │
  │                      │                     │──────────────────────>│                      │
  │                      │                     │                       │  Get orders for      │
  │                      │                     │                       │  userId = 1          │
  │                      │                     │                       │─────────────────────>│
  │                      │                     │                       │  [order1, order2]    │
  │                      │                     │                       │<─────────────────────│
  │                      │                     │  [order1, order2]     │                      │
  │                      │                     │<──────────────────────│                      │
  │                      │  [order1, order2]   │                       │                      │
  │                      │<────────────────────│                       │                      │
  │  Show orders list    │                     │                       │                      │
  │<─────────────────────│                     │                       │                      │
```

---

## 15. Common Questions

### Q: Why do both Gateway and Auth Service have JWT filters?
**A:** Defense in depth! The Gateway is the main checkpoint (checks token, extracts user info, blocks unauthorized). The Auth Service filter is a backup — if someone bypasses the gateway and calls auth-service directly on port 8081, the filter still protects it.

### Q: Why is the same `jwt.secret` in both auth-service and api-gateway?
**A:** Because the auth-service SIGNS the token with this secret, and the gateway needs the SAME secret to VERIFY it. If they were different, the gateway couldn't read tokens created by the auth-service.

```
Auth Service: sign("user data", "secret123") → token
Gateway:      verify(token, "secret123")     → ✅ valid
Gateway:      verify(token, "wrongsecret")   → ❌ invalid
```

### Q: Why use `localStorage` for tokens? Is it safe?
**A:** For a demo/college project, `localStorage` is fine. In production, you'd use:
- `httpOnly` cookies (more secure, can't be accessed by JavaScript)
- Token refresh mechanism (short-lived access tokens + refresh tokens)

### Q: What happens when the token expires?
**A:** After 1 hour (3600000 ms), the token becomes invalid. The gateway will reject it with 401 Unauthorized. The user must log in again to get a new token.

### Q: What is `SessionCreationPolicy.STATELESS`?
**A:** It tells Spring Security: "Don't create HTTP sessions. We're using JWT tokens instead."
- **Stateful** (session): Server remembers who you are (uses cookies + server memory)
- **Stateless** (JWT): Server doesn't remember — token carries all the info

### Q: Why `csrf.disable()`?
**A:** CSRF (Cross-Site Request Forgery) protection is for cookie-based authentication. Since we use JWT tokens in headers (not cookies), CSRF attacks don't work, so we disable it.

### Q: What does `@Order(Ordered.HIGHEST_PRECEDENCE)` do?
**A:** It makes the CORS filter run FIRST, before any other filter. This is important because:
1. Browser sends OPTIONS preflight request
2. If CORS filter doesn't run first, other filters might block the OPTIONS request
3. Browser would think CORS is not allowed and block all subsequent requests

### Q: What is Eureka and why does auth-service register there?
**A:** Eureka is a service registry. When the gateway needs to call auth-service, it asks Eureka: "Where is auth-service running?" Eureka replies: "It's at localhost:8081". This is called **service discovery** — services find each other automatically.

---

## 🎯 Summary

| Concept | Where It Happens | What It Does |
|---|---|---|
| **User Registration** | Auth Service | Hash password, save to DB, generate JWT |
| **User Login** | Auth Service | Verify password, generate JWT |
| **Token Storage** | Frontend (localStorage) | Browser saves JWT for future requests |
| **Token Attachment** | Frontend (Axios interceptor) | Automatically adds JWT to every request |
| **Token Validation** | API Gateway (JWT Filter) | Checks if token is valid, not expired |
| **User Identification** | API Gateway → Headers | Extracts userId, email, role from token |
| **Role Checking** | Gateway + Auth Service | Blocks non-admins from admin endpoints |
| **CORS** | API Gateway (SecurityConfig) | Allows frontend to call backend |
| **Password Safety** | Auth Service (BCrypt) | Hashes passwords before storing |
| **Default Admin** | Auth Service (DataInitializer) | Creates admin@medicart.com on startup |
| **OTP** | Auth Service (OtpService) | For forgot password flow |

---

> **Created for MediCart Full-Stack Microservices Project**
> Branch: `Done` | Author: MediCart Team
