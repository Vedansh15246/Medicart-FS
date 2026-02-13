# 🔐 MediCart — Authentication System

## What This Document Covers

Everything about how users log in, register, and stay authenticated:
- User registration with OTP verification
- Login with email/password
- JWT token generation and validation
- Forgot password with OTP
- Admin authentication
- How the frontend stores and sends tokens

---

## 📁 Files Involved

### Backend (Auth Service — Port 8081)
```
auth-service/
├── controller/
│   ├── AuthController.java      ← Login, Register, Forgot Password endpoints
│   ├── OtpController.java       ← OTP send/verify endpoints
│   └── UserController.java      ← Get/Update/Delete user profiles
├── entity/
│   ├── User.java                ← User database entity
│   └── Role.java                ← Role entity (ROLE_USER, ROLE_ADMIN)
├── service/
│   ├── AuthService.java         ← Business logic for auth
│   ├── JwtService.java          ← JWT token creation/validation
│   └── OtpService.java          ← OTP generation and verification
└── resources/
    └── application.properties   ← JWT secret, DB config
```

### Frontend
```
frontend/src/
├── api/
│   ├── authService.js           ← API calls to auth endpoints
│   └── client.js                ← Axios instance with JWT interceptor
├── features/auth/
│   ├── pages/
│   │   ├── Login.jsx            ← Login page
│   │   ├── Register.jsx         ← Registration page
│   │   ├── ForgotPassword.jsx   ← Forgot password flow
│   │   └── Changepassword.jsx   ← Change password page
│   ├── components/
│   │   └── OtpPage.jsx          ← OTP input page
│   ├── authSlice.js             ← Redux slice for auth state
│   ├── ProtectedRoute.jsx       ← Route guard component
│   └── layout/
│       └── General.jsx          ← Layout wrapper for auth pages
├── features/admin/
│   ├── AdminLoginPage.jsx       ← Separate admin login
│   └── adminAuth.js             ← Admin auth helper functions
```

---

## 🗄️ Database Entities

### User Entity (`users` table)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // Auto-generated ID

    @Column(unique = true, nullable = false)
    private String email;         // Must be unique

    @Column(nullable = false)
    private String password;      // BCrypt hashed (NEVER stored as plain text!)

    @Column(nullable = false)
    private String fullName;      // User's display name

    @Column(nullable = false)
    private String phone;         // Phone number

    @Builder.Default
    private Boolean isActive = true;  // Can deactivate accounts

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;            // Links to Role table

    private LocalDateTime createdAt;   // Set automatically
    private LocalDateTime updatedAt;   // Updated on every save
}
```

**Key Points for Beginners:**
- `@Entity` tells Spring this class maps to a database table
- `@Id` marks the primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` means MySQL auto-increments the ID
- `@Column(unique = true)` prevents duplicate emails
- Password is NEVER stored as plain text — it's hashed using BCrypt

### Role Entity (`roles` table)

```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;         // "ROLE_USER" or "ROLE_ADMIN"
    private String description;  // "Standard user role"
}
```

---

## 🔄 Registration Flow — Step by Step

### Step 1: User fills the registration form (Frontend)

```jsx
// Register.jsx (simplified)
const handleRegister = async (e) => {
    e.preventDefault();
    
    // Collect form data
    const userData = {
        fullName: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        password: "mypassword123"
    };
    
    // Call API
    const response = await authService.register(userData);
    
    // Save token to localStorage
    localStorage.setItem("accessToken", response.token);
    
    // Redirect to home page
    navigate("/");
};
```

### Step 2: Frontend API call

```javascript
// authService.js
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

### Step 3: API Gateway receives the request

The request goes to `http://localhost:8080/auth/register`. The gateway sees `/auth/**` and routes it to the `auth-service` (found via Eureka). Since `/auth/register` is in the `PUBLIC_PATHS` list, **no JWT token is required**.

### Step 4: AuthController handles the request

```java
// AuthController.java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    try {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);           // 200 OK
    } catch (Exception e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", e.getMessage()));    // 400 Bad Request
    }
}
```

### Step 5: AuthService does the real work

```java
// AuthService.java
public LoginResponse register(RegisterRequest request) {
    // 1. Check if email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("User already exists with this email");
    }

    // 2. Find or create the ROLE_USER role
    Role role = roleRepository.findByName("ROLE_USER")
        .orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("ROLE_USER");
            return roleRepository.save(newRole);
        });

    // 3. Create user with hashed password
    User user = User.builder()
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))  // BCrypt hash!
        .fullName(request.getFullName())
        .phone(request.getPhone())
        .isActive(true)
        .role(role)
        .build();

    // 4. Save to database
    user = userRepository.save(user);

    // 5. Generate JWT token
    String token = jwtService.generateToken(user);

    // 6. Return response with token
    return LoginResponse.builder()
        .token(token)
        .userId(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .roles(List.of("ROLE_USER"))
        .build();
}
```

---

## 🔑 Login Flow — Step by Step

### Frontend

```jsx
// Login.jsx (simplified)
const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await authService.login(email, password);
    
    // Save token and role
    localStorage.setItem("accessToken", response.token);
    localStorage.setItem("userRole", response.roles[0]);
    
    // Update Redux state
    dispatch(loginSuccess({
        token: response.token,
        user: response,
    }));
    
    // Redirect based on role
    if (response.roles.includes("ROLE_ADMIN")) {
        navigate("/admin/products");
    } else {
        navigate("/");
    }
};
```

### Backend AuthService.login()

```java
public LoginResponse login(LoginRequest request) {
    // 1. Find user by email
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 2. Check if account is active
    if (!user.getIsActive()) {
        throw new RuntimeException("User account is inactive");
    }

    // 3. Compare passwords (plain text vs BCrypt hash)
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    // 4. Generate JWT token
    String token = jwtService.generateToken(user);

    // 5. Return response
    return LoginResponse.builder()
        .token(token)
        .userId(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .roles(List.of(user.getRole().getName()))
        .build();
}
```

---

## 🎫 JWT Token — How It Works

### What's Inside a JWT?

A JWT has 3 parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwic2NvcGUiOiJST0xFX1VTRVIiLCJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImZ1bGxOYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE3MTg5OTk5OTksImV4cCI6MTcxOTAwMzU5OX0.abc123signature
```

### JwtService — Token Generation

```java
// JwtService.java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("scope", "ROLE_" + user.getRole().getName().replace("ROLE_", ""));
    claims.put("email", user.getEmail());
    claims.put("fullName", user.getFullName());
    claims.put("userId", user.getId());    // Numeric user ID

    return Jwts.builder()
        .claims(claims)                    // Custom data
        .subject(user.getEmail())          // "sub" claim = email
        .issuedAt(new Date())              // "iat" = issued at
        .expiration(new Date(
            System.currentTimeMillis() + 3600000  // 1 hour expiry
        ))
        .signWith(getSigningKey())         // Sign with HMAC-SHA256
        .compact();
}
```

**The JWT payload contains:**
```json
{
  "sub": "john@example.com",       // Subject (who is this token for)
  "scope": "ROLE_USER",            // User's role
  "userId": 1,                     // Numeric user ID
  "email": "john@example.com",
  "fullName": "John Doe",
  "iat": 1718999999,               // Issued at (Unix timestamp)
  "exp": 1719003599                // Expires at (1 hour later)
}
```

### JWT Secret Key

```properties
# application.properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```

> **IMPORTANT:** This secret must be the SAME in auth-service and api-gateway. If they're different, the gateway can't verify tokens created by auth-service.

---

## 🛡️ How Tokens Are Sent (Axios Interceptor)

Every time the frontend makes an API call, the Axios interceptor automatically adds the JWT token:

```javascript
// client.js - Request Interceptor
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") 
            ? token 
            : `Bearer ${token}`;
    }
    
    // Also extract userId from the token and add as header
    let userId = extractUserIdFromToken(token);
    if (userId) {
        config.headers["X-User-Id"] = userId;
    }
    
    return config;
});
```

**What this means:**
- Every HTTP request automatically includes `Authorization: Bearer <token>`
- The user doesn't need to manually pass the token each time

---

## 🔓 Forgot Password Flow

### Step 1: Enter email
```
POST /auth/forgot-password
Body: { "email": "john@example.com" }
```
Backend checks if email exists and generates a 6-digit OTP.

### Step 2: OTP is generated (mocked)
```java
// OtpService.java
public Map<String, Object> generateAndSendOtp(String email) {
    String otp = generateOtp();  // Random 6-digit number
    otpStore.put(email, new OtpData(otp, System.currentTimeMillis()));
    
    // In production: send email with SMTP
    // For demo: OTP is returned in the API response
    response.put("demoOtp", otp);  // Shown to evaluator
    return response;
}
```

> **Note:** In this project, email sending is MOCKED. The OTP appears in the API response and server logs. In production, you'd use Gmail SMTP or SendGrid.

### Step 3: Verify OTP
```
POST /auth/forgot-password/verify-otp
Body: { "email": "john@example.com", "otp": "123456" }
```

### Step 4: Reset password
```
POST /auth/reset-password
Body: { "email": "john@example.com", "newPassword": "newpass123" }
```

```java
// AuthService.java
public void resetPassword(String email, String newPassword) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    user.setPassword(passwordEncoder.encode(newPassword));  // Re-hash
    userRepository.save(user);
}
```

---

## 🔒 Protected Routes (Frontend)

### ProtectedRoute Component

This component acts as a "guard" — it checks if the user has a token before allowing access to pages like Cart, Orders, etc.

```jsx
// ProtectedRoute.jsx
export default function ProtectedRoute() {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
        // Not logged in → redirect to login page
        return <Navigate to="/auth/login" replace />;
    }
    
    // Logged in → render the child routes
    return <Outlet />;
}
```

### How it's used in App.jsx:

```jsx
// App.jsx
<Routes>
    {/* Public — anyone can access */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth/login" element={<Login />} />
    
    {/* Protected — only logged-in users */}
    <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/payment" element={<CheckoutPage />} />
    </Route>
</Routes>
```

### Login Redirect for Already-Logged-In Users

```jsx
// Login.jsx (at the top of the component)
const token = localStorage.getItem("accessToken");
const role = localStorage.getItem("userRole");

if (token) {
    if (role === "ROLE_ADMIN") {
        return <Navigate to="/admin/products" replace />;
    }
    return <Navigate to="/" replace />;
}
```

---

## 👨‍💼 Admin Authentication

Admin has a separate login page at `/admin/login`. The admin user is auto-created by `DataInitializer`:

```
Email: admin@medicart.com
Password: admin123
Role: ROLE_ADMIN
```

### Admin Auth Flow:

```jsx
// AdminLoginPage.jsx
const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    const response = await authService.login(email, password);
    
    // Check if user has ADMIN role
    if (!response.roles.includes("ROLE_ADMIN")) {
        setError("Access denied. Admin role required.");
        return;
    }
    
    // Save admin credentials
    localStorage.setItem("admin_token", response.token);
    localStorage.setItem("admin_role", "ROLE_ADMIN");
    
    navigate("/admin/products");
};
```

### Admin Layout Guard:

```jsx
// AdminLayout.jsx
export default function AdminLayout() {
    const authenticated = isAdminAuthenticated();
    
    if (!authenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    
    return (
        <div>
            <header>/* Admin navbar with Products, Batches, etc. */</header>
            <main><Outlet /></main>  {/* Renders admin pages */}
        </div>
    );
}
```

---

## 🔑 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login with email/password |
| GET | `/auth/validate` | No | Check if service is running |
| GET | `/auth/me` | Yes | Get current user profile |
| POST | `/auth/forgot-password` | No | Request password reset OTP |
| POST | `/auth/forgot-password/verify-otp` | No | Verify OTP |
| POST | `/auth/reset-password` | No | Set new password |
| GET | `/auth/users` | Yes (Admin) | Get all users |
| GET | `/auth/users/{id}` | Yes | Get user by ID |
| PUT | `/auth/users/{id}` | Yes | Update user profile |
| DELETE | `/auth/users/{id}` | Yes (Admin) | Delete user |
| POST | `/auth/otp/send` | No | Send OTP to email |
| POST | `/auth/otp/verify` | No | Verify OTP + register |

---

## 🔐 Security Best Practices Used

1. **Password Hashing:** BCrypt (never stored as plain text)
2. **JWT with HS256:** Industry-standard token algorithm
3. **Token Expiry:** Tokens expire after 1 hour
4. **Role-Based Access:** ROLE_USER vs ROLE_ADMIN
5. **Gateway-Level Auth:** JWT validated at the API Gateway before reaching services
6. **CORS Configuration:** Only allowed origins (localhost:5173, 3000, 5174)
7. **Input Validation:** Email format, password requirements checked

---

*Next: Read [03_CATALOG_MEDICINES.md](./03_CATALOG_MEDICINES.md) to learn about the medicine catalog.*
