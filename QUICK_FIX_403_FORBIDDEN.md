# 🔍 QUICK DIAGNOSTIC - Your 403 Forbidden Error

## Your Error Message
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
url: "/batches"
Authorization: 'Bearer eyJhbGciOiJIUzM4NCJ9...'
```

---

## ⚡ IMMEDIATE DIAGNOSIS (Do This NOW)

### Step 1: Check What User You're Logged In As
Open browser console (F12) and run:

```javascript
// Get your token
const token = localStorage.getItem('accessToken');

if (!token) {
    console.error("❌ NO TOKEN FOUND - You're not logged in!");
} else {
    // Decode JWT
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    
    console.log("═══════════════════════════════════════════");
    console.log("📊 YOUR CURRENT LOGIN INFO:");
    console.log("═══════════════════════════════════════════");
    console.log("✉️  Email:", payload.email);
    console.log("🎭 Role:", payload.scope);
    console.log("⏱️  Token expires:", new Date(payload.exp * 1000));
    console.log("═══════════════════════════════════════════");
    
    if (payload.scope === "ROLE_ADMIN") {
        console.log("✅ YOU ARE LOGGED IN AS ADMIN - Should have access to /batches");
    } else if (payload.scope === "ROLE_CUSTOMER") {
        console.log("❌ YOU ARE LOGGED IN AS CUSTOMER - Cannot create batches");
        console.log("💡 Solution: Logout and login as admin@medicart.com");
    } else {
        console.log("⚠️  UNKNOWN ROLE:", payload.scope);
    }
}
```

### Step 2: Check Your Database Users

Open MySQL and run:

```sql
-- See all users and their roles
SELECT 
    u.id,
    u.email,
    r.name as role_name,
    u.created_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;

-- Output should show:
-- id | email | role_name | created_at
-- 1  | admin@medicart.com | ROLE_ADMIN | ...
-- 2  | customer@medicart.com | ROLE_CUSTOMER | ...
```

### Step 3: Understanding Your Users

| Email | Role | Can Create Batches? |
|-------|------|-------------------|
| admin@medicart.com | ROLE_ADMIN | ✅ YES (if using token with authenticated()) |
| customer@medicart.com | ROLE_CUSTOMER | ✅ YES (if using token with authenticated()) |
| pharmacist@medicart.com | ROLE_PHARMACIST | ✅ YES (if using token with authenticated()) |

**Why?** Because your config now uses `.authenticated()` instead of `.hasRole("ADMIN")`

---

## 🎯 The Root Cause of YOUR 403

### Scenario 1: Logged in as CUSTOMER
```
User: customer@medicart.com
Role in Database: ROLE_CUSTOMER
JWT Token "scope": "ROLE_CUSTOMER"
    ↓
JwtAuthenticationFilter creates:
    SimpleGrantedAuthority("ROLE_CUSTOMER")
    ↓
Security Config checks:
    .authenticated() ? YES ✓
    ↓
✅ SHOULD PASS

But you're getting 403... WHY?
```

### Scenario 2: Token Validation Failed
```
Possible causes:
1. ❌ Different SECRET key in different services
   - Auth Service uses: "your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart"
   - Admin Service uses: "your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart"
   - If different → Token signature invalid → 403

2. ❌ API Gateway not forwarding token
   - Request arrives at API Gateway with token
   - API Gateway should forward token to admin-service
   - If lost → Admin service gets no token → 403

3. ❌ Token expired
   - Token generated at login
   - Expiration time has passed
   - JwtAuthenticationFilter rejects → 403

4. ❌ CORS headers blocking request
   - Browser can't send Authorization header
   - Request fails client-side before reaching server
```

---

## ✅ THE FIX

### Check 1: Verify Secret Keys Match
**File 1: auth-service/application.properties**
```
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```

**File 2: admin-catalogue-service/application.properties**
```
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```

✅ Both files MUST have the SAME secret key

### Check 2: Verify WebSecurityConfig Allows Authenticated Users

**File: admin-catalogue-service/WebSecurityConfig.java**
```java
.requestMatchers("POST", "/batches/**").authenticated()  // ✅ Correct
// NOT: .requestMatchers("POST", "/batches/**").hasRole("ADMIN")
```

### Check 3: Verify API Gateway Forwards Token

**File: api-gateway/src/main/resources/application.yml**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: admin-catalogue
          uri: http://localhost:8082
          predicates:
            - Path=/batches/**,/medicines/**
          filters:
            - StripPrefix=0  # Don't strip prefix
            - PreserveHostHeader  # ✅ Preserve headers (including Authorization)
```

---

## 🧪 TEST YOUR FIX

### Test 1: Login Check
```javascript
// In browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Logged in as:", payload.email, "with role:", payload.scope);
```

**Expected Output:**
```
Logged in as: admin@medicart.com with role: ROLE_ADMIN
```

### Test 2: Create Batch with Postman
```
POST http://localhost:8080/batches
Authorization: Bearer {paste_token_here}
Content-Type: application/json

{
  "medicineId": 1,
  "batchNo": "TEST-BATCH-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}
```

**If you get 200 OK:**
```json
{
  "id": 5,
  "medicineId": 1,
  "batchNo": "TEST-BATCH-001",
  "expiryDate": "2025-12-31",
  "qtyAvailable": 100
}
```
✅ Everything is working!

**If you still get 403:**
```json
{
  "status": 403,
  "error": "Access Forbidden"
}
```
❌ One of the checks failed - debug further

### Test 3: Check Service Logs

**Auth Service Logs (Should show JWT VALID):**
```
✅ JWT VALID - email: admin@medicart.com, role: ROLE_ADMIN
```

**Admin Service Logs (Should show request reached):**
```
✅ [BatchController] Security context populated with authorities: [ROLE_ADMIN]
✅ Creating batch for user: admin@medicart.com
```

---

## 📋 CHECKLIST TO FIX 403

- [ ] **Login Status:** Verify you're logged in as admin@medicart.com
- [ ] **Token Role:** Check token contains `"scope": "ROLE_ADMIN"`
- [ ] **Secret Keys:** Verify all services use SAME jwt.secret value
- [ ] **WebSecurityConfig:** Verify POST /batches uses `.authenticated()`
- [ ] **Database Roles:** Verify admin@medicart.com has role_id=1 (ROLE_ADMIN)
- [ ] **API Gateway:** Verify it forwards Authorization header
- [ ] **Service Restart:** Restart admin-catalogue-service after any config change

---

## 🚀 ONE-COMMAND FIX

If you're still getting 403, try this:

### 1. Logout
```javascript
// In browser console
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
// Refresh page
location.reload();
```

### 2. Login Again as Admin
```
Email: admin@medicart.com
Password: {the correct password}
```

### 3. Try Creating Batch
```
Click "Add Batch" button
Should work now! ✅
```

---

## 🤔 Still Not Working?

### Collect Debug Information:

1. **Your current token:**
   ```javascript
   const token = localStorage.getItem('accessToken');
   console.log(token);
   // Copy this entire token
   ```

2. **Your login email:**
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log(payload.email);
   ```

3. **Your database role:**
   ```sql
   SELECT u.email, r.name FROM users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   LEFT JOIN roles r ON ur.role_id = r.id
   WHERE u.email = '{your email from step 2}';
   ```

4. **Service log output:**
   - Look in admin-catalogue-service logs for JWT validation messages

Share these 4 pieces of information and we can pin down the exact issue! 🔍

