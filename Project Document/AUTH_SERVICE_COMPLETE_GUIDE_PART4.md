# 🔐 AUTH SERVICE - Complete Documentation Part 4

## 📁 Remaining Controllers - Complete Explanation

### File 1: OtpController.java

**Purpose:** Handles OTP (One-Time Password) operations

**Location:** `controller/OtpController.java`

This controller has already been explained in detail with comments in the code. Let me explain the key concepts:

#### Endpoint 1: Send OTP

```java
@PostMapping("/send")
public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
```

**What it does:**
```
1. User enters email
2. Generate 6-digit OTP
3. Store OTP with timestamp
4. Send OTP to email (demo: show in response)
5. Return success message
```

**Request:**
```json
POST /auth/otp/send
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "email": "user@example.com",
  "demoOtp": "123456",
  "expiryMinutes": 10
}
```

**Key Code:**
```java
String email = request.get("email");
```
- Extract email from request body
- **Map<String, String>**: Key-value pairs
- **get("email")**: Get value for key "email"

```java
if (email == null || email.trim().isEmpty()) {
    return ResponseEntity.badRequest().body(
        Map.of("error", "Email is required")
    );
}
```
- **Validation**: Check if email exists
- **trim()**: Remove whitespace
- **isEmpty()**: Check if empty string
- **badRequest()**: Return 400 status

```java
Map<String, Object> response = otpService.generateAndSendOtp(email);
```
- Call OtpService to generate OTP
- Returns map with OTP details

```java
return ResponseEntity.ok(response);
```
- **ok()**: Return 200 status
- **response**: OTP details

#### Endpoint 2: Verify OTP

```java
@PostMapping("/verify")
public ResponseEntity<?> verifyOtp(@RequestBody Map<String, Object> request) {
```

**Two Use Cases:**

**Use Case 1: Simple Verification**
```json
Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Email verified successfully",
  "email": "user@example.com",
  "status": "verified"
}
```

**Use Case 2: Registration with OTP**
```json
Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "fullName": "John Doe",
  "phone": "1234567890",
  "password": "pass123"
}

Response:
{
  "token": "eyJhbGc...",
  "userId": 1,
  "email": "user@example.com"
}
```

**Key Code:**

```java
String email = (String) request.get("email");
String otp = (String) request.get("otp");
```
- **Cast to String**: Map<String, Object> needs casting
- Extract email and OTP

```java
if (!otpService.verifyOtp(email, otp)) {
    return ResponseEntity.badRequest().body(
        Map.of("error", "Invalid or expired OTP")
    );
}
```
- **verifyOtp()**: Check if OTP is valid
- **!**: NOT operator (if false)
- Return error if invalid

```java
String fullName = (String) request.get("fullName");
String phone = (String) request.get("phone");
String password = (String) request.get("password");

if (fullName != null && phone != null && password != null) {
    // Registration flow
    RegisterRequest registerRequest = RegisterRequest.builder()
            .email(email)
            .fullName(fullName)
            .phone(phone)
            .password(password)
            .build();

    LoginResponse response = authService.register(registerRequest);
    return ResponseEntity.ok(response);
}
```
- **Check if registration data provided**
- If yes: Create user account
- If no: Just verify OTP

**Why two use cases?**
```
Use Case 1: Email verification only
- User verifies email
- No account created yet

Use Case 2: Registration with email verification
- User verifies email
- Account created immediately
- Returns JWT token
```

---

### File 2: UserController.java

**Purpose:** Handles user management operations

**Location:** `controller/UserController.java`

#### Endpoint 1: Get All Users

```java
@GetMapping
public ResponseEntity<List<UserDTO>> getAllUsers() {
```

**What it does:**
- Returns list of all users
- Used in admin panel
- Shows user table

**Request:**
```
GET /auth/users
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "isActive": true,
    "role": "ROLE_USER"
  },
  {
    "id": 2,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "phone": "9999999999",
    "isActive": true,
    "role": "ROLE_ADMIN"
  }
]
```

**Key Code:**

```java
List<UserDTO> users = authService.getAllUsers();
```
- **List<UserDTO>**: List of user objects
- Call service to get all users

```java
log.info("Fetched {} users", users.size());
```
- **{}**: Placeholder for variable
- **users.size()**: Number of users
- Logs: "Fetched 10 users"

```java
return ResponseEntity.ok(users);
```
- Return 200 with user list

#### Endpoint 2: Get User By ID

```java
@GetMapping("/{userId}")
public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
```

**What it does:**
- Get specific user by ID
- View user details

**Annotations:**

```java
@GetMapping("/{userId}")
```
- **{userId}**: Path variable (dynamic)
- Matches: /auth/users/1, /auth/users/2, etc.

```java
@PathVariable Long userId
```
- **@PathVariable**: Extract from URL
- **Long userId**: Variable name

**Example:**
```
URL: GET /auth/users/5
userId = 5
```

**Request:**
```
GET /auth/users/1
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "1234567890",
  "isActive": true,
  "role": "ROLE_USER"
}
```

**Key Code:**

```java
UserDTO user = (UserDTO) authService.getUserById(userId);
```
- **Cast to UserDTO**: Service returns Object
- Get user by ID

```java
return ResponseEntity.ok(user);
```
- Return 200 with user data

```java
} catch (Exception e) {
    log.error("Failed to fetch user - userId: {}: {}", userId, e.getMessage());
    return ResponseEntity.notFound().build();
}
```
- **catch**: Handle errors
- **notFound()**: Return 404 status
- **build()**: Create response with no body

#### Endpoint 3: Get Current User Profile

```java
@GetMapping("/profile")
public ResponseEntity<UserDTO> getUserProfile(
        @RequestHeader("X-User-Id") Long userId) {
```

**What it does:**
- Get logged-in user's profile
- Uses JWT token

**Annotations:**

```java
@RequestHeader("X-User-Id") Long userId
```
- **@RequestHeader**: Read HTTP header
- **"X-User-Id"**: Header name
- **Long userId**: Variable to store value

**How it works:**
```
1. User sends request with JWT token
   Authorization: Bearer eyJhbGc...

2. API Gateway validates token

3. Gateway extracts userId from token

4. Gateway adds header:
   X-User-Id: 1

5. This endpoint reads header

6. Returns user profile
```

**Request:**
```
GET /auth/users/profile
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
  "phone": "1234567890",
  "isActive": true,
  "role": "ROLE_USER"
}
```

**Why separate endpoint?**
```
/auth/users/1 - Get any user by ID
/auth/users/profile - Get MY profile

Profile endpoint:
- Simpler for frontend
- No need to know user ID
- Just send token
```

#### Endpoint 4: Update User Profile

```java
@PutMapping("/{userId}")
public ResponseEntity<?> updateUser(
        @PathVariable Long userId,
        @RequestHeader("X-User-Id") Long requestingUserId,
        @RequestBody RegisterRequest request) {
```

**What it does:**
- Update user's name and phone
- Security: Users can only update their OWN profile

**Annotations:**

```java
@PutMapping("/{userId}")
```
- **@PutMapping**: Handle PUT requests
- **PUT**: Update existing resource

```java
@PathVariable Long userId
```
- User ID from URL (who to update)

```java
@RequestHeader("X-User-Id") Long requestingUserId
```
- User ID from JWT (who is requesting)

```java
@RequestBody RegisterRequest request
```
- New user data from request body

**Security Check:**

```java
if (!userId.equals(requestingUserId)) {
    log.warn("Unauthorized update attempt - user {} trying to update user {}", 
             requestingUserId, userId);
    return ResponseEntity.status(403)
        .body(Map.of("error", "Cannot update other user's profile"));
}
```
- **equals()**: Compare two Long values
- **!**: NOT operator
- **403**: Forbidden status

**What this prevents:**
```
User 1 tries: PUT /auth/users/2
userId = 2 (from URL)
requestingUserId = 1 (from JWT)
2 != 1 → Forbidden!

User 1 tries: PUT /auth/users/1
userId = 1 (from URL)
requestingUserId = 1 (from JWT)
1 == 1 → Allowed!
```

**Request:**
```
PUT /auth/users/1
Headers:
  Authorization: Bearer eyJhbGc...
  X-User-Id: 1
Body:
{
  "fullName": "John Updated",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": "John Updated"
}
```

**Key Code:**

```java
com.medicart.auth.entity.User updatedUser = authService.updateUser(userId, request);
```
- Call service to update user
- Returns updated User entity

```java
return ResponseEntity.ok(Map.of(
        "message", "Profile updated successfully",
        "user", updatedUser.getFullName()
));
```
- **Map.of()**: Create immutable map
- Return success message with new name

#### Endpoint 5: Delete User

```java
@DeleteMapping("/{userId}")
public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
```

**What it does:**
- Permanently delete user
- Admin function
- Destructive operation!

**Annotations:**

```java
@DeleteMapping("/{userId}")
```
- **@DeleteMapping**: Handle DELETE requests
- **DELETE**: Remove resource

**Request:**
```
DELETE /auth/users/1
Headers:
  Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Key Code:**

```java
authService.deleteUser(userId);
```
- Call service to delete user
- Removes from database permanently

```java
log.info("User deleted successfully - userId: {}", userId);
```
- Log successful deletion
- For audit trail

**Warning:**
```
⚠️ This is permanent!
- User data is deleted
- Cannot be recovered
- Use with caution
```

**Better approach (Soft Delete):**
```java
// Instead of deleting, mark as inactive
user.setIsActive(false);
userRepository.save(user);

// User still in database but cannot login
```

---

## 🎯 Summary of All Controllers

### AuthController
- ✅ Register user
- ✅ Login user
- ✅ Get current user
- ✅ Forgot password (3 steps)
- ✅ Health check

### OtpController
- ✅ Send OTP to email
- ✅ Verify OTP
- ✅ Register with OTP verification

### UserController
- ✅ Get all users (admin)
- ✅ Get user by ID
- ✅ Get current user profile
- ✅ Update user profile
- ✅ Delete user (admin)

---

## 📊 Complete API Endpoints Reference

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| POST | /auth/register | Register new user | Public |
| POST | /auth/login | Login user | Public |
| GET | /auth/me | Get current user | Protected |
| POST | /auth/forgot-password | Request OTP | Public |
| POST | /auth/forgot-password/verify-otp | Verify OTP | Public |
| POST | /auth/reset-password | Reset password | Public |
| POST | /auth/otp/send | Send OTP | Public |
| POST | /auth/otp/verify | Verify OTP | Public |
| GET | /auth/users | Get all users | Protected |
| GET | /auth/users/{id} | Get user by ID | Protected |
| GET | /auth/users/profile | Get my profile | Protected |
| PUT | /auth/users/{id} | Update user | Protected |
| DELETE | /auth/users/{id} | Delete user | Protected |

---

## 🔑 Key Concepts Explained

### 1. @PathVariable vs @RequestParam

```java
// @PathVariable - Part of URL path
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    // URL: /users/5
    // id = 5
}

// @RequestParam - Query parameter
@GetMapping("/users")
public List<User> searchUsers(@RequestParam String name) {
    // URL: /users?name=John
    // name = "John"
}
```

### 2. @RequestHeader

```java
@GetMapping("/profile")
public User getProfile(@RequestHeader("X-User-Id") Long userId) {
    // Reads HTTP header
    // Header: X-User-Id: 1
    // userId = 1
}
```

### 3. @RequestBody

```java
@PostMapping("/users")
public User createUser(@RequestBody RegisterRequest request) {
    // Reads JSON from request body
    // Converts to RegisterRequest object
}
```

### 4. ResponseEntity

```java
// Success with data
return ResponseEntity.ok(user);
// HTTP 200 with user object

// Created
return ResponseEntity.status(201).body(user);
// HTTP 201 with user object

// Bad Request
return ResponseEntity.badRequest().body(Map.of("error", "Invalid data"));
// HTTP 400 with error message

// Not Found
return ResponseEntity.notFound().build();
// HTTP 404 with no body

// Forbidden
return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
// HTTP 403 with error message
```

### 5. Map.of()

```java
// Create immutable map
Map<String, Object> response = Map.of(
    "message", "Success",
    "userId", 1,
    "email", "user@example.com"
);

// Converts to JSON:
{
  "message": "Success",
  "userId": 1,
  "email": "user@example.com"
}
```

---

## 🎓 Interview Questions

### Q1: "Explain the difference between @PathVariable and @RequestParam"
**Answer:** "@PathVariable extracts values from the URL path itself, like /users/5 where 5 is the ID. @RequestParam extracts values from query parameters, like /users?name=John where name is the parameter. PathVariable is used for required values that identify a resource, while RequestParam is used for optional filters or search criteria."

### Q2: "Why do we use @RequestHeader for X-User-Id?"
**Answer:** "The API Gateway validates the JWT token and extracts the user ID from it. Instead of making each service parse the JWT again, the Gateway adds the user ID as an HTTP header (X-User-Id). Services just read this header, which is simpler and faster. This is a trust-based model where services trust the Gateway's validation."

### Q3: "What's the difference between PUT and PATCH?"
**Answer:** "PUT replaces the entire resource with new data - you must send all fields. PATCH updates only specific fields - you send only what changed. In our case, we use PUT for updating user profiles, but we only update the fields provided in the request."

### Q4: "Why return ResponseEntity instead of just the object?"
**Answer:** "ResponseEntity gives us control over the HTTP response. We can set the status code (200, 400, 404), add headers, and include the response body. Just returning an object always gives 200 status. With ResponseEntity, we can return 404 for not found, 400 for bad request, etc."

### Q5: "How does the security check in updateUser work?"
**Answer:** "We compare two IDs: userId from the URL (who to update) and requestingUserId from the JWT token (who is making the request). If they don't match, it means someone is trying to update another user's profile, so we return 403 Forbidden. This prevents users from modifying other users' data."

---

**Auth Service documentation is now 100% complete! 🎉**
