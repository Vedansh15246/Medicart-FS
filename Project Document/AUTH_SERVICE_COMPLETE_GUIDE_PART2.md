# 🔐 AUTH SERVICE - Complete Documentation Part 2

## 📁 Part 3: Entity Classes (entity folder)

### What are Entities?

Entities are **blueprints for database tables**. Think of them as:
- A form that defines what data to store
- Each entity = one table in database
- Each field = one column in table

---

### File 1: Role.java

**Purpose:** Represents the roles table (ROLE_USER, ROLE_ADMIN)

**Location:** `entity/Role.java`

```java
package com.medicart.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
```

#### Line-by-Line Explanation:

```java
package com.medicart.auth.entity;
```
- Package declaration
- This file is in `entity` folder

```java
import jakarta.persistence.*;
```
- **jakarta.persistence**: JPA (Java Persistence API)
- Contains annotations for database mapping
- `*`: Import all classes from this package

**What is JPA?**
- Standard for Object-Relational Mapping (ORM)
- Maps Java objects to database tables
- Automatically generates SQL queries

```java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
```
- **Lombok**: Library that generates boilerplate code
- Reduces code you need to write
- Generates getters, setters, constructors automatically

**Lombok Annotations:**
- `@Data`: Generates getters, setters, toString, equals, hashCode
- `@NoArgsConstructor`: Generates constructor with no parameters
- `@AllArgsConstructor`: Generates constructor with all parameters
- `@Builder`: Generates builder pattern

```java
@Entity
```
- **Most Important Annotation!**
- Tells JPA: "This is a database table"
- JPA will create/manage this table
- Without this, JPA ignores the class

```java
@Table(name = "roles")
```
- Specifies table name in database
- Table will be called "roles"
- If omitted, uses class name (Role → role)

```java
@Data
```
- Lombok annotation
- Generates:
  - `getId()`, `setId()`
  - `getName()`, `setName()`
  - `getDescription()`, `setDescription()`
  - `toString()`
  - `equals()`, `hashCode()`

**Without Lombok:**
```java
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }
public String getName() { return name; }
public void setName(String name) { this.name = name; }
// ... 20+ more lines!
```

**With Lombok:**
```java
@Data  // Just one annotation!
```

```java
@NoArgsConstructor
```
- Generates empty constructor
- `public Role() {}`
- Needed by JPA to create objects

```java
@AllArgsConstructor
```
- Generates constructor with all fields
- `public Role(Long id, String name, String description) { ... }`

```java
@Builder
```
- Generates builder pattern
- Easy way to create objects

**Builder Example:**
```java
// Without Builder (messy)
Role role = new Role();
role.setName("ROLE_USER");
role.setDescription("Standard user");

// With Builder (clean)
Role role = Role.builder()
    .name("ROLE_USER")
    .description("Standard user")
    .build();
```

```java
public class Role {
```
- Class declaration
- Blueprint for Role objects

```java
@Id
```
- **Primary Key annotation**
- Marks this field as the primary key
- Unique identifier for each row
- Like a student ID number

```java
@GeneratedValue(strategy = GenerationType.IDENTITY)
```
- **Auto-increment annotation**
- Database automatically generates ID
- `IDENTITY`: Use database's auto-increment feature
- 1, 2, 3, 4, 5... (increments automatically)

```java
private Long id;
```
- **Long**: Number type (can be very large)
- **private**: Only accessible within this class
- **id**: Primary key field

**Why Long instead of int?**
- `int`: Max value 2,147,483,647
- `Long`: Max value 9,223,372,036,854,775,807
- More room for growth!

```java
@Column(unique = true, nullable = false)
```
- **@Column**: Configure column properties
- **unique = true**: No duplicates allowed
- **nullable = false**: Cannot be null (required field)

```java
private String name;
```
- Role name (e.g., "ROLE_USER", "ROLE_ADMIN")
- Must be unique
- Cannot be null

```java
@Column(columnDefinition = "TEXT")
```
- **columnDefinition**: Specify exact SQL type
- **TEXT**: Large text field (up to 65,535 characters)
- Default VARCHAR is limited to 255 characters

```java
private String description;
```
- Role description
- Can be long text

#### Database Table Created:

```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);
```

#### Key Concepts:

**1. What is @Entity?**
- Marks class as database table
- JPA manages this class
- Automatically creates table

**2. What is @Id?**
- Primary key
- Unique identifier
- Like a student ID

**3. What is @GeneratedValue?**
- Auto-generates ID
- Database handles it
- You don't set ID manually

**4. What is Lombok?**
- Code generator
- Reduces boilerplate
- Generates getters/setters

**5. Column Constraints:**
- `unique`: No duplicates
- `nullable`: Can be null?
- `columnDefinition`: SQL type

---

### File 2: User.java

**Purpose:** Represents the users table

**Location:** `entity/User.java`

```java
package com.medicart.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Line-by-Line Explanation:

```java
import java.time.LocalDateTime;
```
- **LocalDateTime**: Date and time without timezone
- Example: 2024-02-23T14:30:00
- Used for createdAt and updatedAt

```java
@Column(unique = true, nullable = false)
private String email;
```
- Email must be unique (no duplicate emails)
- Cannot be null (required)
- Used for login

```java
@Column(nullable = false)
private String password;
```
- Encrypted password (BCrypt hash)
- Cannot be null
- **NEVER** store plain text passwords!

**Password Storage:**
```
User enters: "admin123"
Stored in DB: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZ..."
```

```java
@Column(nullable = false)
private String fullName;
```
- User's full name
- Required field

```java
@Column(nullable = false)
private String phone;
```
- User's phone number
- Required field

```java
@Column(nullable = false)
@Builder.Default
private Boolean isActive = true;
```
- **Boolean**: true/false
- **isActive**: Account status (active/disabled)
- **@Builder.Default**: Default value when using builder
- **= true**: Default value

**Why isActive?**
- Admin can disable accounts
- Disabled users cannot login
- Soft delete (don't actually delete user)

```java
@ManyToOne(fetch = FetchType.EAGER)
```
- **@ManyToOne**: Relationship annotation
- **Many users** can have **one role**
- **fetch = EAGER**: Load role immediately

**Relationship Diagram:**
```
ROLE_USER ←─── User 1
          ←─── User 2
          ←─── User 3

ROLE_ADMIN ←─── User 4
```

**Fetch Types:**
- **EAGER**: Load immediately (with user)
- **LAZY**: Load when accessed (separate query)

```java
@JoinColumn(name = "role_id")
```
- **@JoinColumn**: Foreign key column
- **name = "role_id"**: Column name in users table
- Links to roles.id

**Database Structure:**
```
users table:
id | email | password | role_id
1  | user1 | $2a$... | 1
2  | user2 | $2a$... | 1
3  | admin | $2a$... | 2

roles table:
id | name
1  | ROLE_USER
2  | ROLE_ADMIN
```

```java
private Role role;
```
- User's role object
- Can access: `user.getRole().getName()`

```java
@Column(name = "created_at", nullable = false, updatable = false)
```
- **name = "created_at"**: Column name (snake_case)
- **nullable = false**: Required
- **updatable = false**: Cannot be changed after creation

```java
private LocalDateTime createdAt;
```
- When user was created
- Set automatically by @PrePersist

```java
@Column(name = "updated_at")
private LocalDateTime updatedAt;
```
- When user was last updated
- Updated automatically by @PreUpdate

```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}
```
- **@PrePersist**: Runs before saving new entity
- **LocalDateTime.now()**: Current date/time
- Sets timestamps automatically

**When it runs:**
```java
User user = new User();
userRepository.save(user);  // @PrePersist runs here!
// createdAt and updatedAt are set automatically
```

```java
@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```
- **@PreUpdate**: Runs before updating existing entity
- Updates timestamp automatically

**When it runs:**
```java
User user = userRepository.findById(1L).get();
user.setFullName("New Name");
userRepository.save(user);  // @PreUpdate runs here!
// updatedAt is updated automatically
```

#### Database Table Created:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

#### Key Concepts:

**1. What is @ManyToOne?**
```
Many Users → One Role
User 1 ─┐
User 2 ─┼→ ROLE_USER
User 3 ─┘

User 4 ──→ ROLE_ADMIN
```

**2. What is @JoinColumn?**
- Specifies foreign key column
- Links to another table
- Creates relationship

**3. What is FetchType?**
- **EAGER**: Load immediately
- **LAZY**: Load when needed

**4. What is @PrePersist?**
- Runs before INSERT
- Set default values
- Automatic timestamps

**5. What is @PreUpdate?**
- Runs before UPDATE
- Update timestamps
- Validation

---

## 📁 Part 4: Repository Interfaces (repository folder)

### What are Repositories?

Repositories are **database assistants**. Think of them as:
- A librarian who fetches books
- Handles all database operations
- You ask, it delivers

---

### File 1: RoleRepository.java

**Purpose:** Database operations for roles

**Location:** `repository/RoleRepository.java`

```java
package com.medicart.auth.repository;

import com.medicart.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
```

#### Line-by-Line Explanation:

```java
import org.springframework.data.jpa.repository.JpaRepository;
```
- **JpaRepository**: Base interface for database operations
- Provides built-in methods (save, findAll, delete, etc.)
- We extend this to get free functionality

```java
import java.util.Optional;
```
- **Optional**: Container that may or may not contain a value
- Prevents NullPointerException
- Safe way to handle "not found" cases

```java
@Repository
```
- Marks this as a repository component
- Spring creates implementation automatically
- Enables exception translation

```java
public interface RoleRepository extends JpaRepository<Role, Long> {
```
- **interface**: Contract (no implementation)
- **extends JpaRepository**: Inherit built-in methods
- **<Role, Long>**: Entity type and ID type

**What JpaRepository provides:**
```java
// All these methods are FREE!
save(role)           // Insert or update
findById(id)         // Find by ID
findAll()            // Get all roles
delete(role)         // Delete role
count()              // Count roles
existsById(id)       // Check if exists
// ... and many more!
```

```java
Optional<Role> findByName(String name);
```
- **Custom method**: We define this
- **Spring generates implementation automatically!**
- **findByName**: Spring parses method name
- **Optional<Role>**: May or may not find role

**How Spring generates SQL:**
```java
// Method name: findByName
// Spring generates:
SELECT * FROM roles WHERE name = ?
```

**Method Naming Convention:**
```java
findBy + FieldName
existsBy + FieldName
countBy + FieldName
deleteBy + FieldName

Examples:
findByEmail(String email)
findByEmailAndPassword(String email, String password)
findByCreatedAtAfter(LocalDateTime date)
countByIsActive(Boolean active)
```

#### Usage Example:

```java
@Autowired
private RoleRepository roleRepository;

// Find role by name
Optional<Role> optional = roleRepository.findByName("ROLE_USER");

// Check if found
if (optional.isPresent()) {
    Role role = optional.get();
    System.out.println(role.getName());
}

// Or use orElseThrow
Role role = roleRepository.findByName("ROLE_USER")
    .orElseThrow(() -> new RuntimeException("Role not found"));

// Save role
Role newRole = Role.builder()
    .name("ROLE_ADMIN")
    .description("Administrator")
    .build();
roleRepository.save(newRole);

// Find all roles
List<Role> allRoles = roleRepository.findAll();

// Count roles
long count = roleRepository.count();
```

---

### File 2: UserRepository.java

**Purpose:** Database operations for users

**Location:** `repository/UserRepository.java`

```java
package com.medicart.auth.repository;

import com.medicart.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime start);
}
```

#### Line-by-Line Explanation:

```java
Optional<User> findByEmail(String email);
```
- Find user by email address
- Returns Optional (may not find user)
- Used for login

**Generated SQL:**
```sql
SELECT * FROM users WHERE email = ?
```

```java
boolean existsByEmail(String email);
```
- Check if email already exists
- Returns true/false
- Used during registration (prevent duplicates)

**Generated SQL:**
```sql
SELECT COUNT(*) > 0 FROM users WHERE email = ?
```

```java
long countByCreatedAtAfter(LocalDateTime start);
```
- Count users created after a date
- Returns number
- Used for analytics

**Generated SQL:**
```sql
SELECT COUNT(*) FROM users WHERE created_at > ?
```

#### Usage Example:

```java
@Autowired
private UserRepository userRepository;

// Find user by email
Optional<User> user = userRepository.findByEmail("user@example.com");

// Check if email exists
boolean exists = userRepository.existsByEmail("user@example.com");
if (exists) {
    throw new RuntimeException("Email already registered");
}

// Count users registered today
LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
long todayCount = userRepository.countByCreatedAtAfter(startOfDay);

// Save user
User newUser = User.builder()
    .email("new@example.com")
    .password(passwordEncoder.encode("password"))
    .fullName("New User")
    .phone("1234567890")
    .isActive(true)
    .role(userRole)
    .build();
userRepository.save(newUser);

// Find all users
List<User> allUsers = userRepository.findAll();

// Delete user
userRepository.deleteById(1L);
```

#### Key Concepts:

**1. What is JpaRepository?**
- Base interface for database operations
- Provides built-in methods
- We extend it to get functionality

**2. What is Optional?**
```java
// Old way (dangerous)
User user = userRepository.findByEmail(email);
if (user != null) { ... }  // Can cause NullPointerException

// New way (safe)
Optional<User> optional = userRepository.findByEmail(email);
if (optional.isPresent()) {
    User user = optional.get();
}
```

**3. Method Name Parsing:**
```java
findByEmail          → WHERE email = ?
findByEmailAndPhone  → WHERE email = ? AND phone = ?
findByCreatedAtAfter → WHERE created_at > ?
countByIsActive      → SELECT COUNT(*) WHERE is_active = ?
existsByEmail        → SELECT COUNT(*) > 0 WHERE email = ?
```

**4. Why interface, not class?**
- Spring generates implementation
- We just declare what we need
- Less code to write

**5. Built-in Methods:**
```java
save(entity)         // Insert or update
findById(id)         // Find by primary key
findAll()            // Get all records
delete(entity)       // Delete record
count()              // Count records
existsById(id)       // Check if exists
```

---

**Continue to Part 3 for Service and Controller classes...**
