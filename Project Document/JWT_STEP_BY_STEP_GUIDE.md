# 🔐 JWT Implementation - Complete Step-by-Step Guide for Beginners

## 📚 Table of Contents
1. What is JWT?
2. Why Use JWT?
3. Step-by-Step Implementation
4. Testing Your Implementation
5. Common Issues & Solutions

---

## 🎯 What is JWT?

**JWT = JSON Web Token**

Think of JWT like a **digital passport**:
- When you login, you get a passport (JWT token)
- You show this passport for every request
- The server checks your passport and lets you in
- No need to login again until passport expires

### JWT Structure

A JWT token looks like this:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

It has 3 parts separated by dots (`.`):

```
HEADER.PAYLOAD.SIGNATURE
```

#### Part 1: Header (Red)
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: Algorithm used to sign (HS256 = HMAC SHA-256)
- `typ`: Type of token (JWT)

#### Part 2: Payload (Purple)
```json
{
  "sub": "user@example.com",
  "userId": 1,
  "role": "ROLE_USER",
  "iat": 1234567890,
  "exp": 1234571490
}
```
- `sub`: Subject (user's email)
- `userId`: User's ID
- `role`: User's role
- `iat`: Issued at (when token was created)
- `exp`: Expiration time

#### Part 3: Signature (Blue)
```
HMACSHA256(
  base64(header) + "." + base64(payload),
  secret_key
)
```
- Ensures token hasn't been tampered with
- Created using secret key (only server knows)

---

## 🤔 Why Use JWT?

### Traditional Sessions vs JWT

**Traditional Sessions:**
```
User logs in → Server creates session → Stores in database/memory
User makes request → Server checks database for session
Problem: Server must store sessions (memory/database)
```

**JWT Approach:**
```
User logs in → Server creates JWT token → Sends to user
User makes request → Server verifies token signature
Benefit: No server-side storage needed!
```

### Advantages of JWT:
1. **Stateless**: No session storage needed
2. **Scalable**: Works across multiple servers
3. **Mobile-friendly**: Easy to use in mobile apps
4. **Microservices**: Perfect for distributed systems
5. **Self-contained**: All info in the token

---

## 🛠️ Step-by-Step Implementation

### STEP 1: Add JWT Dependencies to pom.xml

Open `auth-service/pom.xml` and add these dependencies:

```xml
<!-- JWT API - Interface/Contract -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>

<!-- JWT Implementation - Actual code -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- JWT Jackson - JSON processing -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

**What each dependency does:**

1. **jjwt-api**: 
   - Contains interfaces and classes you'll use in your code
   - Like a contract that defines what JWT operations are available
   - Example: `Jwts.builder()`, `Jwts.parser()`

2. **jjwt-impl**:
   - The actual implementation of JWT operations
   - Does the heavy lifting (creating, signing, parsing tokens)
   - `scope=runtime`: Only needed when running, not when compiling

3. **jjwt-jackson**:
   - Converts Java objects to JSON and vice versa
   - JWT payload is JSON, so we need JSON processing
   - Jackson is the JSON library used

**Why 3 separate dependencies?**
- Separation of concerns
- You can swap implementations without changing code
- Smaller compile-time dependencies

---

### STEP 2: Configure Secret Key in application.properties

Open `auth-service/src/main/resources/application.properties`:

```properties
# JWT Secret Key - MUST be at least 256 bits (32 characters)
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart

# JWT Expiration Time in milliseconds (1 hour = 3600000 ms)
jwt.expiration=3600000
```

**Explanation:**

1. **jwt.secret**:
   - Secret key used to sign tokens
   - MUST be at least 256 bits (32 characters) for HS256 algorithm
   - Keep this SECRET! Anyone with this key can create fake tokens
   - In production, use environment variables, not hardcoded

2. **jwt.expiration**:
   - How long token is valid (in milliseconds)
   - 3600000 ms = 1 hour
   - After expiration, user must login again
   - Shorter = more secure, Longer = better UX

**Time Conversions:**
```
1 second  = 1000 milliseconds
1 minute  = 60000 milliseconds
1 hour    = 3600000 milliseconds
1 day     = 86400000 milliseconds
```

---

### STEP 3: Create JwtService Class

Create file: `auth-service/src/main/java/com/medicart/auth/service/JwtService.java`

```java
package com.medicart.auth.service;

import com.medicart.auth.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    
    // Inject secret key from application.properties
    @Value("${jwt.secret}")
    private String secretKey;

    // Inject expiration time from application.properties
    @Value("${jwt.expiration}")
    private long expiration;

    // Method 1: Get Signing Key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // Method 2: Generate Token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().getName());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Method 3: Extract Email from Token
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Method 4: Validate Token
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

**Line-by-Line Explanation:**

#### Imports:
```java
import io.jsonwebtoken.Jwts;
```
- Main class for JWT operations (builder, parser)

```java
import io.jsonwebtoken.security.Keys;
```
- Helper class to create cryptographic keys

```java
import javax.crypto.SecretKey;
```
- Interface for secret keys used in encryption

#### Class Annotations:
```java
@Service
```
- Tells Spring this is a service component
- Spring will create and manage this object
- Can be injected into other classes with @Autowired

#### Fields:
```java
@Value("${jwt.secret}")
private String secretKey;
```
- `@Value`: Injects value from application.properties
- `${jwt.secret}`: Reads jwt.secret property
- `secretKey`: Stores the secret key string

```java
@Value("${jwt.expiration}")
private long expiration;
```
- Injects expiration time from properties
- `long`: Number type for milliseconds

#### Method 1: getSigningKey()
```java
private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(secretKey.getBytes());
}
```

**What it does:**
- Converts string secret key to cryptographic key
- `secretKey.getBytes()`: Converts string to byte array
- `Keys.hmacShaKeyFor()`: Creates HMAC key from bytes
- Returns `SecretKey` object used for signing

**Why needed:**
- JWT library needs SecretKey object, not string
- HMAC = Hash-based Message Authentication Code
- Used to sign and verify tokens

#### Method 2: generateToken()
```java
public String generateToken(User user) {
```
- Takes User object as input
- Returns JWT token as String

```java
Map<String, Object> claims = new HashMap<>();
claims.put("userId", user.getId());
claims.put("email", user.getEmail());
claims.put("role", user.getRole().getName());
```
- **Claims**: Data stored in token
- `Map<String, Object>`: Key-value pairs
- We store: userId, email, role
- This data will be in the token payload

```java
return Jwts.builder()
```
- Starts building a JWT token
- Builder pattern: chain methods together

```java
.claims(claims)
```
- Adds our custom claims to token
- These will be in the payload

```java
.subject(user.getEmail())
```
- Sets the "subject" of token
- Usually the user identifier (email)
- Standard JWT claim

```java
.issuedAt(new Date())
```
- When token was created
- `new Date()`: Current date/time
- Standard JWT claim (iat)

```java
.expiration(new Date(System.currentTimeMillis() + expiration))
```
- When token expires
- `System.currentTimeMillis()`: Current time in ms
- `+ expiration`: Add 1 hour (3600000 ms)
- Standard JWT claim (exp)

```java
.signWith(getSigningKey())
```
- Signs token with secret key
- Creates the signature part
- Prevents tampering

```java
.compact();
```
- Converts to string format
- Creates: header.payload.signature
- Returns the final JWT token

#### Method 3: extractEmail()
```java
public String extractEmail(String token) {
```
- Takes JWT token string as input
- Returns user's email

```java
return Jwts.parser()
```
- Creates a parser to read token
- Opposite of builder

```java
.verifyWith(getSigningKey())
```
- Verifies signature with secret key
- Ensures token hasn't been tampered
- Throws exception if invalid

```java
.build()
```
- Builds the parser

```java
.parseSignedClaims(token)
```
- Parses the token string
- Extracts header, payload, signature
- Verifies signature

```java
.getPayload()
```
- Gets the payload (claims)
- Contains user data

```java
.getSubject();
```
- Gets the subject claim
- Returns user's email

#### Method 4: isTokenValid()
```java
public boolean isTokenValid(String token) {
```
- Checks if token is valid
- Returns true/false

```java
try {
    Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token);
    return true;
```
- Try to parse token
- If successful: token is valid
- Return true

```java
} catch (Exception e) {
    return false;
}
```
- If parsing fails: token is invalid
- Could be: expired, wrong signature, malformed
- Return false

---

### STEP 4: Use JwtService in AuthService

Open `auth-service/src/main/java/com/medicart/auth/service/AuthService.java`:

```java
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;  // Inject JwtService
    
    // Login Method
    public LoginResponse login(LoginRequest request) {
        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        // 3. Generate JWT token
        String token = jwtService.generateToken(user);
        
        // 4. Return response with token
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .build();
    }
}
```

**Explanation:**

```java
@Autowired
private JwtService jwtService;
```
- Spring injects JwtService
- We can now use JWT methods

```java
String token = jwtService.generateToken(user);
```
- Calls our generateToken method
- Passes user object
- Returns JWT token string

```java
return LoginResponse.builder()
        .token(token)
```
- Includes token in response
- Frontend will store this token
- Frontend sends token with every request

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                           │
└─────────────────────────────────────────────────────────────┘

Step 1: User enters email & password
        ↓
Step 2: POST /auth/login
        {
          "email": "user@example.com",
          "password": "password123"
        }
        ↓
Step 3: AuthController.login() called
        ↓
Step 4: AuthService.login() called
        ↓
Step 5: Find user in database
        userRepository.findByEmail(email)
        ↓
Step 6: Verify password
        passwordEncoder.matches(inputPassword, storedHash)
        ↓
Step 7: Generate JWT Token
        jwtService.generateToken(user)
        
        ┌─────────────────────────────────────┐
        │   JWT GENERATION PROCESS            │
        ├─────────────────────────────────────┤
        │ 1. Create claims map                │
        │    - userId: 1                      │
        │    - email: user@example.com        │
        │    - role: ROLE_USER                │
        │                                     │
        │ 2. Build JWT                        │
        │    - Add claims                     │
        │    - Set subject (email)            │
        │    - Set issued time (now)          │
        │    - Set expiration (now + 1 hour)  │
        │    - Sign with secret key           │
        │                                     │
        │ 3. Compact to string                │
        │    eyJhbGc...                       │
        └─────────────────────────────────────┘
        ↓
Step 8: Return token to user
        {
          "token": "eyJhbGciOiJIUzI1NiJ9...",
          "userId": 1,
          "email": "user@example.com"
        }
        ↓
Step 9: Frontend stores token
        localStorage.setItem("token", token)
        ↓
Step 10: User makes protected request
         GET /medicines
         Header: Authorization: Bearer eyJhbGc...
         ↓
Step 11: API Gateway validates token
         jwtService.isTokenValid(token)
         ↓
Step 12: Gateway extracts userId
         jwtService.extractEmail(token)
         ↓
Step 13: Gateway adds headers
         X-User-Id: 1
         X-User-Email: user@example.com
         ↓
Step 14: Request forwarded to service
         Service reads X-User-Id header
         ↓
Step 15: Service returns data
         Only data for this user
```

---

## 🧪 Testing Your JWT Implementation

### Test 1: Generate Token

Create a test class or use Postman:

```java
@Test
public void testGenerateToken() {
    // Create test user
    User user = User.builder()
            .id(1L)
            .email("test@example.com")
            .role(new Role("ROLE_USER"))
            .build();
    
    // Generate token
    String token = jwtService.generateToken(user);
    
    // Print token
    System.out.println("Generated Token: " + token);
    
    // Token should not be null
    assertNotNull(token);
    
    // Token should have 3 parts (header.payload.signature)
    assertEquals(3, token.split("\\.").length);
}
```

### Test 2: Extract Email

```java
@Test
public void testExtractEmail() {
    // Generate token
    User user = User.builder()
            .id(1L)
            .email("test@example.com")
            .build();
    String token = jwtService.generateToken(user);
    
    // Extract email
    String email = jwtService.extractEmail(token);
    
    // Should match original email
    assertEquals("test@example.com", email);
}
```

### Test 3: Validate Token

```java
@Test
public void testValidateToken() {
    // Generate valid token
    User user = User.builder()
            .id(1L)
            .email("test@example.com")
            .build();
    String token = jwtService.generateToken(user);
    
    // Should be valid
    assertTrue(jwtService.isTokenValid(token));
    
    // Invalid token should fail
    assertFalse(jwtService.isTokenValid("invalid.token.here"));
}
```

### Test 4: Using Postman

1. **Login Request:**
```
POST http://localhost:8080/auth/login
Body (JSON):
{
  "email": "admin@medicart.com",
  "password": "admin123"
}
```

2. **Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbWVkaWNhcnQuY29tIn0.signature",
  "userId": 1,
  "email": "admin@medicart.com"
}
```

3. **Copy the token**

4. **Use token in protected request:**
```
GET http://localhost:8080/auth/me
Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 🔍 Decode JWT Token (Understanding What's Inside)

Visit: https://jwt.io

Paste your token to see:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "ROLE_USER",
  "sub": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  your-secret-key
) 
```

**Important:** 
- Header and Payload are Base64 encoded (NOT encrypted!)
- Anyone can decode and read them
- Don't store sensitive data (passwords, credit cards)
- Signature ensures data hasn't been modified

---

## ❌ Common Issues & Solutions

### Issue 1: "JWT signature does not match"
**Cause:** Secret key mismatch
**Solution:** 
- Ensure same secret key in all services
- Check application.properties
- Secret must be at least 256 bits (32 characters)

### Issue 2: "Token has expired"
**Cause:** Token older than expiration time
**Solution:**
- User must login again
- Increase expiration time in properties
- Implement refresh tokens

### Issue 3: "Malformed JWT token"
**Cause:** Invalid token format
**Solution:**
- Check token has 3 parts (header.payload.signature)
- Ensure no spaces or line breaks
- Verify "Bearer " prefix in Authorization header

### Issue 4: "Secret key too short"
**Error:** "The specified key byte array is X bits which is not secure enough"
**Solution:**
- Secret must be at least 256 bits (32 characters)
- Use longer secret key in application.properties

### Issue 5: "Cannot find symbol: Jwts"
**Cause:** Missing JWT dependencies
**Solution:**
- Add all 3 JWT dependencies to pom.xml
- Run `mvn clean install`
- Refresh Maven project

---

## 🎯 Key Takeaways

✅ JWT is a token-based authentication mechanism  
✅ Token has 3 parts: Header, Payload, Signature  
✅ Secret key must be at least 256 bits  
✅ Token expires after configured time  
✅ Payload is readable (don't store secrets)  
✅ Signature prevents tampering  
✅ Stateless (no server-side storage)  
✅ Perfect for microservices  

---

## 📚 Next Steps

1. Implement refresh tokens for better UX
2. Add token blacklisting for logout
3. Implement role-based access control
4. Add token rotation for security
5. Monitor token usage and expiration

---

**You now understand JWT completely! 🎉**
