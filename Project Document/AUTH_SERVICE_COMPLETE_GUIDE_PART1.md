# 🔐 AUTH SERVICE - Complete Documentation for Beginners

## 📚 Table of Contents
1. Project Structure Overview
2. Configuration Files (config folder)
3. Entity Classes (entity folder)
4. Repository Interfaces (repository folder)
5. Service Classes (service folder)
6. Controller Classes (controller folder)
7. Exception Handling
8. Application Properties
9. Complete Flow Examples

---

## 📁 Part 1: Project Structure Overview

### What is Auth Service?

Auth Service is like the **security guard** of your application:
- Checks who you are (Authentication)
- Decides what you can do (Authorization)
- Issues ID cards (JWT tokens)
- Manages user accounts

### Folder Structure:

```
auth-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── medicart/
│   │   │           └── auth/
│   │   │               ├── config/              ← Configuration files
│   │   │               │   ├── DataInitializer.java
│   │   │               │   ├── OpenApiConfig.java
│   │   │               │   ├── PasswordConfig.java
│   │   │               │   └── SecurityConfig.java
│   │   │               ├── controller/          ← API endpoints
│   │   │               │   ├── AuthController.java
│   │   │               │   ├── OtpController.java
│   │   │               │   └── UserController.java
│   │   │               ├── entity/              ← Database tables
│   │   │               │   ├── Role.java
│   │   │               │   └── User.java
│   │   │               ├── exception/           ← Error handling
│   │   │               │   └── GlobalExceptionHandler.java
│   │   │               ├── repository/          ← Database operations
│   │   │               │   ├── RoleRepository.java
│   │   │               │   └── UserRepository.java
│   │   │               ├── service/             ← Business logic
│   │   │               │   ├── AuthService.java
│   │   │               │   ├── JwtService.java
│   │   │               │   └── OtpService.java
│   │   │               └── AuthServiceApplication.java  ← Main class
│   │   └── resources/
│   │       └── application.properties           ← Configuration
│   └── test/                                    ← Test files
└── pom.xml                                      ← Dependencies
```

### What Each Folder Does:

#### 1. **config/** - Configuration Files
Think of this as the **settings menu** of your application.
- **DataInitializer.java**: Creates default admin user on startup
- **OpenApiConfig.java**: Configures Swagger documentation
- **PasswordConfig.java**: Sets up password encryption
- **SecurityConfig.java**: Configures security rules

#### 2. **controller/** - API Endpoints
Think of this as the **reception desk** that receives requests.
- **AuthController.java**: Handles login, register, password reset
- **OtpController.java**: Handles OTP generation and verification
- **UserController.java**: Handles user management (CRUD)

#### 3. **entity/** - Database Tables
Think of this as the **blueprint** for database tables.
- **User.java**: Represents users table
- **Role.java**: Represents roles table

#### 4. **repository/** - Database Operations
Think of this as the **database assistant** that fetches/saves data.
- **UserRepository.java**: User database operations
- **RoleRepository.java**: Role database operations

#### 5. **service/** - Business Logic
Think of this as the **brain** that makes decisions.
- **AuthService.java**: Login, register, user management logic
- **JwtService.java**: JWT token generation and validation
- **OtpService.java**: OTP generation and verification

#### 6. **exception/** - Error Handling
Think of this as the **error manager** that handles problems gracefully.
- **GlobalExceptionHandler.java**: Catches and handles all errors

---

## 🔧 Part 2: Configuration Files (config folder)

### File 1: SecurityConfig.java

**Purpose:** Configures security rules for the application

**Location:** `config/SecurityConfig.java`

```java
package com.medicart.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}
```

#### Line-by-Line Explanation:

```java
package com.medicart.auth.config;
```
- **package**: Organizes code into folders
- Like putting files in folders on your computer
- This file is in `com/medicart/auth/config` folder

```java
import org.springframework.context.annotation.Bean;
```
- **import**: Brings in code from other files
- Like borrowing tools from a toolbox
- `Bean`: Tells Spring to create and manage an object

```java
import org.springframework.context.annotation.Configuration;
```
- `Configuration`: Marks this class as a configuration file
- Spring reads this file on startup
- Contains settings for the application

```java
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
```
- `HttpSecurity`: Tool to configure web security
- Decides which URLs are protected
- Configures authentication and authorization

```java
import org.springframework.security.config.http.SessionCreationPolicy;
```
- `SessionCreationPolicy`: How to handle user sessions
- Options: STATELESS, STATEFUL, ALWAYS, NEVER
- We use STATELESS (no server-side sessions)

```java
import org.springframework.security.web.SecurityFilterChain;
```
- `SecurityFilterChain`: Chain of security filters
- Each request passes through these filters
- Filters check authentication, authorization, etc.

```java
@Configuration
```
- **Annotation**: Special marker for Spring
- Tells Spring: "This is a configuration class"
- Spring will read this on startup

```java
public class SecurityConfig {
```
- **public**: Can be accessed from anywhere
- **class**: Blueprint for creating objects
- **SecurityConfig**: Name of the class

```java
@Bean
```
- Tells Spring to create and manage this object
- Spring will call this method on startup
- Returns object that Spring will use

```java
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
```
- **public**: Can be called from anywhere
- **SecurityFilterChain**: Return type
- **filterChain**: Method name
- **HttpSecurity http**: Parameter (tool to configure security)
- **throws Exception**: Can throw errors

```java
http
```
- Start configuring security
- Chain multiple configurations together

```java
.csrf(csrf -> csrf.disable())
```
- **CSRF**: Cross-Site Request Forgery protection
- **What is CSRF?** Attack where malicious site tricks user into making unwanted requests
- **Why disable?** Not needed for stateless APIs (we use JWT tokens)
- **Lambda expression**: `csrf -> csrf.disable()` is a shorthand function

**CSRF Example:**
```
Without CSRF protection:
1. You login to bank.com
2. You visit evil.com
3. evil.com secretly sends request to bank.com to transfer money
4. Bank thinks it's you (because you're logged in)
5. Money transferred!

With JWT:
- Each request needs JWT token
- evil.com doesn't have your token
- Request rejected!
```

```java
.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```
- **sessionManagement**: How to handle sessions
- **STATELESS**: No server-side sessions
- **Why?** We use JWT tokens (stateless authentication)

**Session vs Stateless:**
```
Traditional Session (STATEFUL):
User logs in → Server creates session → Stores in memory/database
User makes request → Server checks session in database
Problem: Server must remember all sessions

JWT (STATELESS):
User logs in → Server creates JWT token → Sends to user
User makes request → Server verifies token signature
Benefit: No server-side storage needed!
```

```java
.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
```
- **authorizeHttpRequests**: Configure which URLs need authentication
- **anyRequest()**: All requests
- **permitAll()**: Allow everyone (no authentication needed)

**Why permitAll()?**
```
Our Architecture:
1. Client → API Gateway (validates JWT)
2. Gateway → Auth Service (already validated)
3. Auth Service trusts Gateway

Gateway already checked authentication!
Auth Service doesn't need to check again.
```

```java
return http.build();
```
- **build()**: Finalize configuration
- **return**: Send back the configured security chain
- Spring will use this configuration

#### Key Concepts:

**1. What is @Configuration?**
- Marks class as configuration
- Spring reads on startup
- Contains @Bean methods

**2. What is @Bean?**
- Creates Spring-managed object
- Spring calls method on startup
- Returns object Spring will use

**3. What is Lambda Expression?**
```java
// Traditional way:
csrf.disable()

// Lambda way:
csrf -> csrf.disable()

// Means: "Take csrf and call disable() on it"
```

**4. Why STATELESS?**
- No server-side sessions
- JWT tokens contain all info
- Scalable (works across multiple servers)

**5. Why permitAll()?**
- Gateway validates JWT
- Auth Service trusts Gateway
- No duplicate validation needed

---

### File 2: PasswordConfig.java

**Purpose:** Configures password encryption

**Location:** `config/PasswordConfig.java`

```java
package com.medicart.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### Line-by-Line Explanation:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
```
- **BCryptPasswordEncoder**: Password encryption tool
- Uses BCrypt algorithm
- Industry standard for password security

```java
import org.springframework.security.crypto.password.PasswordEncoder;
```
- **PasswordEncoder**: Interface for password encryption
- BCryptPasswordEncoder implements this interface
- Allows easy switching of encryption algorithms

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```
- Creates BCryptPasswordEncoder object
- Spring will inject this wherever needed
- Used in AuthService to encrypt/verify passwords

#### What is BCrypt?

**BCrypt Algorithm:**
```
Input: "password123"
       ↓
1. Generate random salt (unique for each password)
2. Combine password + salt
3. Hash multiple times (slow on purpose)
       ↓
Output: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."
```

**Why BCrypt?**
1. **Slow**: Takes time to hash (prevents brute force)
2. **Salt**: Each password gets unique salt
3. **One-way**: Cannot reverse (decrypt)
4. **Adaptive**: Can increase difficulty over time

**Example:**
```java
// Encrypt password
String plain = "admin123";
String encrypted = passwordEncoder.encode(plain);
// Result: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."

// Verify password
boolean matches = passwordEncoder.matches("admin123", encrypted);
// Result: true

boolean matches = passwordEncoder.matches("wrong", encrypted);
// Result: false
```

**Same Password, Different Hashes:**
```
User 1: "password123" → "$2a$10$ABC..."
User 2: "password123" → "$2a$10$XYZ..."

Why different? Each gets unique salt!
Prevents rainbow table attacks.
```

#### Key Concepts:

**1. What is Interface?**
```java
// Interface (contract)
interface PasswordEncoder {
    String encode(String password);
    boolean matches(String raw, String encoded);
}

// Implementation
class BCryptPasswordEncoder implements PasswordEncoder {
    // Actual code here
}
```

**2. Why use Interface?**
- Easy to switch implementations
- Can change from BCrypt to Argon2 easily
- Code depends on interface, not implementation

**3. What is Salt?**
```
Without Salt:
"password123" → Always same hash
Attacker can use rainbow tables (pre-computed hashes)

With Salt:
"password123" + "randomSalt1" → Hash1
"password123" + "randomSalt2" → Hash2
Each user gets different hash!
```

---

### File 3: DataInitializer.java

**Purpose:** Creates default data on application startup

**Location:** `config/DataInitializer.java`

```java
package com.medicart.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.medicart.auth.entity.Role;
import com.medicart.auth.entity.User;
import com.medicart.auth.repository.RoleRepository;
import com.medicart.auth.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Starting data initialization...");
            initializeRoles();
            initializeAdminUser();
            log.info("Data initialization completed.");
        } catch (Exception e) {
            log.warn("Data initialization skipped: {}", e.getMessage());
        }
    }

    private void initializeRoles() {
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = Role.builder()
                    .name("ROLE_USER")
                    .description("Standard user role")
                    .build();
            roleRepository.save(userRole);
            log.info("Created ROLE_USER");
        }

        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);
            log.info("Created ROLE_ADMIN");
        }
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@medicart.com";
        String adminPassword = "admin123";

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            User existing = userRepository.findByEmail(adminEmail).get();
            if (!passwordEncoder.matches(adminPassword, existing.getPassword())) {
                existing.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(existing);
                log.info("Admin password updated");
            } else {
                log.info("Admin user already exists");
            }
            return;
        }

        try {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Administrator")
                    .phone("9999999999")
                    .isActive(true)
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            log.info("Created admin user: {}", adminEmail);
        } catch (Exception e) {
            log.error("Failed to create admin user: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize admin user", e);
        }
    }
}
```

#### Line-by-Line Explanation:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
```
- **SLF4J**: Simple Logging Facade for Java
- **Logger**: Tool to write log messages
- **LoggerFactory**: Creates logger instances

```java
import org.springframework.boot.CommandLineRunner;
```
- **CommandLineRunner**: Interface that runs code on startup
- Spring calls `run()` method after application starts
- Used for initialization tasks

```java
import org.springframework.stereotype.Component;
```
- **@Component**: Marks class as Spring component
- Spring creates and manages this object
- Similar to @Service, @Repository, @Controller

```java
@Component
public class DataInitializer implements CommandLineRunner {
```
- **@Component**: Spring will create this object
- **implements CommandLineRunner**: Must implement `run()` method
- Spring calls `run()` automatically on startup

```java
private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
```
- **static**: Belongs to class, not instance
- **final**: Cannot be changed
- **Logger**: Object to write logs
- **LoggerFactory.getLogger()**: Creates logger for this class

**Logging Levels:**
```java
log.trace("Very detailed");  // Most detailed
log.debug("Debug info");     // For debugging
log.info("Information");     // General info
log.warn("Warning");         // Potential problem
log.error("Error");          // Error occurred
```

```java
@Autowired
private RoleRepository roleRepository;
```
- **@Autowired**: Spring injects dependency
- **RoleRepository**: Database operations for roles
- Spring provides this automatically

```java
@Override
public void run(String... args) throws Exception {
```
- **@Override**: Implementing interface method
- **run()**: Called by Spring on startup
- **String... args**: Command line arguments (variable length)
- **throws Exception**: Can throw errors

```java
try {
    log.info("Starting data initialization...");
    initializeRoles();
    initializeAdminUser();
    log.info("Data initialization completed.");
} catch (Exception e) {
    log.warn("Data initialization skipped: {}", e.getMessage());
}
```
- **try-catch**: Error handling
- **try**: Attempt these operations
- **catch**: If error occurs, handle it
- **log.warn()**: Log warning (not critical error)

#### initializeRoles() Method:

```java
private void initializeRoles() {
```
- **private**: Only used inside this class
- **void**: Doesn't return anything
- Creates ROLE_USER and ROLE_ADMIN

```java
if (roleRepository.findByName("ROLE_USER").isEmpty()) {
```
- **findByName()**: Search for role by name
- **isEmpty()**: Returns true if not found
- Only create if doesn't exist (prevent duplicates)

```java
Role userRole = Role.builder()
        .name("ROLE_USER")
        .description("Standard user role")
        .build();
```
- **Builder pattern**: Easy way to create objects
- **name()**: Set role name
- **description()**: Set description
- **build()**: Create the Role object

```java
roleRepository.save(userRole);
```
- **save()**: Insert into database
- JPA generates: `INSERT INTO roles (name, description) VALUES ('ROLE_USER', 'Standard user role')`

```java
log.info("Created ROLE_USER");
```
- Log success message
- Appears in console: `INFO: Created ROLE_USER`

#### initializeAdminUser() Method:

```java
String adminEmail = "admin@medicart.com";
String adminPassword = "admin123";
```
- Default admin credentials
- **IMPORTANT**: Change in production!

```java
if (userRepository.findByEmail(adminEmail).isPresent()) {
```
- **findByEmail()**: Search for user
- **isPresent()**: Returns true if found
- Check if admin already exists

```java
User existing = userRepository.findByEmail(adminEmail).get();
```
- **get()**: Extract User from Optional
- Gets existing admin user

```java
if (!passwordEncoder.matches(adminPassword, existing.getPassword())) {
```
- **matches()**: Compare passwords
- **!**: NOT operator (if doesn't match)
- Check if password is correct

```java
existing.setPassword(passwordEncoder.encode(adminPassword));
userRepository.save(existing);
```
- **encode()**: Encrypt password
- **setPassword()**: Update password
- **save()**: Update in database

```java
Role adminRole = roleRepository.findByName("ROLE_ADMIN")
        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
```
- **findByName()**: Search for ROLE_ADMIN
- **orElseThrow()**: If not found, throw error
- **Lambda**: `() -> new RuntimeException()`

```java
User adminUser = User.builder()
        .email(adminEmail)
        .password(passwordEncoder.encode(adminPassword))
        .fullName("Administrator")
        .phone("9999999999")
        .isActive(true)
        .role(adminRole)
        .build();
```
- **Builder pattern**: Create User object
- **encode()**: Encrypt password before storing
- **NEVER** store plain text passwords!

```java
userRepository.save(adminUser);
```
- Save admin user to database
- JPA generates INSERT statement

#### Key Concepts:

**1. What is CommandLineRunner?**
```java
// Spring calls this on startup
@Override
public void run(String... args) {
    // Your initialization code
}
```

**2. What is Optional?**
```java
// Old way (can cause NullPointerException)
User user = userRepository.findByEmail(email);
if (user != null) { ... }

// New way (safe)
Optional<User> optional = userRepository.findByEmail(email);
if (optional.isPresent()) {
    User user = optional.get();
}

// Or use orElseThrow
User user = userRepository.findByEmail(email)
    .orElseThrow(() -> new RuntimeException("Not found"));
```

**3. What is Builder Pattern?**
```java
// Without Builder (messy)
User user = new User();
user.setEmail("test@example.com");
user.setPassword("pass");
user.setFullName("Test");
user.setPhone("123");

// With Builder (clean)
User user = User.builder()
    .email("test@example.com")
    .password("pass")
    .fullName("Test")
    .phone("123")
    .build();
```

**4. Why Initialize Data?**
- Ensures required data exists
- Creates default admin account
- Prevents "no admin" problem
- Runs automatically on startup

---

## 🎯 Summary of Configuration Files

| File | Purpose | Key Points |
|------|---------|------------|
| SecurityConfig | Security rules | STATELESS, permitAll(), trusts Gateway |
| PasswordConfig | Password encryption | BCrypt, one-way hashing, salting |
| DataInitializer | Startup data | Creates roles and admin user |

---

**Continue to Part 2 for Entity Classes...**
