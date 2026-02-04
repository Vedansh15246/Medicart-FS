# JWT Authentication Implementation Guide

## ✅ Changes Made

### 1. **JwtAuthenticationFilter (admin-catalogue-service)**
- ✅ Added proper SLF4J logging with Logger
- ✅ Replaced deprecated `parserBuilder()` with modern `parser()` API
- ✅ Added detailed logging at each step:
  - Request method and URI
  - Authorization header presence
  - JWT parsing success/failure
  - User email and role extraction
  - SecurityContext update confirmation
- ✅ Proper error handling with SecurityContext clearing

### 2. **WebSecurityConfig (admin-catalogue-service)**
- ✅ Fixed filter registration: changed from `SecurityContextHolderFilter` to `UsernamePasswordAuthenticationFilter`
- ✅ Added proper logging for SecurityFilterChain initialization
- ✅ Ensured stateless session management
- ✅ Disabled anonymous authentication (critical!)
- ✅ Proper authorization rules:
  - GET /medicines/** - permitAll
  - GET /batches/** - permitAll
  - POST/PUT/DELETE - requiresRole("ADMIN")

### 3. **JWT Secret (Both Services)**
- ✅ auth-service: `your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart`
- ✅ admin-catalogue-service: `your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart`
- ✅ Both match exactly (removed "-2025" suffix from auth-service)

### 4. **application.properties (admin-catalogue-service)**
```properties
logging.level.root=INFO
logging.level.org.springframework.security=TRACE
logging.level.org.springframework.security.web.FilterChainProxy=TRACE
logging.level.org.springframework.security.authorization=TRACE
logging.level.org.springframework.security.authentication=TRACE
logging.level.org.springframework.web=DEBUG
logging.level.com.medicart=DEBUG
```

### 5. **JWT Payload (auth-service)**
- ✅ Role is prefixed with "ROLE_"
- ✅ Claims include: `sub`, `scope`, `email`, `fullName`, `iat`, `exp`

---

## 🧪 Testing Instructions

### Step 1: Start All Services
```bash
# Terminal 1 - Eureka Server
cd c:\Users\SHAHID\OneDrive\Desktop\Project\microservices
java -cp target/eureka-server/target/classes -Dcom.sun.jndi.ldap.object.trustSerialData=true eu.xenit.simple.App

# Terminal 2 - Auth Service
cd microservices
mvn spring-boot:run -f auth-service/pom.xml

# Terminal 3 - Admin Catalogue Service
cd microservices
mvn spring-boot:run -f admin-catalogue-service/pom.xml
```

### Step 2: Check Database for Admin User
```sql
-- Login to MySQL
mysql -u root -p

-- Use auth_service_db
USE auth_service_db;

-- Check if admin user exists
SELECT id, email, role_id FROM users WHERE email = 'admin@medicart.com';

-- If not, you may need to create it via register endpoint first
```

### Step 3: Get a Token (Login)
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicart.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4iLCJl...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": 1,
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "roles": ["ROLE_ADMIN"]
}
```

### Step 4: Decode Token (jwt.io)
1. Go to https://jwt.io
2. Paste the token in the left side
3. **Verify the payload looks like this:**
```json
{
  "sub": "admin@medicart.com",
  "scope": "ROLE_ADMIN",
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "iat": 1769945081,
  "exp": 1769948681
}
```

⚠️ **Critical Check:** The `scope` claim MUST contain `"ROLE_ADMIN"` (with the ROLE_ prefix)

### Step 5: Test WRITE Operation (POST) - Requires Admin
```bash
# Save your token from Step 3
$TOKEN="YOUR_TOKEN_HERE"

# Create a medicine (REQUIRES ADMIN ROLE)
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

**Expected Response:** 201 Created with medicine object

### Step 6: Test READ Operation (GET) - Public
```bash
# Read medicines WITHOUT token (should work!)
curl -X GET http://localhost:8082/medicines
```

**Expected Response:** 200 OK with list of medicines

### Step 7: Test Invalid Token
```bash
# Try with malformed token
curl -X POST http://localhost:8082/medicines \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "price": 10
  }'
```

**Expected Response:** 403 Forbidden or 401 Unauthorized

---

## 📊 Expected Log Flow

When you run Step 5 (POST /medicines), you should see logs like this:

```
🔐 JWT FILTER START → POST /medicines
Authorization header = Bearer eyJhbGciOi...
✅ JWT parsed
User = admin@medicart.com
Role = ROLE_ADMIN
✅ SecurityContext updated with ROLE = ROLE_ADMIN
Authorizing POST /medicines
Authorization granted (user has ROLE_ADMIN)
```

### ❌ If You See These Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `❌ No Bearer token found` | Token not in request | Add Authorization header |
| `❌ JWT validation failed` | Token invalid/expired | Get new token from login |
| `ROLE_ANONYMOUS` in logs | Anonymous auth not disabled | Check WebSecurityConfig |
| `AuthenticationCredentialsNotFoundException` | SecurityContext cleared | Check JwtAuthenticationFilter |
| `JWT FILTER START` logs don't appear | Filter not registered | Check addFilterBefore() in WebSecurityConfig |
| Token has `scope: "ADMIN"` not `"ROLE_ADMIN"` | JwtService generating wrong format | Check auth-service JwtService.generateToken() |

---

## 🔍 Debugging Checklist

1. **Check Filter Chain Order**
   - Look for log: `🛡️ Initializing SecurityFilterChain`
   - JWT filter must run BEFORE UsernamePasswordAuthenticationFilter
   - ✅ Verify: `.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`

2. **Verify JWT Secret Match**
   ```
   auth-service (JwtService @Value): your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
   admin-catalogue (JwtAuthenticationFilter): your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart
   ```
   - Copy one character wrong = silent failure
   - Use: `diff -u` or manual comparison

3. **Check Token Claims**
   - Use jwt.io to decode
   - MUST have: `sub`, `scope`, `iat`, `exp`
   - `scope` MUST be `"ROLE_ADMIN"` (with ROLE_ prefix)

4. **Verify Anonymous Disabled**
   - In logs, search for `ROLE_ANONYMOUS`
   - Must NOT appear for authenticated requests
   - ✅ Code: `.anonymous(anon -> anon.disable())`

5. **Check SecurityContext**
   - Should only be set once per request
   - Look for log: `✅ SecurityContext updated`
   - Should NOT be overwritten by later filters

---

## 🚀 Quick Restart

If logs become confusing, clean restart:

```bash
# Stop all services (Ctrl+C in each terminal)

# Clear logs
del c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\*.log

# Rebuild
cd c:\Users\SHAHID\OneDrive\Desktop\Project\microservices
mvn clean install

# Restart in order:
# 1. Eureka
# 2. Auth Service
# 3. Admin Catalogue Service
```

---

## 📝 Core Rules (Don't Break These!)

1. ✅ **JWT services are STATELESS** → SessionCreationPolicy.STATELESS
2. ✅ **Anonymous auth DISABLED** → .anonymous(anon -> anon.disable())
3. ✅ **JWT filter runs FIRST** → .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
4. ✅ **SecurityContext set ONCE** → No overwriting by other filters
5. ✅ **ROLE includes ROLE_ prefix** → "ROLE_ADMIN" not "ADMIN"
6. ✅ **Secret IDENTICAL in both** → Even one char difference breaks silently

---

## 📞 Next Steps

After verifying all tests pass:

1. Check cart-orders-service if it also needs JWT filter
2. Verify payment-service is protected
3. Update frontend to handle 403 Forbidden responses
4. Consider rate limiting on auth endpoint
5. Consider token refresh strategy

