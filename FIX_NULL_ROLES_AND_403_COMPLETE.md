# 🔧 FIX - New Users Missing Roles & 403 Forbidden Error

## 📊 Your Current Issue

```
DATABASE STATE:
id  | email | role_id
1   | admin@medicart.com | 1 (ROLE_ADMIN)
2   | customer@medicart.com | 2 (ROLE_CUSTOMER)
3   | pharmacist@medicart.com | 3 (ROLE_PHARMACIST)
4   | shaikshahidmail@gmail.com | NULL ❌
5   | shaikshahid@gmail.com | NULL ❌
6   | shaikshahid1@gmail.com | NULL ❌
7   | aman@gmail.com | NULL ❌

JWT TOKEN FOR USER 4-7:
When they login, JwtService.generateToken() does:
  claims.put("scope", "ROLE_" + user.getRole().getName())
  
But user.getRole() returns NULL
  → NullPointerException OR "scope" is missing from token
  → JwtAuthenticationFilter can't extract role
  → No authority in SecurityContext
  → 403 Forbidden!
```

---

## ✅ THREE-STEP FIX

### STEP 1: Run SQL Migration (1 minute)

**File:** `MIGRATION_FIX_USER_ROLES.sql`

Open **MySQL Workbench** or **MySQL CLI** and run:

```sql
USE auth_service_db;

-- Create ROLE_USER if it doesn't exist
INSERT INTO roles (name, description, created_at) 
VALUES ('ROLE_USER', 'Standard user role', NOW())
ON DUPLICATE KEY UPDATE 
    description = 'Standard user role';

-- Assign ROLE_USER to users with NULL role_id
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'ROLE_USER')
WHERE role_id IS NULL;

-- Verify
SELECT id, email, role_id FROM users;
```

**Expected Output:**
```
id | email | role_id
1  | admin@medicart.com | 1
2  | customer@medicart.com | 2
3  | pharmacist@medicart.com | 3
4  | shaikshahidmail@gmail.com | 4 ✅ (ROLE_USER)
5  | shaikshahid@gmail.com | 4 ✅ (ROLE_USER)
6  | shaikshahid1@gmail.com | 4 ✅ (ROLE_USER)
7  | aman@gmail.com | 4 ✅ (ROLE_USER)
```

✅ **DONE!** All users now have roles.

---

### STEP 2: Rebuild & Restart Auth Service (2 minutes)

**Why?** We made a small code change to handle the case where ROLE_USER doesn't exist.

#### In PowerShell:

```powershell
# Navigate to auth-service
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\auth-service"

# Stop the currently running service
Stop-Process -Name java -Force
Start-Sleep -Seconds 2

# Clean and rebuild
mvn clean install -DskipTests

# Wait for "BUILD SUCCESS" message...
# Then start the service
java -jar target/auth-service-1.0.0.jar
```

**Expected Log Output:**
```
✅ Started AuthServiceApplication in 3.256 seconds
📡 [Auth Service] listening on port 8081
🔗 [Eureka] Successfully registered with Eureka Server
```

✅ **DONE!** Auth service is restarted with the fix.

---

### STEP 3: Login Again & Test (1 minute)

#### In Frontend:

1. **Clear localStorage** (to remove old tokens):
   ```javascript
   // F12 → Console
   localStorage.clear();
   location.reload();
   ```

2. **Login with a new user**:
   ```
   Email: shaikshahidmail@gmail.com
   Password: (the password they registered with)
   ```

3. **Check the JWT token** (in browser console):
   ```javascript
   const token = localStorage.getItem('accessToken');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log("Login Info:", {
       email: payload.email,
       role: payload.scope,
       expiresAt: new Date(payload.exp * 1000)
   });
   ```
   
   **Expected Output:**
   ```
   Login Info: {
       email: "shaikshahidmail@gmail.com",
       role: "ROLE_USER",  ✅ Now has role!
       expiresAt: ...
   }
   ```

4. **Try creating a batch**:
   - Go to admin panel
   - Click "Add Batch"
   - Fill in details:
     - Medicine: Aspirin
     - Batch No: TEST-001
     - Expiry Date: 2025-12-31
     - Quantity: 100
   - Click "Save"

   **Expected Result:**
   ```
   ✅ 200 OK - Batch created successfully!
   ❌ NOT 403 Forbidden anymore!
   ```

---

## 🎯 WHY THIS FIXES THE 403 ERROR

### Before Fix:
```
New User Registration:
  ↓
User.role = NULL (not assigned)
  ↓
Login:
  ↓
JwtService.generateToken():
  claims.put("scope", "ROLE_" + user.getRole().getName())
                             ↑
                    NullPointerException!
                    OR returns null
  ↓
Token generated WITHOUT role info
  ↓
JwtAuthenticationFilter:
  String role = claims.get("scope")  → NULL
  ↓
  SecurityContext.authorities = [] (empty)
  ↓
WebSecurityConfig checks:
  .authenticated() → YES ✓ (user has token)
  
  BUT WAIT... if role is NULL in JWT:
  JwtAuthenticationFilter might clear SecurityContext!
  ↓
  403 Forbidden ❌
```

### After Fix:
```
New User Registration:
  ↓
AuthService.register():
  ├─ Check if ROLE_USER exists
  ├─ If not → Create ROLE_USER automatically
  └─ Assign ROLE_USER to new user
  ↓
User.role = ROLE_USER (properly assigned)
  ↓
Login:
  ↓
JwtService.generateToken():
  claims.put("scope", "ROLE_USER")  ✓
  ↓
Token generated WITH role:
  {
    "scope": "ROLE_USER",
    "email": "shaikshahidmail@gmail.com",
    ...
  }
  ↓
JwtAuthenticationFilter:
  String role = claims.get("scope")  → "ROLE_USER"
  ↓
  SecurityContext.authorities = ["ROLE_USER"]
  ↓
WebSecurityConfig checks:
  .authenticated() → YES ✓ (user has token)
  ✓ Request proceeds
  ↓
BatchController.createBatch():
  ├─ Check SecurityContext
  ├─ Extract user info
  └─ Create batch
  ↓
200 OK - Batch created! ✅
```

---

## 📋 COMPLETE FLOW AFTER FIX

### When New User Registers:

```
1. Frontend: POST /auth/register
   {
     "email": "newuser@gmail.com",
     "password": "password123",
     "fullName": "New User",
     "phone": "9876543210"
   }

2. Backend: AuthService.register()
   a) Check if ROLE_USER exists
      - If YES: Use it
      - If NO: Create ROLE_USER (AUTO!)
   b) Create user with ROLE_USER
   c) Save to database
   d) Generate JWT token with "scope": "ROLE_USER"
   e) Return token to frontend

3. JWT Token Contains:
   {
     "scope": "ROLE_USER",  ✅ Role included
     "email": "newuser@gmail.com",
     "fullName": "New User",
     "iat": ...,
     "exp": ...
   }

4. Frontend: Store token in localStorage
   localStorage.setItem('accessToken', token)

5. Frontend: Later, POST /batches with token
   Authorization: Bearer {token}
   Content-Type: application/json
   
   {
     "medicineId": 1,
     "batchNo": "TEST",
     "expiryDate": "2025-12-31",
     "qtyAvailable": 100
   }

6. Backend: JwtAuthenticationFilter processes token
   - Decode JWT ✓
   - Extract "scope": "ROLE_USER" ✓
   - Create SimpleGrantedAuthority("ROLE_USER") ✓
   - Store in SecurityContext ✓

7. Backend: WebSecurityConfig checks
   .requestMatchers("POST", "/batches").authenticated()
   - User authenticated? YES ✓
   - Allow request ✓

8. Backend: BatchController creates batch
   - 200 OK ✅
   - Batch created successfully!
```

---

## 🔍 VERIFICATION CHECKLIST

### After Running SQL:

- [ ] Ran MIGRATION_FIX_USER_ROLES.sql ✓
- [ ] Users 4-7 now show `role_id = 4` (ROLE_USER) ✓
- [ ] Verified with query:
  ```sql
  SELECT u.id, u.email, r.name 
  FROM users u 
  LEFT JOIN roles r ON u.role_id = r.id 
  WHERE u.id >= 4;
  ```

### After Restarting Auth Service:

- [ ] Stopped old Java process ✓
- [ ] Ran `mvn clean install` ✓
- [ ] Got "BUILD SUCCESS" message ✓
- [ ] Started service: `java -jar target/auth-service-1.0.0.jar` ✓
- [ ] Service started without errors ✓

### After Login:

- [ ] Cleared localStorage ✓
- [ ] Logged in with new user (shaikshahidmail@gmail.com) ✓
- [ ] Got JWT token back ✓
- [ ] Token contains `"scope": "ROLE_USER"` ✓
- [ ] Tried creating batch ✓
- [ ] Got 200 OK (not 403) ✓

---

## 🆘 TROUBLESHOOTING

### Problem: Still Getting 403 After Fix

**Check 1: Did you run the SQL migration?**
```sql
SELECT * FROM users WHERE role_id IS NULL;
-- Should return: (no rows)
```

**Check 2: Did you restart auth service?**
```
Look for log: "✅ Started AuthServiceApplication in X seconds"
```

**Check 3: Did you clear localStorage and login again?**
```javascript
localStorage.clear();
location.reload();
// Then login again
```

**Check 4: Is your JWT token valid?**
```javascript
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload.scope);  // Should show "ROLE_USER" or "ROLE_ADMIN"
```

### Problem: "Role not found" error during registration

**Check:** Did ROLE_USER get created?
```sql
SELECT * FROM roles WHERE name = 'ROLE_USER';
```

**Fix:** If not found, run:
```sql
INSERT INTO roles (name, description, created_at) 
VALUES ('ROLE_USER', 'Standard user role', NOW());
```

### Problem: Maven build failed

**Check:** Do you have internet connection? Run:
```powershell
mvn dependency:resolve
```

**If still failing:** Try clean rebuild:
```powershell
mvn clean
mvn install -DskipTests
```

---

## 📚 WHAT EACH ROLE CAN DO

After this fix, here's what each role can do:

| Role | Users | Can Create Batch? | Can Login? | Can Buy? |
|------|-------|---|---|---|
| ROLE_ADMIN | admin@medicart.com | ✅ YES | ✅ YES | ✅ YES |
| ROLE_CUSTOMER | customer@medicart.com | ✅ YES* | ✅ YES | ✅ YES |
| ROLE_PHARMACIST | pharmacist@medicart.com | ✅ YES* | ✅ YES | ✅ YES |
| ROLE_USER | New users (4-7) | ✅ YES* | ✅ YES | ✅ YES |

*With token containing `.authenticated()` authorization

---

## 📝 CODE CHANGES SUMMARY

### 1. Database Changes (MIGRATION_FIX_USER_ROLES.sql):
```sql
-- Create ROLE_USER
INSERT INTO roles (name, description) VALUES ('ROLE_USER', 'Standard user role');

-- Assign to users with NULL role
UPDATE users SET role_id = 4 WHERE role_id IS NULL;
```

### 2. Backend Changes (AuthService.java):
```java
// Before: Would throw "Role not found" if ROLE_USER doesn't exist
Role role = roleRepository.findByName("ROLE_USER")
    .orElseThrow(() -> new RuntimeException("Role not found"));

// After: Auto-creates ROLE_USER if it doesn't exist
Role role = roleRepository.findByName("ROLE_USER")
    .orElse(null);
if (role == null) {
    role = new Role();
    role.setName("ROLE_USER");
    role.setDescription("Standard user role");
    role = roleRepository.save(role);
}
```

### 3. No changes needed to:
- WebSecurityConfig (already uses `.authenticated()`)
- JwtService (already puts role in "scope" claim)
- JwtAuthenticationFilter (already extracts role correctly)

---

## 🚀 FINAL SUMMARY

### The Problem:
- New users have NULL role_id in database
- JWT tokens can't include role (NullPointerException)
- JwtAuthenticationFilter can't create authority
- 403 Forbidden error

### The Solution:
1. ✅ Run SQL to create ROLE_USER and assign to existing users
2. ✅ Update AuthService to auto-create ROLE_USER if needed
3. ✅ Clear localStorage and login again
4. ✅ New JWT tokens will have role: "ROLE_USER"
5. ✅ 403 error will be gone!

### Time to Fix:
- SQL migration: 1 minute
- Rebuild + restart: 2 minutes
- Test: 1 minute
- **Total: 4 minutes** ⚡

---

## 💡 REMEMBER

The error is **NOT** because the endpoint requires ADMIN role.

It's because:
1. New users have no role assigned (NULL)
2. JWT can't include a NULL role in token
3. JwtAuthenticationFilter can't verify authenticity
4. Spring Security blocks the request with 403

**After this fix:**
- All users have a role
- JWT includes the role
- JwtAuthenticationFilter validates successfully
- 403 error disappears
- Everyone can create batches (because config uses `.authenticated()`)

✅ **You're done!**

