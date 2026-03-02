# 🔐 AUTH SERVICE - Complete Interview Guide

## 📋 Quick Summary (30 seconds)

"I worked on the Authentication Service, which is the core security component of our microservices architecture. It handles user registration, login, JWT token generation, password encryption using BCrypt, and password reset functionality with OTP verification. The service runs on port 8081, uses MySQL for data persistence, and registers with Eureka for service discovery. It generates JWT tokens that are validated by the API Gateway, following a trust-based security model where individual services don't need to validate tokens themselves."

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST /auth/login
       │ {email, password}
       ▼
┌─────────────────┐
│  API Gateway    │ (Port 8080)
│  Routes request │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Auth Service   │ (Port 8081)
│  - Validates    │
│  - Generates    │
│    JWT Token    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   MySQL DB      │
│   (auth_db)     │
│  - users table  │
│  - roles table  │
└─────────────────┘
```

---

## 🔑 Key Concepts You MUST Know

### 1. JWT (JSON Web Token)

**What is JWT?**
- A secure way to transmit information between parties as a JSON object
- Like a digital ID card that proves who you are
- Contains user information (userId, email, role)
- Signed with a secret key to prevent tampering

**JWT Structure:**
```
Header.Payload.Signature

Example:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature
```

**JWT Parts:**
1. **Header:** Algorithm used (HS256)
2. **Payload:** User data (email, role, userId)
3. **Signature:** Encrypted hash to verify authenticity

**Why JWT?**
- Stateless (no server-side session storage)
- Scalable (works across multiple servers)
- Self-contained (all info in the token)
- Secure (signed and can be encrypted)

**Interview Question:** "Why JWT over sessions?"
**Answer:** "JWT is stateless, meaning we don't need to store session data on the server. This makes it perfect for microservices where requests can go to different servers. Sessions require shared storage (like Redis) or sticky sessions, which adds complexity. JWT tokens contain all necessary information and can be validated independently by each service."

---

### 2. BCrypt Password Hashing

**What is BCrypt?**
- A password hashing algorithm
- One-way encryption (cannot be reversed)
- Adds random "salt" to each password
- Slow by design (prevents brute force attacks)

**How it works:**
```
Plain Password: "admin123"
                    ↓
              BCrypt Hash
                    ↓
Encrypted: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."
```

**Why BCrypt?**
- Industry standard for password security
- Each password gets unique salt (same password = different hash)
- Computationally expensive (slows down attackers)
- Adjustable work factor (can increase security over time)

**Interview Question:** "Why not just use MD5 or SHA256?"
**Answer:** "MD5 and SHA256 are fast hashing algorithms designed for data integrity, not password security. They're too fast, making brute force attacks feasible. BCrypt is intentionally slow and includes automatic salting. Even if two users have the same password, their hashes will be different due to unique salts. This prevents rainbow table attacks."

---

### 3. Spring Security

**What is Spring Security?**
- Framework for authentication and authorization
- Handles security concerns in Spring applications
- Provides filters, authentication managers, and security contexts

**Our Configuration:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())  // Disable CSRF for APIs
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
```

**Why permitAll()?**
- Gateway validates JWT tokens
- Auth Service trusts Gateway
- Gateway adds X-User-Id header
- Services read headers directly

**Interview Question:** "Why is your security config so simple?"
**Answer:** "We follow a Gateway-based security model. The API Gateway validates all JWT tokens before forwarding requests to services. Once a request reaches our Auth Service, we know it's already been authenticated by the Gateway. The Gateway adds X-User-Id, X-User-Email, and X-User-Role headers that we trust. This centralizes security logic and prevents code duplication across services."

---

### 4. JPA (Java Persistence API)

**What is JPA?**
- Standard for Object-Relational Mapping (ORM)
- Maps Java objects to database tables
- Hibernate is the implementation we use

**Key Annotations:**
```java
@Entity              // This class is a database table
@Table(name="users") // Table name
@Id                  // Primary key
@GeneratedValue      // Auto-increment
@Column              // Column properties
@ManyToOne           // Relationship
```

**How it works:**
```java
// Java Code
User user = new User();
user.setEmail("test@example.com");
userRepository.save(user);

// JPA generates SQL
INSERT INTO users (email, ...) VALUES ('test@example.com', ...);
```

**Interview Question:** "What is the difference between @Entity and @Table?"
**Answer:** "@Entity tells JPA that this class should be mapped to a database table. @Table specifies the actual table name in the database. If you don't use @Table, JPA uses the class name as the table name. For example, a class named 'User' would map to a table named 'user' by default."

---

### 5. Dependency Injection

**What is Dependency Injection?**
- Design pattern where objects receive dependencies from external source
- Spring creates and manages objects (beans)
- @Autowired tells Spring to inject dependencies

**Example:**
```java
@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;  // Spring injects this
    
    @Autowired
    private PasswordEncoder passwordEncoder;  // Spring injects this
}
```

**Why use it?**
- Loose coupling (easy to change implementations)
- Testability (can inject mock objects)
- Centralized configuration

**Interview Question:** "What is @Autowired and how does it work?"
**Answer:** "@Autowired tells Spring to automatically inject a dependency. Spring maintains a container of beans (objects it manages). When it creates an AuthService, it sees @Autowired on userRepository and automatically provides an instance from its container. This is called Inversion of Control - instead of creating dependencies ourselves, Spring provides them."

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,      -- BCrypt hashed
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,    -- ROLE_USER, ROLE_ADMIN
    description TEXT
);
```

**Relationship:** Many-to-One (Many users can have one role)

---

## 🔄 Complete Workflows

### 1. User Registration Flow

```
Step 1: User submits registration form
        ↓
Step 2: POST /auth/register
        {
          "email": "user@example.com",
          "password": "password123",
          "fullName": "John Doe",
          "phone": "1234567890"
        }
        ↓
Step 3: AuthController receives request
        ↓
Step 4: AuthService.register() called
        ↓
Step 5: Check if email already exists
        - userRepository.existsByEmail(email)
        - If exists: throw exception
        ↓
Step 6: Get ROLE_USER from database
        - roleRepository.findByName("ROLE_USER")
        ↓
Step 7: Encrypt password
        - passwordEncoder.encode(password)
        - "password123" → "$2a$10$..."
        ↓
Step 8: Create User object
        - User.builder()
          .email(email)
          .password(encryptedPassword)
          .role(userRole)
          .build()
        ↓
Step 9: Save to database
        - userRepository.save(user)
        - JPA generates: INSERT INTO users...
        ↓
Step 10: Generate JWT token
         - jwtService.generateToken(user)
         - Token contains: userId, email, role
         ↓
Step 11: Return response
         {
           "token": "eyJhbGc...",
           "userId": 1,
           "email": "user@example.com",
           "roles": ["ROLE_USER"]
         }
```

**Interview Question:** "Walk me through the registration process."
**Answer:** "When a user registers, the request comes to AuthController which calls AuthService. First, we check if the email already exists to prevent duplicates. Then we fetch the ROLE_USER from the database. We encrypt the password using BCrypt - this is crucial for security. We create a User object with all the details and save it to the database using JPA. After saving, we generate a JWT token containing the user's ID, email, and role. Finally, we return this token to the client, which stores it and uses it for subsequent requests."

---

### 2. User Login Flow

```
Step 1: User submits login form
        ↓
Step 2: POST /auth/login
        {
          "email": "user@example.com",
          "password": "password123"
        }
        ↓
Step 3: AuthController receives request
        ↓
Step 4: AuthService.login() called
        ↓
Step 5: Find user by email
        - userRepository.findByEmail(email)
        - Returns Optional<User>
        - If not found: throw exception
        ↓
Step 6: Check if account is active
        - if (!user.getIsActive())
        - If inactive: throw exception
        ↓
Step 7: Verify password
        - passwordEncoder.matches(inputPassword, storedPassword)
        - Compares: "password123" with "$2a$10$..."
        - If doesn't match: throw exception
        ↓
Step 8: Generate JWT token
        - jwtService.generateToken(user)
        ↓
Step 9: Return response
        {
          "token": "eyJhbGc...",
          "userId": 1,
          "email": "user@example.com",
          "roles": ["ROLE_USER"]
        }
```

**Interview Question:** "How do you verify passwords?"
**Answer:** "We use BCrypt's matches() method. When a user logs in, they provide a plain text password. We retrieve the stored BCrypt hash from the database. The matches() method hashes the input password with the same salt used in the stored hash and compares them. If they match, the password is correct. We never decrypt the stored password - BCrypt is one-way encryption."

---

### 3. JWT Token Generation

```
Step 1: User successfully logs in
        ↓
Step 2: JwtService.generateToken(user) called
        ↓
Step 3: Create claims (data to store in token)
        Map<String, Object> claims = new HashMap<>();
        claims.put("scope", "ROLE_USER");
        claims.put("email", "user@example.com");
        claims.put("fullName", "John Doe");
        claims.put("userId", 1);
        ↓
Step 4: Build JWT token
        Jwts.builder()
            .claims(claims)                    // Add user data
            .subject(user.getEmail())          // Set subject
            .issuedAt(new Date())              // Current time
            .expiration(new Date() + 1 hour)   // Expires in 1 hour
            .signWith(secretKey)               // Sign with secret
            .compact()                         // Convert to string
        ↓
Step 5: Return token string
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxfQ.signature"
```

**Token Structure:**
```
Header (Base64):
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Base64):
{
  "sub": "user@example.com",
  "userId": 1,
  "email": "user@example.com",
  "scope": "ROLE_USER",
  "iat": 1234567890,
  "exp": 1234571490
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Interview Question:** "What information do you store in JWT tokens?"
**Answer:** "We store the user's ID, email, full name, and role. The userId is crucial as other services use it to fetch user-specific data. We also include issued-at time and expiration time. The token is signed with a secret key to prevent tampering. We don't store sensitive information like passwords. The token expires after 1 hour for security."

---

### 4. Forgot Password Flow (3 Steps)

#### Step 1: Request OTP
```
User enters email
        ↓
POST /auth/forgot-password
{
  "email": "user@example.com"
}
        ↓
Check if user exists
        ↓
Generate 6-digit OTP
        ↓
Store OTP with timestamp
        ↓
Return OTP (demo mode)
{
  "message": "OTP sent",
  "demoOtp": "123456"
}
```

#### Step 2: Verify OTP
```
User enters OTP
        ↓
POST /auth/forgot-password/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
        ↓
Retrieve stored OTP
        ↓
Check if expired (10 minutes)
        ↓
Compare OTPs
        ↓
Delete OTP (one-time use)
        ↓
Return success
{
  "verified": true
}
```

#### Step 3: Reset Password
```
User enters new password
        ↓
POST /auth/reset-password
{
  "email": "user@example.com",
  "newPassword": "newpass123"
}
        ↓
Find user by email
        ↓
Encrypt new password
        ↓
Update user.password
        ↓
Save to database
        ↓
Return success
{
  "message": "Password changed"
}
```

---

## 🎯 Common Interview Questions & Answers

### Q1: "Explain your role in this project."
**Answer:** "I was responsible for the Authentication Service, which is the security backbone of our application. I implemented user registration and login with JWT token generation, password encryption using BCrypt, and a forgot password flow with OTP verification. I also ensured the service integrates properly with our API Gateway and Eureka service discovery. The service handles all user management operations and provides user analytics for the admin dashboard."

### Q2: "Why did you choose JWT over session-based authentication?"
**Answer:** "JWT is ideal for microservices architecture because it's stateless. With sessions, we'd need a shared session store like Redis that all services can access, adding complexity and a single point of failure. JWT tokens are self-contained - they carry all necessary information. Our API Gateway validates the token once, then services trust the Gateway. This is more scalable and simpler to maintain. JWT also works seamlessly with mobile apps and SPAs."

### Q3: "How do you handle password security?"
**Answer:** "We use BCrypt for password hashing, which is industry standard. BCrypt is intentionally slow to prevent brute force attacks and automatically adds a unique salt to each password. Even if two users have the same password, their hashes are different. We never store plain text passwords. During login, we use BCrypt's matches() method to verify passwords without decrypting the stored hash. We also enforce password complexity on the frontend."

### Q4: "What happens if someone steals a JWT token?"
**Answer:** "JWT tokens have a limited lifespan - ours expire after 1 hour. If stolen, the attacker can only use it until expiration. To mitigate this, we could implement refresh tokens, token blacklisting, or reduce expiration time. We also use HTTPS in production to prevent token interception. For sensitive operations like password changes, we require re-authentication. We could also implement device fingerprinting or IP validation for additional security."

### Q5: "How does your service communicate with other services?"
**Answer:** "Our service registers with Eureka Server on startup. Other services use OpenFeign clients to make REST API calls to us. For example, the Cart Service calls our /auth/users/{id} endpoint to get user details. The API Gateway routes all external requests to us. We don't validate JWT tokens ourselves - the Gateway does that and adds X-User-Id headers that we trust. This creates a clear security boundary."

### Q6: "Explain the @Autowired annotation."
**Answer:** "@Autowired is Spring's dependency injection mechanism. When Spring creates our AuthService, it sees @Autowired on userRepository and automatically provides an instance from its application context. This is Inversion of Control - instead of creating dependencies with 'new', Spring manages object lifecycle. This makes code more testable because we can inject mock objects during testing."

### Q7: "What is the difference between @Service, @Repository, and @Controller?"
**Answer:** "These are Spring stereotypes that define component roles. @Controller handles HTTP requests and returns responses. @Service contains business logic. @Repository handles database operations. While functionally similar, they provide semantic meaning and enable Spring to apply specific behaviors. For example, @Repository provides exception translation, converting database exceptions to Spring's DataAccessException."

### Q8: "How do you handle errors in your service?"
**Answer:** "We use try-catch blocks in controllers to catch exceptions and return appropriate HTTP status codes. For example, if a user isn't found, we return 404. For validation errors, we return 400 with error messages. We log all errors using SLF4J for debugging. We could enhance this with a @ControllerAdvice global exception handler to centralize error handling and provide consistent error responses across all endpoints."

### Q9: "What is JPA and how does it work?"
**Answer:** "JPA is Java Persistence API, a specification for Object-Relational Mapping. It maps Java objects to database tables. We use Hibernate as the implementation. When we annotate a class with @Entity, JPA knows to map it to a table. Methods like save(), findById(), and findAll() are automatically implemented by Spring Data JPA. It generates SQL queries based on method names. For example, findByEmail() generates 'SELECT * FROM users WHERE email = ?'."

### Q10: "How would you improve this service?"
**Answer:** "Several improvements: 1) Implement refresh tokens for better security. 2) Add rate limiting to prevent brute force attacks. 3) Implement email verification during registration. 4) Add two-factor authentication. 5) Use Redis for OTP storage instead of in-memory. 6) Implement password history to prevent reuse. 7) Add comprehensive unit and integration tests. 8) Implement audit logging for security events. 9) Add metrics and monitoring with Prometheus. 10) Implement account lockout after failed login attempts."

---

## 🔥 Technical Deep Dive

### Spring Boot Auto-Configuration
- Spring Boot automatically configures components based on classpath
- @SpringBootApplication combines @Configuration, @EnableAutoConfiguration, @ComponentScan
- Scans packages for @Component, @Service, @Repository, @Controller
- Creates beans and manages their lifecycle

### Lombok Annotations
- @Data: Generates getters, setters, toString, equals, hashCode
- @Builder: Provides builder pattern for object creation
- @NoArgsConstructor: Generates no-argument constructor
- @AllArgsConstructor: Generates constructor with all fields

### JPA Lifecycle Callbacks
- @PrePersist: Runs before saving new entity
- @PreUpdate: Runs before updating existing entity
- @PostLoad: Runs after loading entity from database
- Used for setting timestamps, validation, etc.

### Spring Data JPA Query Methods
- Method names are parsed to generate queries
- findBy + FieldName: SELECT WHERE field = ?
- existsBy + FieldName: SELECT COUNT WHERE field = ?
- countBy + FieldName: SELECT COUNT WHERE field = ?
- Custom queries with @Query annotation

---

## 📝 Code Walkthrough Tips

When explaining your code in interview:

1. **Start with the big picture:** "This is the AuthService which handles all authentication logic"

2. **Explain the flow:** "When a user registers, the request comes to AuthController, which calls AuthService..."

3. **Highlight security:** "We use BCrypt for password hashing, which is industry standard..."

4. **Mention design patterns:** "We use dependency injection for loose coupling..."

5. **Discuss trade-offs:** "We chose JWT over sessions because it's stateless and scalable..."

6. **Show understanding:** "The @Autowired annotation tells Spring to inject dependencies..."

7. **Be honest:** "If I were to improve this, I would add refresh tokens and rate limiting..."

---

## 🎓 Key Takeaways

✅ **JWT is stateless** - No server-side session storage needed  
✅ **BCrypt is secure** - One-way hashing with automatic salting  
✅ **Spring manages beans** - Dependency injection via @Autowired  
✅ **JPA maps objects** - Java classes to database tables  
✅ **Gateway validates tokens** - Services trust Gateway  
✅ **Roles control access** - ROLE_USER vs ROLE_ADMIN  
✅ **OTP for password reset** - Secure forgot password flow  
✅ **Eureka for discovery** - Services find each other dynamically  

---

**Good luck with your interview! 🚀**
