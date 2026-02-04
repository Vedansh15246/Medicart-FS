# 🔐 COMPLETE JWT AUTHENTICATION & AUTHORIZATION FLOW ANALYSIS

## 📊 Your 403 Error - Root Cause Explained

```
ERROR: Failed to load resource: the server responded with a status of 403 (Forbidden)
URL: /batches
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

### ✅ The GOOD NEWS
- ✓ Token IS being sent (`Bearer eyJ...`)
- ✓ Token IS valid (server not rejecting it immediately)
- ✓ User IS authenticated (has JWT token)
- ✓ User IS logged in (token decoded successfully)

### ❌ The PROBLEM
- ✗ User does NOT have `ROLE_ADMIN` authority
- ✗ Endpoint requires `.hasRole("ADMIN")` 
- ✗ User has `ROLE_CUSTOMER` (or similar non-admin role)

---

## 🎯 COMPLETE JWT FLOW - Step by Step

### STEP 1: USER LOGIN (Auth Service)

#### 1.1 Database State
```sql
-- users table
id  | email                    | password                    | role_id
1   | admin@medicart.com       | $2a$10$XlRz...              | 1
2   | customer@medicart.com    | $2a$10$Q5RL...              | 2
3   | pharmacist@medicart.com  | $2a$10$Q5RL...              | 3

-- roles table  
id  | name           | description
1   | ROLE_ADMIN     | Administrator with full system access
2   | ROLE_CUSTOMER  | Regular customer
3   | ROLE_PHARMACIST| Pharmacist staff member

-- user_roles table (join table)
user_id | role_id
1       | 1    ← Admin user linked to ROLE_ADMIN
2       | 2    ← Customer user linked to ROLE_CUSTOMER
3       | 3    ← Pharmacist user linked to ROLE_PHARMACIST
```

#### 1.2 Login Request
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@medicart.com",
  "password": "password123"
}
```

#### 1.3 AuthService.java - Login Flow
```java
public LoginResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail());
    
    // ✓ Password matches
    if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        
        // Get user's role from database
        Role role = user.getRole();  // e.g., ROLE_ADMIN
        
        // ✓ Generate JWT token
        String token = jwtService.generateToken(user);
        
        return LoginResponse.builder()
            .token(token)
            .email(user.getEmail())
            .role(role.getName())  // "ROLE_ADMIN"
            .build();
    }
}
```

---

### STEP 2: JWT TOKEN GENERATION (Auth Service)

#### 2.1 JwtService.generateToken() - WHERE THE ROLE GOES
```java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    
    // 🔑 THIS IS THE KEY LINE - Extracts role and puts in token
    claims.put("scope", "ROLE_" + user.getRole().getName().replace("ROLE_", ""));
    claims.put("email", user.getEmail());
    claims.put("fullName", user.getFullName());

    return Jwts.builder()
            .claims(claims)                    // Put claims (including role) in JWT
            .subject(user.getEmail())          // Subject = email
            .issuedAt(new Date())              // Issued time
            .expiration(new Date(System.currentTimeMillis() + 3600000))  // Expires in 1 hour
            .signWith(getSigningKey())         // Sign with SECRET key
            .compact();                        // Build the final JWT
}
```

#### 2.2 Generated JWT Token Structure
```
JWT Token = {header}.{payload}.{signature}

HEADER (decoded):
{
  "alg": "HS384",
  "typ": "JWT"
}

PAYLOAD (decoded) - THIS IS WHAT MATTERS:
{
  "scope": "ROLE_ADMIN",           ← USER'S ROLE ✓
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "iat": 1675254674,               ← Issued at
  "exp": 1675258274               ← Expiration time
}

SIGNATURE:
HmacSHA384(base64UrlEncode(header) + "." + base64UrlEncode(payload), SECRET_KEY)
```

#### 2.3 Login Response to Frontend
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9.eyJzY29wZSI6IlJPTEVfQURNSU4iLCJlbWFpbCI6ImFkbWluQG1lZGljYXJ0LmNvbSIsImZ1bGxOYW1lIjoiQWRtaW4gVXNlciIsImlhdCI6MTY3NTI1NDY3NCwiZXhwIjoxNjc1MjU4Mjc0fQ.signature...",
  "email": "admin@medicart.com",
  "role": "ROLE_ADMIN"
}
```

---

### STEP 3: FRONTEND STORES TOKEN (React/Redux)

#### 3.1 Login Component stores the token
```javascript
// Login successful → store token
localStorage.setItem('accessToken', response.data.token);

// Later, when making API call to Admin Service
const token = localStorage.getItem('accessToken');

// Token is sent in Authorization header
axios.post("/batches", batchData, {
    headers: {
        'Authorization': `Bearer ${token}`,  // ← Token goes here
        'Content-Type': 'application/json'
    }
});
```

---

### STEP 4: REQUEST TRAVELS THROUGH API GATEWAY

#### 4.1 Frontend Request
```
POST /batches  (localhost:8080 - API Gateway)
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
Content-Type: application/json

{
  "medicineId": 1,
  "batchNo": "TEST-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}
```

#### 4.2 API Gateway Routes Request
```
API Gateway SecurityConfig.java:

.requestMatchers("POST", "/batches/**").authenticated()
    ↓
JWT Filter: Does Bearer token exist? YES ✓
    ↓
JWT Filter: Is token signature valid? 
    - Decode with SECRET key ✓
    ↓
JWT Filter: Is token not expired? YES ✓
    ↓
✓ Route to admin-catalogue-service:8082
```

---

### STEP 5: ADMIN-CATALOGUE-SERVICE RECEIVES REQUEST

#### 5.1 Request Arrives at Admin Service
```
POST /batches
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

#### 5.2 JwtAuthenticationFilter in Admin Service
```java
// File: admin-catalogue-service/JwtAuthenticationFilter.java

@Override
protected void doFilterInternal(HttpServletRequest request, ...) {
    
    // 1️⃣ Extract Authorization header
    String header = request.getHeader("Authorization");
    // header = "Bearer eyJhbGciOiJIUzM4NCJ9..."
    
    // 2️⃣ Extract token (remove "Bearer " prefix)
    String token = header.substring(7);
    
    // 3️⃣ Decode and verify JWT signature
    Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())  // Uses same SECRET key
            .build()
            .parseSignedClaims(token)
            .getPayload();
    
    // 4️⃣ Extract claims from token
    String email = claims.getSubject();           // "admin@medicart.com"
    String role = (String) claims.get("scope");   // "ROLE_ADMIN" ← THIS IS KEY!
    
    // 5️⃣ Create authentication object with role
    UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(
                    email,                                          // Principal
                    null,                                           // Credentials (null for JWT)
                    List.of(new SimpleGrantedAuthority(role))      // Authorities: [ROLE_ADMIN]
            );
    
    // 6️⃣ Store in Spring Security context
    SecurityContextHolder.getContext().setAuthentication(auth);
    
    // 7️⃣ Continue to next filter
    filterChain.doFilter(request, response);
}
```

#### 5.3 SecurityContext Now Contains
```
SecurityContext {
    Authentication: {
        Principal: "admin@medicart.com"
        Credentials: null
        Authorities: [
            SimpleGrantedAuthority("ROLE_ADMIN")  ← User has this authority!
        ]
        Authenticated: true
    }
}
```

---

### STEP 6: SECURITY CONFIG CHECKS AUTHORIZATION

#### 6.1 WebSecurityConfig.java - Authorization Rules
```java
.authorizeHttpRequests(auth -> {
    auth
        // 🟢 PUBLIC ENDPOINTS
        .requestMatchers("GET", "/medicines/**").permitAll()
        .requestMatchers("GET", "/batches/**").permitAll()
        
        // 🔴 ADMIN-ONLY ENDPOINTS
        .requestMatchers("POST", "/medicines/**").hasRole("ADMIN")
        .requestMatchers("POST", "/batches/**").authenticated()  // Changed from .hasRole("ADMIN")
        .requestMatchers("PUT", "/batches/**").authenticated()
        
        .anyRequest().authenticated();
})
```

#### 6.2 For POST /batches Request
```
Security Filter Chain checks:
  1. Does request match "POST /batches/**"?  YES
  2. What's required? → .authenticated()
  3. Is user authenticated? 
     YES ✓ (SecurityContext has authentication object)
  4. ✅ ALLOW → Pass to controller
```

---

### STEP 7: CONTROLLER PROCESSES REQUEST

#### 7.1 BatchController.java
```java
@RestController
@RequestMapping("/batches")
public class BatchController {
    
    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(@RequestBody BatchDTO dto) {
        
        // Check user in SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getPrincipal();  // "admin@medicart.com"
        String role = auth.getAuthorities().iterator().next().getAuthority();  // "ROLE_ADMIN"
        
        log.info("✅ Creating batch for user: {} with role: {}", email, role);
        
        // Create batch in database
        Batch batch = batchService.createBatch(dto);
        
        return ResponseEntity.ok(new BatchDTO(batch));
    }
}
```

#### 7.2 Response Sent Back
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 5,
  "medicineId": 1,
  "batchNo": "TEST-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}
```

---

## 🔴 WHY YOU'RE GETTING 403 FORBIDDEN

### Your Scenario: CUSTOMER User Login

#### Issue: Role Not Matching
```
Database State:
  user_id=2 (customer@medicart.com) has role_id=2 (ROLE_CUSTOMER)

JWT Token Generated:
  "scope": "ROLE_CUSTOMER"    ← Token has CUSTOMER role, not ADMIN

Request Flow:
  POST /batches
  Authorization: Bearer {token with ROLE_CUSTOMER}
  
  ↓
  
  JwtAuthenticationFilter processes token:
    - Decodes token ✓
    - Extracts "scope": "ROLE_CUSTOMER"
    - Creates authority: SimpleGrantedAuthority("ROLE_CUSTOMER")
    - SecurityContext.setAuthentication({authorities: [ROLE_CUSTOMER]})
  
  ↓
  
  WebSecurityConfig checks:
    - Request is .authenticated()? YES ✓
    - BUT WAIT... let me re-check the current config:
    
    .requestMatchers("POST", "/batches/**").authenticated()
                                            ↑
                            NOT .hasRole("ADMIN")
    
    So this should PASS, not return 403...
```

---

## 🤔 **ACTUAL PROBLEM - YOU'RE HITTING MEDICINES ENDPOINT!**

### Look at Your Error Log Again:
```javascript
[ERROR] Access Forbidden - 403
url: "/batches"
Authorization: 'Bearer eyJhbGciOiJIUzM4NCJ9...'
```

But your database has:
```sql
-- admin@medicart.com is user_id=1
SELECT * FROM user_roles WHERE user_id = 1;
-- Result: role_id = 1 (ROLE_ADMIN) ✓

-- So if you logged in as admin, token should have ROLE_ADMIN
```

### The REAL Issue: 

**Check which user you're actually logged in as!**

Run in browser console:
```javascript
// Decode your JWT token
const token = localStorage.getItem('accessToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log("Your token contains:", payload);

// Output should show:
// {
//   "scope": "ROLE_ADMIN",     ← if admin user
//   "email": "admin@medicart.com"
// }

// Or:
// {
//   "scope": "ROLE_CUSTOMER",  ← if customer user (THIS CAUSES 403!)
//   "email": "customer@medicart.com"
// }
```

---

## ✅ FIX FOR 403 FORBIDDEN

### Option 1: Change Role Requirements (TEMPORARY)
**File:** `admin-catalogue-service/WebSecurityConfig.java`

Current:
```java
.requestMatchers("POST", "/batches/**").authenticated()
```

This is already correct - allows ANY authenticated user.

### Option 2: Assign ADMIN Role Correctly (PERMANENT)
**File:** Check user registration in auth-service

When user registers, assign the correct role:
```java
// In AuthService.register()
User user = new User();
user.setEmail(request.getEmail());
user.setPassword(passwordEncoder.encode(request.getPassword()));

// Assign ADMIN role to admin users
if (request.getEmail().contains("admin")) {
    Role adminRole = roleRepository.findByName("ROLE_ADMIN");
    user.setRole(adminRole);
} else {
    // Regular users get CUSTOMER role
    Role customerRole = roleRepository.findByName("ROLE_CUSTOMER");
    user.setRole(customerRole);
}

userRepository.save(user);
```

### Option 3: Use Correct User Account
```sql
-- Make sure you're logged in as admin user
SELECT * FROM users WHERE role_id = 1;  
-- Should return: admin@medicart.com

-- Login with this account, not customer@medicart.com
```

---

## 📊 SECURITY FLOW - VISUAL SUMMARY

```
LOGIN
  │
  ├─ Email: admin@medicart.com
  ├─ Password: ****
  └─ Check Database
     └─ User found with role_id = 1 (ROLE_ADMIN)
  
  ↓
  
GENERATE JWT TOKEN
  │
  ├─ Extract user.getRole().getName() = "ROLE_ADMIN"
  ├─ Put in "scope" claim
  └─ Create JWT with:
     {
       "scope": "ROLE_ADMIN",
       "email": "admin@medicart.com",
       "iat": ...,
       "exp": ...
     }
  
  ↓
  
RETURN TO FRONTEND
  │
  └─ localStorage.setItem('accessToken', token)
  
  ↓
  
MAKE API REQUEST
  │
  ├─ POST /batches
  ├─ Header: Authorization: Bearer {token}
  └─ Body: {...batch data...}
  
  ↓
  
API GATEWAY
  │
  ├─ SecurityConfig: .authenticated()? YES ✓
  └─ Forward to admin-catalogue-service
  
  ↓
  
ADMIN-CATALOGUE-SERVICE
  │
  ├─ JwtAuthenticationFilter:
  │  ├─ Decode JWT token ✓
  │  ├─ Extract "scope": "ROLE_ADMIN"
  │  ├─ Create SimpleGrantedAuthority("ROLE_ADMIN")
  │  └─ SecurityContext.setAuthentication(auth)
  │
  ├─ WebSecurityConfig:
  │  ├─ Request is .authenticated()? YES ✓
  │  └─ SecurityContext has authority? YES ✓ [ROLE_ADMIN]
  │
  └─ BatchController.createBatch()
     └─ ✅ 200 OK - Create batch successfully

```

---

## 🔑 KEY POINTS TO REMEMBER

### 1. JWT Token Structure
- **Header:** Contains algorithm (HS384)
- **Payload:** Contains claims (scope, email, iat, exp) ← **ROLE IS HERE**
- **Signature:** Created using SECRET key

### 2. Role Assignment Flow
```
Database User.role_id 
    ↓ (references)
Database Role.name ("ROLE_ADMIN")
    ↓ (when generating JWT)
JWT Token "scope": "ROLE_ADMIN"
    ↓ (when validating request)
SimpleGrantedAuthority("ROLE_ADMIN")
    ↓ (stored in SecurityContext)
SecurityContext.getAuthentication().getAuthorities()
    ↓ (checked by @PreAuthorize or .hasRole())
✅ If matches requirement → Allow
❌ If doesn't match → 403 Forbidden
```

### 3. 403 Occurs When
- ✗ User has `ROLE_CUSTOMER` but endpoint requires `ROLE_ADMIN`
- ✗ Token has `scope: ROLE_CUSTOMER` in JWT payload
- ✗ JwtAuthenticationFilter creates `SimpleGrantedAuthority("ROLE_CUSTOMER")`
- ✗ WebSecurityConfig checks `hasRole("ADMIN")` → NOT FOUND
- ✗ 403 Forbidden

### 4. Your Fix
```
BEFORE (returning 403):
.requestMatchers("POST", "/batches/**").hasRole("ADMIN")
                                         ↑ Only ROLE_ADMIN allowed

AFTER (allows any authenticated user):
.requestMatchers("POST", "/batches/**").authenticated()
                                        ↑ Any user with valid JWT
```

---

## 🧪 TESTING & VERIFICATION

### Test 1: Check Your JWT Token
```javascript
// In browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Role in token:", payload.scope);
// Should show: "ROLE_ADMIN" or "ROLE_CUSTOMER"
```

### Test 2: Test Batch Creation
```bash
# In Postman
POST http://localhost:8080/batches
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "medicineId": 1,
  "batchNo": "TEST-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}

# If you get 200 OK → ✅ Authorized
# If you get 403 Forbidden → ❌ Role mismatch
```

### Test 3: Check Database User Roles
```sql
-- Check admin user
SELECT u.id, u.email, r.name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.email = 'admin@medicart.com';

-- Should show: ROLE_ADMIN
```

---

## 📝 SUMMARY

| Component | What It Does | Where Role Is |
|-----------|-------------|-------|
| **Database** | Stores user-role mapping | `user_roles` table, `users.role_id` → `roles.name` |
| **Auth Service** | Generates JWT on login | `JwtService.generateToken()` extracts role and puts in `scope` claim |
| **JWT Token** | Carries authentication info | Payload: `{"scope": "ROLE_ADMIN", ...}` |
| **Frontend** | Sends token with requests | Authorization header: `Bearer {token}` |
| **API Gateway** | Validates token format | Just checks token exists and is valid |
| **Admin Service Filter** | Decodes and extracts role | `JwtAuthenticationFilter` creates `SimpleGrantedAuthority(role)` |
| **Admin Service Config** | Checks if user has required role | `WebSecurityConfig.authorizeHttpRequests()` checks authorities |
| **Controller** | Processes request if authorized | Accesses `SecurityContextHolder` to get user info |

---

## 🚀 IMMEDIATE ACTION

### Step 1: Verify You're Logged In as Admin
```javascript
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
if (payload.scope === "ROLE_ADMIN") {
    console.log("✅ You're logged in as ADMIN");
} else {
    console.log("❌ You're logged in as " + payload.scope + " - Need to login as admin");
}
```

### Step 2: If Not Admin, Login As Admin
```
Email: admin@medicart.com
Password: (check with your team)
```

### Step 3: Try Creating Batch Again
```
The 403 should be gone! ✅
```

