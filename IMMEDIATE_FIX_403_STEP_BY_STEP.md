# 🚀 IMMEDIATE FIX - 403 FORBIDDEN ERROR

## Your Current Error
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
URL: /batches
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

---

## 🎯 WHAT'S HAPPENING

Your request to create a batch is being **blocked** because:
- ❌ **JWT token exists** ✓ (Authorization header present)
- ❌ **Token is valid** ✓ (signature correct)
- ❌ **User is authenticated** ✓ (JWT decoded successfully)
- ✅ **BUT...** You might be **logged in with the wrong user** or have **wrong role**

---

## ✅ SOLUTION - 5 MINUTE FIX

### Step 1: Check Who You're Logged In As (30 seconds)

Open **Browser Console** (Press F12) and paste:

```javascript
const token = localStorage.getItem('accessToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));

console.log("═══════════════════════════════════════════");
console.log("📱 YOUR CURRENT LOGIN STATUS:");
console.log("═══════════════════════════════════════════");
console.log("✉️  Email:", payload.email);
console.log("🎭 Role:", payload.scope);
console.log("⏰ Expires:", new Date(payload.exp * 1000));
console.log("═══════════════════════════════════════════");

// Copy this entire output
```

**Expected output (if correct):**
```
═══════════════════════════════════════════
📱 YOUR CURRENT LOGIN STATUS:
═══════════════════════════════════════════
✉️  Email: admin@medicart.com
🎭 Role: ROLE_ADMIN
⏰ Expires: Tue Feb 03 2026 13:31:14 GMT+0530
═══════════════════════════════════════════
```

---

### Step 2: If Email is NOT admin@medicart.com

**Then you found the problem!** 🎯

You're logged in as a customer/pharmacist. You need to:

#### Option A: Logout and Login as Admin (RECOMMENDED)

```javascript
// In browser console:
localStorage.clear();
location.reload();  // Redirects to login page
```

Then login with:
```
Email: admin@medicart.com
Password: (ask your team for admin password)
```

#### Option B: Check Database If You Don't Know Admin Password

Open **MySQL CLI or Workbench** and run:

```sql
-- Check all users and their roles
SELECT u.id, u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;

-- Output should show:
-- id | email | role
-- 1  | admin@medicart.com | ROLE_ADMIN
-- 2  | customer@medicart.com | ROLE_CUSTOMER
-- 3  | pharmacist@medicart.com | ROLE_PHARMACIST
```

Find any user with `ROLE_ADMIN` and use that email to login.

---

### Step 3: Try Creating Batch Again

1. Logout (clear localStorage)
2. Login as **admin user**
3. Go to admin panel
4. Click "Add Batch"
5. Fill in details and save

**Expected result:** ✅ 200 OK (batch created successfully)

---

## 🔧 If Still Getting 403 After Login as Admin

Then there's a **deeper issue**. Let's debug:

### Debug Step 1: Verify Backend Secret Keys Match

**File 1:** `auth-service/application.properties`
```properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```

**File 2:** `admin-catalogue-service/application.properties`
```properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
```

✅ **MUST be identical!** If different → tokens won't validate → 403

### Debug Step 2: Check Service Logs

**Terminal running admin-catalogue-service:**

Look for:
```
✓ If you see: "✅ JWT VALID - email: admin@medicart.com, role: ROLE_ADMIN"
  → Token is valid ✓

✗ If you see: "❌ JWT VALIDATION FAILED"
  → Secret key mismatch or token corruption
  
✗ If you see: "⚠️ Authorization header is NULL"
  → API Gateway not forwarding token
```

### Debug Step 3: Verify WebSecurityConfig

**File:** `admin-catalogue-service/WebSecurityConfig.java` (lines 60-65)

Should look like:
```java
.requestMatchers("POST", "/batches/**").authenticated()
.requestMatchers("PUT", "/batches/**").authenticated()
.requestMatchers("DELETE", "/batches/**").hasRole("ADMIN")
```

✅ POST and PUT should be `.authenticated()` (not `.hasRole("ADMIN")`)

If it shows `.hasRole("ADMIN")`:
- Only ADMIN users can create/update
- Other roles get 403

If it shows `.authenticated()`:
- Any user with valid JWT can create/update
- No role checking

---

## 🎯 THE ROOT CAUSE

Your 403 error is almost certainly because:

1. **✗ You're NOT logged in as admin** 
   - Solution: Login as admin@medicart.com

2. OR **✗ JWT Secret keys don't match**
   - Solution: Restart all services with same secret key

3. OR **✗ Token is expired**
   - Solution: Login again

---

## 📋 VERIFICATION CHECKLIST

Before we say it's fixed, verify:

- [ ] **Step 1:** Ran the console command above ✓
- [ ] **Step 2:** Confirmed email is `admin@medicart.com` ✓
- [ ] **Step 3:** Confirmed role is `ROLE_ADMIN` ✓
- [ ] **Step 4:** Logged out and logged back in ✓
- [ ] **Step 5:** Tried creating batch ✓
- [ ] **Result:** Got 200 OK (not 403) ✓

---

## 🆘 STILL NOT WORKING?

If you followed all steps and STILL getting 403:

### Collect This Information:

1. **Your JWT token (from browser console):**
   ```javascript
   localStorage.getItem('accessToken')
   ```
   Copy the entire token string

2. **Your email (from same token):**
   ```javascript
   JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).email
   ```

3. **Check database user:**
   ```sql
   SELECT u.email, r.name FROM users u 
   LEFT JOIN user_roles ur ON u.id = ur.user_id 
   LEFT JOIN roles r ON ur.role_id = r.id 
   WHERE u.email = '{your email from step 2}';
   ```

4. **Admin service logs:**
   - Look for any error messages
   - Check JWT validation output
   - Note any exceptions

5. **Share this information** and we can pinpoint the exact issue!

---

## 🚀 ONE-CLICK RESTART SOLUTION

If you want to start completely fresh:

### 1. Clear All Caches
```powershell
# In PowerShell

# Kill all Java processes
Stop-Process -Name java -Force
Start-Sleep -Seconds 2

# Clear browser cache
# F12 → Application → Clear storage

# Clear MySQL cache (optional)
# In MySQL: FLUSH CACHE;
```

### 2. Rebuild Services
```powershell
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices"

# Clean and rebuild all
cd auth-service
mvn clean install -DskipTests
# Wait for success...

cd ../admin-catalogue-service
mvn clean install -DskipTests
# Wait for success...

cd ../api-gateway
mvn clean install -DskipTests
# Wait for success...
```

### 3. Start Services
```powershell
# Terminal 1: Eureka
cd eureka-server
java -jar target/eureka-server-1.0.0.jar

# Terminal 2: Auth Service (WAIT 5 seconds)
cd auth-service
java -jar target/auth-service-1.0.0.jar

# Terminal 3: Admin Catalogue Service
cd admin-catalogue-service
java -jar target/admin-catalogue-service-1.0.0.jar

# Terminal 4: API Gateway
cd api-gateway
java -jar target/api-gateway-1.0.0.jar

# Terminal 5: Frontend
cd frontend
npm run dev
```

### 4. Login Again
- Email: `admin@medicart.com`
- Password: (the correct password)

### 5. Try Creating Batch
Should work now! ✅

---

## 📚 WHAT YOU LEARNED

| Concept | What It Means |
|---------|---|
| **JWT Token** | A signed message containing user info (email, role) |
| **Token Payload** | The actual data inside JWT (visible but can't modify without re-signing) |
| **"scope" Claim** | Where we store the user's role in the JWT |
| **JwtAuthenticationFilter** | Decodes JWT and creates authority from scope claim |
| **401 Unauthorized** | No token provided |
| **403 Forbidden** | Token valid but user doesn't have permission |
| **.authenticated()** | Allows any user with valid JWT |
| **.hasRole("ADMIN")** | Only allows users with ADMIN role in token |
| **SecurityContext** | Where Spring stores current user's authorities |

---

## 🎓 COMPLETE FLOW (For Reference)

```
1. User logs in
   ↓
2. Password verified
   ↓
3. Role fetched from database
   ↓
4. JWT created with role in "scope" claim
   ↓
5. Token sent to frontend
   ↓
6. Frontend stores in localStorage
   ↓
7. Frontend sends token in Authorization header for each request
   ↓
8. JwtAuthenticationFilter decodes token
   ↓
9. Extracts role from "scope" claim
   ↓
10. Creates SimpleGrantedAuthority with that role
   ↓
11. Stores in SecurityContext
   ↓
12. WebSecurityConfig checks if permission matches
   ↓
13. If yes → Request reaches controller ✅
    If no → 403 Forbidden ❌
   ↓
14. Controller accesses user from SecurityContext
   ↓
15. Processes request and returns response
```

---

## 💡 REMEMBER

**The 403 error is a SECURITY FEATURE, not a bug!**

It means:
- ✅ Your JWT validation is working correctly
- ✅ Your role-based access control is working correctly
- ❌ But the user doesn't have permission for that action

**Solution:** Use an account that HAS permission (admin user)

---

## ✨ FINAL SUMMARY

| If You See | Reason | Fix |
|----------|--------|-----|
| 401 Unauthorized | No token sent | Add Authorization header |
| 403 Forbidden | Token valid but no permission | Login as admin OR change role requirements |
| 200 OK | Everything working | ✅ Success! |

**Your error = 403 = Use admin account or change permissions**

Pick one and you're done! 🚀

