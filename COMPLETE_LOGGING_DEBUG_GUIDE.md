# 🔍 COMPLETE REQUEST FLOW LOGGING GUIDE

## Overview
This guide shows EVERY single step of Spring Security, JWT parsing, and request handling. You'll see exactly where the 403 errors come from.

---

## 📊 Log Flow Map

```
REQUEST → JwtAuthenticationFilter
             ├─ Read Authorization header
             ├─ Extract Bearer token
             ├─ Parse JWT (signature verify)
             ├─ Extract claims (email, role)
             └─ Populate SecurityContext
           ↓
        UsernamePasswordAuthenticationFilter (skipped - JWT already handled)
           ↓
        AuthorizationFilter
             ├─ Check SecurityContext
             ├─ Check if authenticated
             └─ Check ROLE_ADMIN
           ↓
        DispatcherServlet
             ├─ Map URL to controller
             └─ Match HTTP method
           ↓
        MedicineController / BatchController
             ├─ Check SecurityContext again
             └─ Execute business logic
           ↓
        RESPONSE
```

---

## 🚀 Expected Logs for Each Scenario

### Scenario 1: GET /medicines (PUBLIC - Should Work)

#### Expected Log Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: GET | URI: /medicines
Remote Address: 127.0.0.1
════════════════════════════════════════════════════════════════

🔍 [JWT FILTER] Reading Authorization header
📋 Header value: NULL

⚠️  [JWT FILTER] Authorization header is NULL
→ Passing request to next filter WITHOUT authentication

→ [JWT FILTER] Passing request to next filter in chain
════════════════════════════════════════════════════════════════

🔷 [GET /medicines] REQUEST RECEIVED
════════════════════════════════════════════════════════════════
🎯 [MedicineController.getAllMedicines] SECURITY CONTEXT CHECK
   ❌ Authentication: NULL
════════════════════════════════════════════════════════════════

✅ [GET /medicines] RESPONSE SENT: X medicines
```

**Why it works:** permitAll() allows unauthenticated requests

---

### Scenario 2: POST /medicines with VALID Token (ADMIN - Should Work)

#### Step 1: Get Token from Auth Service
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@medicart.com", "password": "admin123"}'
```

#### Step 2: POST with Token
```bash
TOKEN="eyJhbGciOi..." # from response above

curl -X POST http://localhost:8082/medicines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Paracetamol", "price": 25}'
```

#### Expected Log Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /medicines
Remote Address: 127.0.0.1
════════════════════════════════════════════════════════════════

🔍 [JWT FILTER] Reading Authorization header
📋 Header value: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4i...

✂️  [JWT FILTER] Extracting token from header (substring 7)
📝 Token length: 234 characters
🔑 Token first 50 chars: eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4i...

🔓 [JWT FILTER] Parsing JWT with secret key
   Secret length: 57 characters

✅ [JWT FILTER] JWT SIGNATURE VERIFIED SUCCESSFULLY

════════════════════════════════════════════════════════════════
✨ [JWT FILTER] JWT CLAIMS EXTRACTED:
   👤 sub (email):     admin@medicart.com
   🎭 scope (role):    ROLE_ADMIN
   🕐 iat (issued):    Sun Feb 01 2026...
   ⏱️  exp (expiry):    Sun Feb 01 2026...
════════════════════════════════════════════════════════════════

🔐 [JWT FILTER] Creating authentication token
   Principal (email): admin@medicart.com
   Granted authority: ROLE_ADMIN

🔐 [JWT FILTER] Setting SecurityContext with authentication
   Before: NULL auth=null
   After: auth=UsernamePasswordAuthenticationToken [Principal=admin@medicart.com, Credentials=[PROTECTED], Authenticated=true, Details=null, Granted Authorities=[ROLE_ADMIN]]

✅ [JWT FILTER] SecurityContext POPULATED
════════════════════════════════════════════════════════════════

→ [JWT FILTER] Passing request to next filter in chain
════════════════════════════════════════════════════════════════

🔶 [POST /medicines] REQUEST RECEIVED
   Body: MedicineDTO(...)

════════════════════════════════════════════════════════════════
🎯 [MedicineController.createMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Principal: admin@medicart.com
   Authorities: [ROLE_ADMIN]
   Authenticated: true
════════════════════════════════════════════════════════════════

✅ [POST /medicines] RESPONSE SENT: 1
```

**Why it works:** 
- Token is valid
- SecurityContext has ROLE_ADMIN
- POST /medicines requires hasRole("ADMIN")
- Authorization granted ✅

---

### Scenario 3: POST /medicines with INVALID Token (Should Fail with 403)

#### Expected Log Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /medicines
Remote Address: 127.0.0.1
════════════════════════════════════════════════════════════════

🔍 [JWT FILTER] Reading Authorization header
📋 Header value: Bearer invalid.token.here

✂️  [JWT FILTER] Extracting token from header (substring 7)
📝 Token length: 18 characters

🔓 [JWT FILTER] Parsing JWT with secret key
   Secret length: 57 characters

❌ [JWT FILTER] EXCEPTION DURING JWT PARSING/VERIFICATION
   Exception type: io.jsonwebtoken.MalformedJwtException
   Exception message: Unable to read JSON value
   Exception cause: ...
   Stack trace: ...

⚠️  [JWT FILTER] Clearing SecurityContext due to exception

→ [JWT FILTER] Passing request to next filter in chain
════════════════════════════════════════════════════════════════

🔶 [POST /medicines] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [MedicineController.createMedicine] SECURITY CONTEXT CHECK
   ❌ Authentication: NULL
════════════════════════════════════════════════════════════════

[Spring Security] AuthenticationCredentialsNotFoundException
Access Denied: anonymous user cannot access [POST /medicines]
```

**Why it fails:**
- Token is invalid/malformed
- JWT parsing throws exception
- SecurityContext cleared
- Request reaches controller with NULL authentication
- POST /medicines requires hasRole("ADMIN")
- Anonymous not allowed
- 403 Forbidden ❌

---

### Scenario 4: GET /medicines with WRONG Role (Should Fail with 403)

(Assuming user has ROLE_USER instead of ROLE_ADMIN)

#### Expected Log Output:
```
✅ [JWT FILTER] JWT SIGNATURE VERIFIED SUCCESSFULLY

════════════════════════════════════════════════════════════════
✨ [JWT FILTER] JWT CLAIMS EXTRACTED:
   👤 sub (email):     user@medicart.com
   🎭 scope (role):    ROLE_USER  ← NOT ADMIN
   ...
════════════════════════════════════════════════════════════════

✅ [JWT FILTER] SecurityContext POPULATED with ROLE_USER

🔶 [POST /medicines] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [MedicineController.createMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Principal: user@medicart.com
   Authorities: [ROLE_USER]
   Authenticated: true
════════════════════════════════════════════════════════════════

[Spring Security] Access Denied
User does not have ROLE_ADMIN (has: ROLE_USER)
```

**Why it fails:**
- JWT is valid
- SecurityContext has ROLE_USER (not ROLE_ADMIN)
- POST /medicines requires hasRole("ADMIN")
- Authorization denied
- 403 Forbidden ❌

---

## 🔥 Error Signals - What to Watch For

### ❌ BAD: "Authorization header is NULL" for POST
```
⚠️  [JWT FILTER] Authorization header is NULL
→ Passing request to next filter WITHOUT authentication
```
**Cause:** Client didn't send token in header  
**Fix:** Add `-H "Authorization: Bearer $TOKEN"`

---

### ❌ BAD: "Header does NOT start with 'Bearer '"
```
⚠️  [JWT FILTER] Header does NOT start with 'Bearer '
```
**Cause:** Wrong format (probably "Token" instead of "Bearer")  
**Fix:** Use `Authorization: Bearer <token>` format

---

### ❌ BAD: "JWT has NO 'scope' claim"
```
❌ [JWT FILTER] JWT has NO 'scope' claim!
   Available claims: {sub, email, fullName, iat, exp}
```
**Cause:** auth-service not setting "scope" in JWT  
**Fix:** Check auth-service JwtService.generateToken()

---

### ❌ BAD: "EXCEPTION DURING JWT PARSING"
```
❌ [JWT FILTER] EXCEPTION DURING JWT PARSING/VERIFICATION
   Exception type: io.jsonwebtoken.MalformedJwtException
   Exception message: Unable to read JSON value
```
**Cause:** Token is malformed, expired, or signed with wrong secret  
**Fix:** Get fresh token, check JWT secret matches

---

### ❌ BAD: "scope (role): ADMIN" (without ROLE_ prefix)
```
🎭 scope (role):    ADMIN  ← WRONG!
```
**Cause:** auth-service not prefixing with "ROLE_"  
**Fix:** Check JwtService adds "ROLE_" prefix

---

### ❌ BAD: "Authentication: NULL" for POST
```
❌ Authentication: NULL
```
**For public GET:** OK ✓  
**For POST/PUT/DELETE:** ERROR ❌

**Cause:** JWT filter didn't populate SecurityContext  
**Fix:** Check token validity, JWT parsing

---

### ✅ GOOD: Everything Below

```
✅ [JWT FILTER] JWT SIGNATURE VERIFIED SUCCESSFULLY

✨ [JWT FILTER] JWT CLAIMS EXTRACTED:
   👤 sub (email):     admin@medicart.com
   🎭 scope (role):    ROLE_ADMIN

✅ [JWT FILTER] SecurityContext POPULATED

✅ Authentication: EXISTS
   Principal: admin@medicart.com
   Authorities: [ROLE_ADMIN]
```

All this = Success ✓

---

## 📋 Logging Configuration Summary

**File:** [application.properties](microservices/admin-catalogue-service/src/main/resources/application.properties)

Enables:
- ✅ `org.springframework.security=TRACE` - Every security decision
- ✅ `org.springframework.security.web.FilterChainProxy=TRACE` - Filter execution order
- ✅ `org.springframework.security.authorization=TRACE` - Authorization decisions
- ✅ `org.springframework.security.authentication=TRACE` - Authentication details
- ✅ `org.springframework.web=TRACE` - Request/response mapping
- ✅ `com.medicart=DEBUG` - Your code execution

---

## 📄 Modified Files with Logging

1. **[JwtAuthenticationFilter.java](microservices/admin-catalogue-service/src/main/java/com/medicart/admin/config/JwtAuthenticationFilter.java)**
   - Header detection
   - Token extraction
   - JWT parsing
   - Claim extraction
   - SecurityContext population

2. **[WebSecurityConfig.java](microservices/admin-catalogue-service/src/main/java/com/medicart/admin/config/WebSecurityConfig.java)**
   - Filter chain setup
   - Authorization rules
   - Session policy
   - Anonymous auth disable

3. **[MedicineController.java](microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/MedicineController.java)**
   - Each endpoint entry
   - SecurityContext check at controller level
   - Response confirmation

4. **[BatchController.java](microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/BatchController.java)**
   - Each endpoint entry
   - SecurityContext check at controller level
   - Response confirmation

5. **[application.properties](microservices/admin-catalogue-service/src/main/resources/application.properties)**
   - TRACE level for all Spring Security
   - DEBUG level for your code

---

## 🧪 Testing Commands

### Get Token
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicart.com",
    "password": "admin123"
  }' | jq '.token'
```

### Save Token (Windows PowerShell)
```powershell
$response = curl -X POST http://localhost:8081/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@medicart.com","password":"admin123"}' | ConvertFrom-Json

$TOKEN = $response.token
Write-Host "Token: $TOKEN"
```

### Test GET (Public - No Token)
```bash
curl -X GET http://localhost:8082/medicines
```

### Test POST (Admin - With Token)
```bash
# Using the token from above
curl -X POST http://localhost:8082/medicines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracetamol",
    "description": "Pain relief",
    "price": 25.50,
    "stock": 100
  }'
```

### Test POST (Invalid Token)
```bash
curl -X POST http://localhost:8082/medicines \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" \
  -d '{"name": "Paracetamol", "price": 25}'
```

---

## 🎯 What to Check in Logs

### ✅ For GET /medicines (No Token)
- [x] "Authorization header is NULL" - OK for public endpoint
- [x] "Passing request to next filter WITHOUT authentication" - OK
- [x] Controller logs appear
- [x] "200 OK" response

### ✅ For POST /medicines (With Valid Token)
- [x] "Authorization header = Bearer eyJ..." - Token present
- [x] "JWT SIGNATURE VERIFIED" - Token valid
- [x] "sub: admin@medicart.com" - Right user
- [x] "scope: ROLE_ADMIN" - Right role (with ROLE_ prefix)
- [x] "SecurityContext POPULATED" - Auth set
- [x] Controller logs appear
- [x] "200 OK" response

### ❌ For 403 Forbidden
- [x] Is the error in JwtAuthenticationFilter? (JWT parsing failed)
- [x] Is the error in AuthorizationFilter? (Role missing)
- [x] Does SecurityContext have NULL authentication? (Filter not run)
- [x] Does SecurityContext have wrong role? (Token has different role)

Look for these patterns in logs to debug 403 errors!

---

## 🚀 Next Steps

1. **Restart admin-catalogue-service**
2. **Run test commands above**
3. **Check console/log output**
4. **Find your scenario above**
5. **Follow the fix**

Build complete with maximum logging enabled. Ready to debug! 🔍

