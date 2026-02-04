# Admin User Initialization

## Overview
The admin user is now automatically created at application startup with a bcrypt-hashed password. This happens in the `DataInitializer` class which implements Spring's `CommandLineRunner`.

## What Gets Created

### On First Run:
1. **ROLE_USER** - Standard user role
2. **ROLE_ADMIN** - Administrator role  
3. **Admin User** with the following credentials:
   - **Email:** `admin@medicart.com`
   - **Password:** `admin123` (bcrypt-hashed in database)
   - **Full Name:** Administrator
   - **Phone:** 9999999999
   - **Role:** ROLE_ADMIN
   - **Active:** true

### On Subsequent Runs:
- If the admin user already exists, it skips creation and continues with existing data
- Idempotent - safe to restart without duplicating records

## How It Works

### 1. **Password Hashing**
The password is automatically hashed using bcrypt (via `PasswordEncoder` bean) before being stored:
```java
String hashedPassword = passwordEncoder.encode("admin123");
// Result: $2a$10$... (bcrypt hash - different every time)
```

### 2. **Automatic Execution**
The `DataInitializer` class:
- Implements `CommandLineRunner` interface
- Automatically runs after Spring boot initializes all beans
- Executes BEFORE the application is ready to accept requests
- Provides detailed logging at INFO level

### 3. **Idempotent Design**
```java
if (userRepository.findByEmail(adminEmail).isPresent()) {
    // Admin already exists - skip creation
    return;
}
// Create admin only if doesn't exist
```

## Startup Logs

When the application starts, you'll see:

```
════════════════════════════════════════════════════════════════
🚀 [DataInitializer] Starting application data initialization...
════════════════════════════════════════════════════════════════
🔐 Initializing roles...
   ✅ Created ROLE_USER role
   ✅ Created ROLE_ADMIN role
👤 Initializing admin user...
   ✅ Created admin user successfully!
      📧 Email: admin@medicart.com
      🔑 Password: admin123 (bcrypt hashed)
      👥 Role: ROLE_ADMIN
      ✓ Active: true
════════════════════════════════════════════════════════════════
✅ [DataInitializer] Application data initialization completed!
════════════════════════════════════════════════════════════════
```

## Testing Admin Login

### Step 1: Start Auth Service
The admin user will be created automatically on startup.

### Step 2: Admin Login
Use the following credentials in the Admin Login page:
- **Email:** `admin@medicart.com`
- **Password:** `admin123`

### Step 3: Verify Success
✅ Login should succeed
✅ JWT token should be returned
✅ User should be redirected to admin dashboard

## Files Modified

- `microservices/auth-service/src/main/java/com/medicart/auth/config/DataInitializer.java`

## Database Schema

The admin user is stored in the `users` table:

```sql
SELECT * FROM users WHERE email = 'admin@medicart.com';

-- Result:
-- id: 1
-- email: admin@medicart.com
-- password: $2a$10$... (bcrypt hash)
-- full_name: Administrator
-- phone: 9999999999
-- is_active: true
-- role_id: (ROLE_ADMIN id)
-- created_at: 2026-02-02 ...
-- updated_at: 2026-02-02 ...
```

## Customization

To change admin credentials, modify in `DataInitializer.initializeAdminUser()`:

```java
String adminEmail = "admin@medicart.com";      // Change email here
String adminPassword = "admin123";              // Change password here
```

Then rebuild and restart the auth service.

## Security Notes

✅ **Password is bcrypt-hashed** - Never stored in plain text
✅ **Idempotent** - Safe to run multiple times
✅ **Automatic** - No manual SQL needed
✅ **Logged** - Can track creation in application logs

## Troubleshooting

### Admin login still fails with 400?
1. Check auth service logs for initialization messages
2. Verify database connection is working
3. Ensure `PasswordEncoder` bean is properly configured
4. Check that `ROLE_ADMIN` role was created

### Admin user not created?
1. Check if user already exists: `SELECT * FROM users WHERE email='admin@medicart.com'`
2. If exists, try different email and update credentials
3. Check for exceptions in application startup logs

### Password doesn't work?
The password must match exactly: `admin123`
- Bcrypt hashing is automatic
- Don't try to manually hash the password
- Different hash each time but same plain password validates correctly
