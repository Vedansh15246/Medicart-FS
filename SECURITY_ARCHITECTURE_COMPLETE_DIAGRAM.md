# 🔐 COMPLETE SECURITY ARCHITECTURE DIAGRAM

## High-Level Security Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           YOUR MEDICART SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              🌐 FRONTEND (React)
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            1. User clicks      2. Login page    3. API requests
               "Login"             (form)           (with token)
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                                     ▼
                          📡 API GATEWAY (8080)
                    (routes requests to microservices)
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            /auth/login     /batches, /medicines   /admin endpoints
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────────┐  ┌──────────────────┐
            │ AUTH SERVICE  │  │ ADMIN-CATALOGUE  │
            │   (8080)      │  │   SERVICE (8082) │
            │               │  │                  │
            │ • Login ✓     │  │ • Get batches ✓  │
            │ • Register ✓  │  │ • Create batch ✓ │
            │ • Validate ✓  │  │ • Update batch ✓ │
            └───────────────┘  └──────────────────┘
                    │                │
                    ▼                ▼
            ┌───────────────┐  ┌──────────────────┐
            │ JWT Generated │  │ JWT Validated    │
            │               │  │                  │
            │ ↓ Token with  │  │ ↓ Extract role   │
            │   role claim  │  │   from token     │
            │               │  │ ↓ Check          │
            │ Stored in     │  │   permissions    │
            │ localStorage  │  │ ↓ Proceed or     │
            │               │  │   403 Forbidden  │
            └───────────────┘  └──────────────────┘
```

---

## 🔐 STEP-BY-STEP SECURITY FLOW

### PHASE 1: USER REGISTRATION

```
┌──────────────────────────────────┐
│ 1. User fills registration form  │
│    • Email: admin@medicart.com   │
│    • Password: ****              │
│    • Name: Admin User            │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 2. POST /auth/register           │
│    (No authentication needed)     │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 3. AuthService.register()        │
│    • Hash password with BCrypt   │
│    • Save user to DB             │
│    • Assign default role         │
│    • Return success              │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 4. Database State After           │
│                                  │
│ USERS TABLE:                     │
│ id | email            | password │
│ 1  | admin@...        | $2a$10$X │
│                                  │
│ USER_ROLES TABLE:                │
│ user_id | role_id                │
│ 1       | 1  (← ROLE_ADMIN)      │
│                                  │
│ ROLES TABLE:                     │
│ id | name        | description   │
│ 1  | ROLE_ADMIN  | Full access   │
│ 2  | ROLE_CUSTOMER | Buy items   │
│ 3  | ROLE_PHARMACIST | Stock mgmt│
└──────────────────────────────────┘
```

---

### PHASE 2: USER LOGIN & JWT GENERATION

```
┌──────────────────────────────────┐
│ 1. User Login Request            │
│    POST /auth/login              │
│    {                             │
│      "email": "admin@...",       │
│      "password": "****"          │
│    }                             │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────┐
│ 2. AuthService.login()                          │
│                                                  │
│    a) Find user by email                        │
│       user = userRepository.findByEmail(...)    │
│       → Found: User(id=1, email="admin@...", ✓) │
│                                                  │
│    b) Check password                            │
│       if (bcrypt.matches(pwd, user.pwd)) ✓      │
│                                                  │
│    c) Get user's role from database             │
│       role = user.getRole()                     │
│       → ROLE_ADMIN                              │
│                                                  │
│    d) Generate JWT token                        │
│       token = jwtService.generateToken(user)    │
│                                                  │
│    e) Return token to frontend                  │
└──────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────┐
│ 3. JwtService.generateToken(user)               │
│                                                  │
│    a) Create claims map                         │
│       claims.put("scope", "ROLE_ADMIN")         │
│                           ↑                     │
│                   THIS IS WHERE ROLE GOES!      │
│       claims.put("email", "admin@...")          │
│       claims.put("fullName", "Admin User")      │
│                                                  │
│    b) Build JWT                                 │
│       Jwts.builder()                            │
│         .claims(claims)                         │
│         .subject(user.getEmail())               │
│         .issuedAt(now)                          │
│         .expiration(now + 1hr)                  │
│         .signWith(SECRET_KEY)                   │
│         .compact()                              │
│                                                  │
│    c) Return encoded token                      │
│       token = "eyJhbGciOiJIUzM4NCJ9.payload..."  │
└──────────────────────────────────────────────────┘
          ▼
┌────────────────────────────────────────────────┐
│ 4. JWT Token Structure (Decoded)               │
│                                                │
│    HEADER:                                     │
│    {                                           │
│      "alg": "HS384",                           │
│      "typ": "JWT"                              │
│    }                                           │
│                                                │
│    PAYLOAD: ← THIS IS THE IMPORTANT PART       │
│    {                                           │
│      "scope": "ROLE_ADMIN",  ← ROLE!           │
│      "email": "admin@medicart.com",            │
│      "fullName": "Admin User",                 │
│      "iat": 1675254674,  ← Issued at          │
│      "exp": 1675258274   ← Expires in 1 hour  │
│    }                                           │
│                                                │
│    SIGNATURE:                                  │
│    hmacSHA384(header.payload, SECRET_KEY)      │
│                                                │
│    Final Token:                                │
│    eyJhbGciOiJIUzM4NCJ9.eyJzY29wZSI6IlJPTEVfQURNSU4iLCJlbWFpbCI6ImFkbWluQG1lZGljYXJ0LmNvbSIsInNjb3BlIjoiUk9MRV9BRE1JTiJ9.signature...
│                                                │
└────────────────────────────────────────────────┘
          ▼
┌────────────────────────────────────────────────┐
│ 5. Return to Frontend                          │
│                                                │
│    {                                           │
│      "token": "eyJhbGc...",                    │
│      "email": "admin@medicart.com",            │
│      "role": "ROLE_ADMIN"                      │
│    }                                           │
│                                                │
│    localStorage.setItem('accessToken', token)  │
│                                                │
└────────────────────────────────────────────────┘
```

---

### PHASE 3: API REQUEST WITH JWT

```
┌──────────────────────────────────────────────────┐
│ 1. Frontend Makes API Call                      │
│                                                 │
│    axios.post(                                  │
│      "/batches",                                │
│      {                                          │
│        "medicineId": 1,                         │
│        "batchNo": "TEST-001",                   │
│        "expiryDate": "2025-12-31",              │
│        "qtyAvailable": 100                      │
│      },                                         │
│      {                                          │
│        headers: {                               │
│          'Authorization': 'Bearer ' + token,    │
│          'Content-Type': 'application/json'     │
│        }                                        │
│      }                                          │
│    )                                            │
│                                                 │
│    Request Headers:                            │
│    Authorization: Bearer eyJhbGciOiJIUzM4NCJ9... │
│    Content-Type: application/json               │
│                                                 │
│    Request Body:                               │
│    {                                           │
│      "medicineId": 1,                          │
│      "batchNo": "TEST-001",                    │
│      ...                                       │
│    }                                           │
└──────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────┐
│ 2. API Gateway Receives Request                 │
│    (Port 8080)                                  │
│                                                 │
│    POST /batches                                │
│    Authorization: Bearer eyJhbGc...             │
│                                                 │
│    ✓ Route matches: /batches/** → Yes           │
│    ✓ Forward to: http://localhost:8082          │
│    ✓ Copy headers: Yes (including token)        │
│                                                 │
└──────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────┐
│ 3. Admin-Catalogue-Service Receives Request     │
│    (Port 8082)                                  │
│                                                 │
│    POST /batches                                │
│    Authorization: Bearer eyJhbGc...             │
│                                                 │
│    🔥 Filter Chain Starts:                      │
│    1. Request intercepted by filters            │
│    2. Next filter: JwtAuthenticationFilter      │
│                                                 │
└──────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. JwtAuthenticationFilter.doFilterInternal()               │
│                                                             │
│    Step 1: Extract Authorization Header                     │
│    ─────────────────────────────────────────────            │
│    header = request.getHeader("Authorization")              │
│    → "Bearer eyJhbGciOiJIUzM4NCJ9..."                       │
│    ✓ Header found                                           │
│                                                             │
│    Step 2: Validate Bearer Format                           │
│    ──────────────────────────────────                       │
│    if (header.startsWith("Bearer "))                        │
│    → YES ✓                                                  │
│                                                             │
│    Step 3: Extract Token                                    │
│    ─────────────────────────                                │
│    token = header.substring(7)                              │
│    → "eyJhbGciOiJIUzM4NCJ9..."                              │
│                                                             │
│    Step 4: Decode and Verify Signature                      │
│    ────────────────────────────────────                     │
│    Claims claims = Jwts.parser()                            │
│        .verifyWith(getSigningKey())  ← Uses SECRET_KEY      │
│        .build()                                             │
│        .parseSignedClaims(token)                            │
│        .getPayload()                                        │
│                                                             │
│    ✓ Signature verified (matches SECRET_KEY)                │
│                                                             │
│    Step 5: Extract Claims from Token                        │
│    ──────────────────────────────────                       │
│    String email = claims.getSubject()                       │
│    → "admin@medicart.com"                                   │
│                                                             │
│    String role = claims.get("scope")                        │
│    → "ROLE_ADMIN"  ← ROLE FROM TOKEN PAYLOAD                │
│                                                             │
│    Step 6: Create Authentication Object                     │
│    ─────────────────────────────────────                    │
│    UsernamePasswordAuthenticationToken auth =               │
│        new UsernamePasswordAuthenticationToken(             │
│            "admin@medicart.com",                            │
│            null,                                            │
│            List.of(                                         │
│                new SimpleGrantedAuthority("ROLE_ADMIN")     │
│                                           ↑                 │
│                                 AUTHORITY FROM TOKEN        │
│            )                                                │
│        )                                                    │
│                                                             │
│    Step 7: Store in SecurityContext                         │
│    ──────────────────────────────────                       │
│    SecurityContextHolder.getContext()                       │
│        .setAuthentication(auth)                             │
│                                                             │
│    SecurityContext now contains:                            │
│    {                                                        │
│      authentication: {                                      │
│        principal: "admin@medicart.com",                     │
│        authorities: ["ROLE_ADMIN"],  ← STORED HERE!         │
│        authenticated: true                                  │
│      }                                                      │
│    }                                                        │
│                                                             │
│    Step 8: Continue Filter Chain                            │
│    ──────────────────────────────                           │
│    filterChain.doFilter(request, response)                  │
│                                                             │
└──────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. WebSecurityConfig Authorization Checker                  │
│                                                             │
│    .authorizeHttpRequests(auth -> {                         │
│        auth                                                 │
│            .requestMatchers("POST", "/batches/**")          │
│                .authenticated()                             │
│                      ↑                                      │
│               WHAT DOES THIS CHECK?                         │
│                      ↓                                      │
│        1. Is user authenticated?                            │
│           SecurityContext has auth? YES ✓                   │
│        2. Is auth.isAuthenticated() true?                   │
│           YES ✓                                             │
│        3. Grant access                                      │
│           → Continue to controller                          │
│    })                                                       │
│                                                             │
│    ✅ AUTHORIZATION PASSED                                  │
│                                                             │
└──────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. BatchController.createBatch()                            │
│                                                             │
│    @PostMapping                                             │
│    public ResponseEntity<BatchDTO> createBatch(             │
│        @RequestBody BatchDTO dto                            │
│    ) {                                                      │
│        // Access security context                          │
│        Authentication auth = SecurityContextHolder         │
│            .getContext()                                    │
│            .getAuthentication();                            │
│                                                             │
│        String email = auth.getPrincipal();                  │
│        → "admin@medicart.com"                               │
│                                                             │
│        String role = auth.getAuthorities()                  │
│            .iterator().next().getAuthority();               │
│        → "ROLE_ADMIN"                                       │
│                                                             │
│        log.info("Creating batch for: {} with role: {}",     │
│                 email, role);                               │
│        // → "Creating batch for: admin@medicart.com         │
│        //    with role: ROLE_ADMIN"                         │
│                                                             │
│        // Process batch creation                           │
│        Batch batch = batchService.createBatch(dto);        │
│                                                             │
│        // Return success                                    │
│        return ResponseEntity.ok(                            │
│            new BatchDTO(batch)                              │
│        );                                                   │
│    }                                                        │
│                                                             │
└──────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Response Sent Back                                       │
│                                                             │
│    HTTP/1.1 200 OK                                          │
│    Content-Type: application/json                           │
│                                                             │
│    {                                                        │
│      "id": 5,                                               │
│      "medicineId": 1,                                       │
│      "batchNo": "TEST-001",                                 │
│      "expiryDate": "2025-12-31",                            │
│      "qtyAvailable": 100                                    │
│    }                                                        │
│                                                             │
│    ✅ SUCCESS - Batch created!                             │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔴 WHERE 403 FORBIDDEN HAPPENS

```
Scenario: User with ROLE_CUSTOMER tries to create batch

┌──────────────────────────────────┐
│ 1. User Login                    │
│    Email: customer@medicart.com  │
│    Role in DB: ROLE_CUSTOMER     │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 2. JWT Generated                 │
│    {                             │
│      "scope": "ROLE_CUSTOMER",   │
│      "email": "customer@..."     │
│    }                             │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 3. API Request                   │
│    POST /batches                 │
│    Authorization: Bearer {...}   │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ 4. JwtAuthenticationFilter       │
│                                  │
│    Extract claims:               │
│    scope: "ROLE_CUSTOMER"        │
│                                  │
│    Create authority:             │
│    SimpleGrantedAuthority(       │
│        "ROLE_CUSTOMER"           │
│    )                             │
│                                  │
│    Set in SecurityContext:       │
│    {                             │
│      authorities: ["ROLE_CUSTOMER"]
│    }                             │
└──────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────┐
│ 5. WebSecurityConfig Checks Permission       │
│                                              │
│    .requestMatchers("POST", "/batches/**")   │
│        .authenticated()                      │
│                                              │
│    Is user authenticated?                    │
│    → YES ✓ (has JWT token)                   │
│                                              │
│    Is auth.isAuthenticated() true?           │
│    → YES ✓                                   │
│                                              │
│    ✅ PASS - Continue to controller          │
│                                              │
│    Note: With .authenticated(),              │
│    role doesn't matter!                      │
│    Both ADMIN and CUSTOMER users             │
│    can create batches.                       │
│                                              │
│    (If config was .hasRole("ADMIN"),         │
│    this would FAIL here with 403)            │
└──────────────────────────────────────────────┘
```

---

## 🎯 SUMMARY TABLE

| Component | Job | What It Checks | Decision |
|-----------|-----|---|---|
| **Frontend** | Send request with JWT | Has token in localStorage? | ✓ Send |
| **API Gateway** | Route request | Request path matches route? | Forward to admin-service |
| **JwtAuthenticationFilter** | Validate JWT | Is signature valid? Token not expired? | ✓ Extract role & store in SecurityContext |
| **WebSecurityConfig** | Check authorization | Is user authenticated()? | ✓ Allow / ❌ 403 |
| **Controller** | Process request | Access SecurityContext | ✓ Create batch |

---

## 🔑 THE KEY INSIGHT

```
                            3 PLACES WHERE ROLE LIVES

1. Database                          2. JWT Token                     3. SecurityContext
┌─────────────────┐               ┌──────────────────┐             ┌───────────────┐
│ users table     │               │ JWT Payload      │             │ Spring        │
│                 │               │                  │             │ Security      │
│ user_id=1       │ ─ link ─>     │ "scope":         │ ─ copy ─>  │ authorities:  │
│ role_id=1   ────┼────┐          │ "ROLE_ADMIN"     │            │ [ROLE_ADMIN]  │
│                 │    │          │                  │            │               │
│ roles table     │    └─>         │ (signed with     │            │ (used by      │
│ id=1            │               │  SECRET key)     │            │  permission   │
│ name: ROLE_ADMIN│               │                  │            │  checker)     │
│                 │               └──────────────────┘            └───────────────┘
└─────────────────┘
        │                                  │                               │
        └──────────────────────────────────┼───────────────────────────────┘
                                           │
                     JWT Generation      Authentication         Authorization
                     (at login)           (in request)          (in filter)
```

---

## 🚨 COMMON 403 CAUSES

| Cause | Error | Fix |
|-------|-------|-----|
| User has ROLE_CUSTOMER, config says .hasRole("ADMIN") | 403 Forbidden | Use .authenticated() or assign ADMIN role |
| JWT Secret key mismatch | 403 (signature invalid) | Use same SECRET in all services |
| Token expired | 403 (parsing fails) | Login again |
| Authorization header not forwarded by API Gateway | 403 (no token) | Configure API Gateway to preserve headers |
| CORS headers block Authorization header | 403 (client-side) | Configure CORS to allow Authorization header |
| Token tampered/modified | 403 (signature invalid) | Generate new token from login |

---

## ✅ YOUR FIX

Your WebSecurityConfig is already correct:

```java
.requestMatchers("POST", "/batches/**").authenticated()
                                        ↑
                        Allows ANY authenticated user
                        (admin, customer, pharmacist)
```

So if you're still getting 403:

1. **Check if token is being sent** (Authorization header in request)
2. **Check if token is valid** (correct SECRET key used to validate)
3. **Check if token has correct role** (JWT payload has your role)
4. **Check if user is logged in** (token exists in localStorage)

---

## 📝 QUICK REFERENCE

**File: `application.properties` (ALL SERVICES)**
```
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
jwt.expiration=3600000
```

**File: `JwtService.java` (Auth Service - Generates token)**
```java
claims.put("scope", "ROLE_" + user.getRole().getName());
```

**File: `JwtAuthenticationFilter.java` (Admin Service - Validates token)**
```java
String role = (String) claims.get("scope");
List.of(new SimpleGrantedAuthority(role))
```

**File: `WebSecurityConfig.java` (Admin Service - Checks permission)**
```java
.requestMatchers("POST", "/batches/**").authenticated()
```

All pieces work together! 🎯

