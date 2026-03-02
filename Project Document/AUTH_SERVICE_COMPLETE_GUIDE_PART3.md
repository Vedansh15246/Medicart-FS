# 🔐 AUTH SERVICE - Complete Documentation Part 3

## 📁 Part 5: Service Classes (service folder)

### What are Services?

Services contain **business logic**. Think of them as:
- The brain that makes decisions
- Where the actual work happens
- Controllers call services, services call repositories

**Flow:**
```
Controller → Service → Repository → Database
(Receives)   (Logic)   (Database)   (Storage)
```

---

### File 1: AuthService.java

**Purpose:** Handles authentication and user management logic

**Location:** `service/AuthService.java`

This is the MOST IMPORTANT service file. Let me explain it thoroughly:

```java
package com.medicart.auth.service;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.medicart.auth.entity.User;
import com.medicart.auth.repository.RoleRepository;
import com.medicart.auth.repository.UserRepository;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Methods explained below...
}
```

#### Imports Explanation:

```java
import java.util.stream.Collectors;
```
- **Stream API**: Process collections (lists, sets)
- **Collectors**: Collect stream results
- Used to convert lists

```java
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
```
- **Date/Time API**: Handle dates and times
- **DayOfWeek**: Monday, Tuesday, etc.
- **LocalDate**: Date without time (2024-02-23)
- **LocalDateTime**: Date with time (2024-02-23 14:30:00)

```java
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;
```
- **DTO**: Data Transfer Object
- Objects for transferring data
- **LoginRequest**: Email + password from frontend
- **LoginResponse**: Token + user info to frontend
- **RegisterRequest**: Registration data from frontend

#### Method 1: register()

```java
public LoginResponse register(RegisterRequest request) {
    log.info("Registration attempt for email: {}", request.getEmail());

    // Step 1: Check if email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("User already exists with this email");
    }

    // Step 2: Get ROLE_USER from database
    com.medicart.auth.entity.Role role = roleRepository.findByName("ROLE_USER")
            .orElseGet(() -> {
                com.medicart.auth.entity.Role newRole = new com.medicart.auth.entity.Role();
                newRole.setName("ROLE_USER");
                newRole.setDescription("Standard user role");
                return roleRepository.save(newRole);
            });

    // Step 3: Create user with encrypted password
    User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .isActive(true)
            .role(role)
            .build();

    // Step 4: Save to database
    user = userRepository.save(user);
    
    // Step 5: Generate JWT token
    String token = jwtService.generateToken(user);
    log.info("User registered successfully - userId: {}", user.getId());

    // Step 6: Return response
    return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(3600L)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(java.util.Arrays.asList(user.getRole().getName()))
            .build();
}
```

#### Line-by-Line Explanation:

```java
public LoginResponse register(RegisterRequest request) {
```
- **public**: Can be called from anywhere
- **LoginResponse**: Return type (what we send back)
- **register**: Method name
- **RegisterRequest request**: Parameter (data from frontend)

**RegisterRequest contains:**
```java
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

```java
log.info("Registration attempt for email: {}", request.getEmail());
```
- **log.info()**: Write to log file
- **{}**: Placeholder for variable
- Logs: "Registration attempt for email: user@example.com"

**Why log?**
- Track what's happening
- Debug problems
- Monitor activity

```java
if (userRepository.existsByEmail(request.getEmail())) {
    throw new RuntimeException("User already exists with this email");
}
```
- **existsByEmail()**: Check if email exists
- **throw**: Stop execution and throw error
- **RuntimeException**: Type of error

**What happens:**
```
1. Check database for email
2. If found: throw error
3. Frontend receives error message
4. User sees: "Email already registered"
```

```java
com.medicart.auth.entity.Role role = roleRepository.findByName("ROLE_USER")
        .orElseGet(() -> {
            com.medicart.auth.entity.Role newRole = new com.medicart.auth.entity.Role();
            newRole.setName("ROLE_USER");
            newRole.setDescription("Standard user role");
            return roleRepository.save(newRole);
        });
```
- **findByName()**: Search for ROLE_USER
- **orElseGet()**: If not found, create it
- **Lambda**: `() -> { ... }` is a function

**What this does:**
```
1. Try to find ROLE_USER
2. If found: use it
3. If not found: create it
4. Return the role
```

```java
User user = User.builder()
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .fullName(request.getFullName())
        .phone(request.getPhone())
        .isActive(true)
        .role(role)
        .build();
```
- **Builder pattern**: Create User object
- **passwordEncoder.encode()**: Encrypt password
- **IMPORTANT**: Never store plain text passwords!

**Password Encryption:**
```
Input: "password123"
       ↓
passwordEncoder.encode()
       ↓
Output: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."
```

```java
user = userRepository.save(user);
```
- **save()**: Insert into database
- Returns saved user (with generated ID)
- JPA generates: `INSERT INTO users (...) VALUES (...)`

```java
String token = jwtService.generateToken(user);
```
- **generateToken()**: Create JWT token
- Token contains: userId, email, role
- User will use this token for future requests

```java
return LoginResponse.builder()
        .token(token)
        .tokenType("Bearer")
        .expiresIn(3600L)
        .userId(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .roles(java.util.Arrays.asList(user.getRole().getName()))
        .build();
```
- **LoginResponse**: Object to send to frontend
- **token**: JWT token
- **tokenType**: "Bearer" (standard)
- **expiresIn**: 3600 seconds (1 hour)
- **userId, email, fullName**: User info
- **roles**: List of roles

**Response looks like:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "roles": ["ROLE_USER"]
}
```

---

#### Method 2: login()

```java
public LoginResponse login(LoginRequest request) {
    log.info("Login attempt for email: {}", request.getEmail());

    // Step 1: Find user by email
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Step 2: Check if account is active
    if (!user.getIsActive()) {
        throw new RuntimeException("User account is inactive");
    }

    // Step 3: Verify password
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        log.warn("Invalid password for email: {}", request.getEmail());
        throw new RuntimeException("Invalid password");
    }

    // Step 4: Generate JWT token
    String token = jwtService.generateToken(user);
    log.info("Login successful - userId: {}, role: {}", user.getId(), user.getRole().getName());

    // Step 5: Return response
    return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(3600L)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(java.util.List.of(user.getRole().getName()))
            .build();
}
```

#### Line-by-Line Explanation:

```java
User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));
```
- **findByEmail()**: Search for user
- **orElseThrow()**: If not found, throw error
- **Lambda**: `() -> new RuntimeException()`

**What happens:**
```
1. Search database for email
2. If found: return user
3. If not found: throw "User not found" error
```

```java
if (!user.getIsActive()) {
    throw new RuntimeException("User account is inactive");
}
```
- **!**: NOT operator
- **getIsActive()**: Check if account is active
- If inactive: throw error

**Why check isActive?**
- Admin can disable accounts
- Banned users cannot login
- Soft delete (don't actually delete user)

```java
if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    log.warn("Invalid password for email: {}", request.getEmail());
    throw new RuntimeException("Invalid password");
}
```
- **matches()**: Compare passwords
- **request.getPassword()**: Plain text from user
- **user.getPassword()**: Encrypted hash from database
- **!**: If doesn't match

**How matches() works:**
```
User enters: "password123"
Database has: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."

matches() does:
1. Extract salt from stored hash
2. Hash user input with same salt
3. Compare hashes
4. Return true/false
```

```java
log.warn("Invalid password for email: {}", request.getEmail());
```
- **log.warn()**: Warning level log
- Track failed login attempts
- Security monitoring

---

#### Method 3: getUserById()

```java
public Object getUserById(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return com.medicart.common.dto.UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .isActive(user.getIsActive())
            .role(user.getRole().getName())
            .createdAt(user.getCreatedAt())
            .build();
}
```

#### Explanation:

```java
User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
```
- **findById()**: Search by ID
- **orElseThrow()**: Throw error if not found

```java
return com.medicart.common.dto.UserDTO.builder()
        .id(user.getId())
        .email(user.getEmail())
        ...
        .build();
```
- **UserDTO**: Data Transfer Object
- **Why DTO?** Don't send password to frontend!
- Only send safe data

**Entity vs DTO:**
```java
// Entity (has password)
User {
  id: 1,
  email: "user@example.com",
  password: "$2a$10$...",  // SENSITIVE!
  fullName: "John"
}

// DTO (no password)
UserDTO {
  id: 1,
  email: "user@example.com",
  fullName: "John"
  // No password!
}
```

---

#### Method 4: getAllUsers()

```java
public List<com.medicart.common.dto.UserDTO> getAllUsers() {
    log.info("Fetching all users from database");
    
    return userRepository.findAll().stream()
            .map(user -> com.medicart.common.dto.UserDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .isActive(user.getIsActive())
                    .role(user.getRole().getName())
                    .createdAt(user.getCreatedAt())
                    .build())
            .collect(Collectors.toList());
}
```

#### Explanation:

```java
return userRepository.findAll().stream()
```
- **findAll()**: Get all users from database
- **stream()**: Convert list to stream (for processing)

**What is Stream?**
- Way to process collections
- Like a pipeline for data
- Can filter, map, collect

```java
.map(user -> com.medicart.common.dto.UserDTO.builder()
        ...
        .build())
```
- **map()**: Transform each item
- Convert User to UserDTO
- Lambda: `user -> ...`

**What map() does:**
```
Input: List<User>
       [User1, User2, User3]
       ↓
map(user -> UserDTO)
       ↓
Output: List<UserDTO>
        [UserDTO1, UserDTO2, UserDTO3]
```

```java
.collect(Collectors.toList());
```
- **collect()**: Collect stream results
- **toList()**: Convert to List
- Returns List<UserDTO>

---

#### Method 5: resetPassword()

```java
public void resetPassword(String email, String newPassword) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    log.info("Password reset successfully for email: {}", email);
}
```

#### Explanation:

```java
user.setPassword(passwordEncoder.encode(newPassword));
```
- **encode()**: Encrypt new password
- **setPassword()**: Update password field

```java
userRepository.save(user);
```
- **save()**: Update in database
- JPA generates: `UPDATE users SET password = ? WHERE id = ?`

---

#### Method 6: getUserCounts()

```java
public Map<String, Long> getUserCounts() {
    LocalDate today = LocalDate.now();
    LocalDateTime startOfToday = today.atStartOfDay();
    LocalDateTime startOfWeek = today.with(DayOfWeek.MONDAY).atStartOfDay();
    LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
    LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();

    long totalUsers = userRepository.count();
    long usersToday = userRepository.countByCreatedAtAfter(startOfToday);
    long usersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
    long usersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
    long usersThisYear = userRepository.countByCreatedAtAfter(startOfYear);

    return Map.of(
            "totalUsers", totalUsers,
            "usersToday", usersToday,
            "usersThisWeek", usersThisWeek,
            "usersThisMonth", usersThisMonth,
            "usersThisYear", usersThisYear
    );
}
```

#### Explanation:

```java
LocalDate today = LocalDate.now();
```
- **LocalDate.now()**: Current date
- Example: 2024-02-23

```java
LocalDateTime startOfToday = today.atStartOfDay();
```
- **atStartOfDay()**: Midnight (00:00:00)
- Example: 2024-02-23 00:00:00

```java
LocalDateTime startOfWeek = today.with(DayOfWeek.MONDAY).atStartOfDay();
```
- **with(DayOfWeek.MONDAY)**: Go to Monday of this week
- **atStartOfDay()**: Midnight
- Example: 2024-02-19 00:00:00 (Monday)

```java
long usersToday = userRepository.countByCreatedAtAfter(startOfToday);
```
- **countByCreatedAtAfter()**: Count users created after date
- Counts users registered today

```java
return Map.of(
        "totalUsers", totalUsers,
        "usersToday", usersToday,
        ...
);
```
- **Map.of()**: Create immutable map
- Returns key-value pairs

**Response:**
```json
{
  "totalUsers": 100,
  "usersToday": 5,
  "usersThisWeek": 20,
  "usersThisMonth": 50,
  "usersThisYear": 80
}
```

---

## 📁 Part 6: Controller Classes (controller folder)

### What are Controllers?

Controllers are **reception desks**. Think of them as:
- First point of contact
- Receive HTTP requests
- Call services
- Return HTTP responses

**Flow:**
```
Frontend → Controller → Service → Repository → Database
(Request)  (Receives)   (Logic)   (Database)   (Storage)
```

---

### File 1: AuthController.java

**Purpose:** Handles authentication API endpoints

**Location:** `controller/AuthController.java`

```java
package com.medicart.auth.controller;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medicart.auth.service.AuthService;
import com.medicart.auth.service.OtpService;
import com.medicart.common.dto.LoginRequest;
import com.medicart.common.dto.LoginResponse;
import com.medicart.common.dto.RegisterRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    // Methods explained below...
}
```

#### Annotations Explanation:

```java
@RestController
```
- **@RestController**: Marks class as REST API controller
- Combines @Controller + @ResponseBody
- Returns JSON automatically

```java
@RequestMapping("/auth")
```
- **Base URL**: All endpoints start with /auth
- Example: /auth/login, /auth/register

---

#### Endpoint 1: Register

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    try {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```

#### Line-by-Line Explanation:

```java
@PostMapping("/register")
```
- **@PostMapping**: Handle POST requests
- **URL**: POST /auth/register
- Used for creating new resources

```java
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
```
- **ResponseEntity<?>**: HTTP response wrapper
- **?**: Can return any type
- **@RequestBody**: Parse JSON from request body
- **RegisterRequest**: DTO with registration data

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

```java
try {
    LoginResponse response = authService.register(request);
    return ResponseEntity.ok(response);
}
```
- **try**: Attempt registration
- **authService.register()**: Call service method
- **ResponseEntity.ok()**: Return 200 OK status
- **response**: LoginResponse with token

**Success Response:**
```json
HTTP 200 OK
{
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

```java
catch (Exception e) {
    log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
}
```
- **catch**: Handle errors
- **log.error()**: Log error
- **badRequest()**: Return 400 Bad Request
- **Map.of()**: Create error response

**Error Response:**
```json
HTTP 400 Bad Request
{
  "error": "User already exists with this email"
}
```

---

#### Endpoint 2: Login

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        log.error("Login failed for email {}: {}", request.getEmail(), e.getMessage());
        return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
    }
}
```

**Request:**
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

---

#### Endpoint 3: Get Current User

```java
@GetMapping("/me")
public ResponseEntity<?> getCurrentUser(@RequestHeader("X-User-Id") Long userId) {
    try {
        Object userDTO = authService.getUserById(userId);
        return ResponseEntity.ok(userDTO);
    } catch (Exception e) {
        log.error("Failed to get user profile - userId: {}: {}", userId, e.getMessage());
        return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }
}
```

#### Explanation:

```java
@GetMapping("/me")
```
- **@GetMapping**: Handle GET requests
- **URL**: GET /auth/me
- Used for fetching data

```java
@RequestHeader("X-User-Id") Long userId
```
- **@RequestHeader**: Read HTTP header
- **X-User-Id**: Header name
- **Long userId**: Header value

**How it works:**
```
1. User sends request with JWT token
2. Gateway validates token
3. Gateway extracts userId from token
4. Gateway adds X-User-Id header
5. This endpoint reads header
```

**Request:**
```
GET /auth/me
Headers:
  Authorization: Bearer eyJhbGc...
  X-User-Id: 1
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

---

**Continue to Part 4 for complete examples and testing...**
