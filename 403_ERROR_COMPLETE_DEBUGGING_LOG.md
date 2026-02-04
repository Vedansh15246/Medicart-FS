# 🔍 403 ERROR DEBUGGING LOG
# ====================================================================
# Purpose: Track complete end-to-end flow to identify 403 error root cause
# Date: 2026-02-03
# Error: POST /batches returning 403 Forbidden
# ====================================================================

## CRITICAL INFORMATION FROM ERROR

```
Request Details:
├─ Method: POST
├─ URL: /batches
├─ Authorization Header: Bearer eyJhbGciOiJIUzM4NCJ9...
├─ X-User-Id: 1
├─ Content-Type: application/json
└─ Status: 403 Forbidden ❌

Headers Present:
├─ ✅ Accept: 'application/json, text/plain, */*'
├─ ✅ Content-Type: 'application/json'
├─ ✅ Authorization: 'Bearer eyJ...'  (Token present)
├─ ✅ X-User-Id: '1'
└─ ❌ Response: 403 Forbidden

Token Information:
├─ Algorithm: HS384
├─ Token starts with: eyJhbGciOiJIUzM4NCJ9
├─ Token is PRESENT in request ✅
├─ Token is SENT to backend ✅
└─ Backend received token but returned 403 ❌
```

---

## DIAGNOSTIC FLOW - Where to Check

```
REQUEST FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POINT 1: Frontend (axios request)
├─ File: frontend/src/api/catalogService.js or batchApi.js
├─ What to check:
│  ├─ Is token being added to request? ✓
│  ├─ Is Authorization header being set? ✓
│  ├─ Is X-User-Id header being added? ✓
│  └─ Is Content-Type correct? ✓
└─ Log to add: "Frontend → Sending request with token and headers"

                            ↓

POINT 2: API Gateway (Port 8080)
├─ File: api-gateway/src/main/java/com/medicart/gateway/config/
├─ What happens:
│  ├─ Route matches? /batches → Yes
│  ├─ Forward to admin-catalogue:8082? Yes
│  ├─ Copy headers including Authorization? Check!
│  └─ Is X-User-Id preserved? Check!
└─ Log to add: "API Gateway → Routing /batches to admin-catalogue-service"

                            ↓

POINT 3: Admin-Catalogue Service (Port 8082)
├─ File: admin-catalogue-service/src/main/java/com/medicart/admin/
├─ Filter Chain:
│  ├─ JwtAuthenticationFilter.doFilterInternal()
│  │  ├─ Does it receive Authorization header? Check!
│  │  ├─ Does it extract token correctly? Check!
│  │  ├─ Does it validate JWT signature? Check!
│  │  ├─ Does it extract "scope" claim? Check!
│  │  ├─ Does it set SecurityContext? Check!
│  │  └─ Any exceptions thrown? Check!
│  │
│  ├─ WebSecurityConfig.authorizeHttpRequests()
│  │  ├─ Does request match pattern "POST" "/batches/**"? Check!
│  │  ├─ What's the requirement? .authenticated() or .hasRole()? Check!
│  │  ├─ Is user authenticated? Check!
│  │  ├─ Is authority sufficient? Check!
│  │  └─ If not: 403 Forbidden ❌
│  │
│  └─ BatchController
│     ├─ Does request reach controller? Check!
│     ├─ Is SecurityContext available? Check!
│     └─ Can access user information? Check!
│
└─ Log files to check:
   ├─ admin-catalogue-service.log (app logs)
   ├─ Spring Security logs
   └─ JWT filter logs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## MOST LIKELY CAUSES (In Order)

### CAUSE #1: JWT Filter Not Finding Authorization Header

**Symptom:** Token is sent but filter doesn't see it

```
Log to look for:
└─ "[JWT FILTER] Authorization header is NULL"
   OR
   "[JWT FILTER] Header does NOT start with 'Bearer '"
```

**Why it happens:**
- API Gateway not forwarding Authorization header
- API Gateway stripping headers
- Request path not matching

**Check:**
```java
File: admin-catalogue-service/JwtAuthenticationFilter.java
Line: String header = request.getHeader(HttpHeaders.AUTHORIZATION);

If header == null:
  → API Gateway didn't forward it ❌
  → Check: api-gateway SecurityConfig
```

---

### CAUSE #2: JWT Token Signature Invalid

**Symptom:** Token received but signature doesn't match

```
Log to look for:
└─ "[JWT FILTER] JWT SIGNATURE VERIFICATION FAILED"
   OR
   "[JWT FILTER] EXCEPTION DURING JWT PARSING"
```

**Why it happens:**
- Different SECRET key in API Gateway vs Admin Service
- Different SECRET key in Auth Service vs Admin Service
- Token tampered or modified in transit

**Check:**
```properties
File 1: auth-service/application.properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart

File 2: admin-catalogue-service/application.properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart

File 3: api-gateway/application.properties
jwt.secret=your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart

MUST BE IDENTICAL! ✅
```

---

### CAUSE #3: JWT Token Missing "scope" Claim

**Symptom:** Token valid but "scope" claim is NULL

```
Log to look for:
└─ "[JWT FILTER] JWT has NO 'scope' claim!"
   OR
   "[JWT FILTER] Granted authority: null"
```

**Why it happens:**
- User has NULL role in database (Issue we fixed!)
- JwtService.generateToken() failed
- Token from before migration

**Check:**
```sql
SELECT u.id, u.email, u.role_id, r.name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.id = 1;

If role_id = NULL:
  → User has no role ❌
  → Need SQL migration
```

---

### CAUSE #4: WebSecurityConfig Not Allowing Request

**Symptom:** All previous checks pass but still 403

```
Log to look for:
└─ "[WebSecurityConfig] POST /batches/** → .hasRole('ADMIN')"
   OR
   "[WebSecurityConfig] Access Denied for user with authority: ROLE_CUSTOMER"
```

**Why it happens:**
- Config requires .hasRole("ADMIN")
- But user has ROLE_CUSTOMER or ROLE_USER
- Config wasn't updated to use .authenticated()

**Check:**
```java
File: admin-catalogue-service/WebSecurityConfig.java
Line: .requestMatchers("POST", "/batches/**").hasRole("ADMIN")
      OR
      .requestMatchers("POST", "/batches/**").authenticated()

If .hasRole("ADMIN"):
  → User must be ADMIN ❌
  → Change to .authenticated() ✅
```

---

### CAUSE #5: Authentication Object Not Set in SecurityContext

**Symptom:** All validation passes but SecurityContext empty

```
Log to look for:
└─ "[WebSecurityConfig] Authentication is NULL"
   OR
   "[BatchController] SecurityContext has no authentication"
```

**Why it happens:**
- JwtAuthenticationFilter not setting SecurityContext
- Exception cleared SecurityContext
- Filter chain order wrong

**Check:**
```java
File: admin-catalogue-service/JwtAuthenticationFilter.java
Line: SecurityContextHolder.getContext().setAuthentication(auth);

If this line not reached:
  → Check exception in try-catch block
  → Check if auth == null
```

---

## LOGGING SETUP - Add This To Each Service

### 1. Frontend Logging (catalogService.js)

```javascript
// Add this before making request
const token = localStorage.getItem('accessToken');
console.log('🚀 [FRONTEND] POST /batches request');
console.log('   ├─ Token present:', !!token);
console.log('   ├─ Token length:', token ? token.length : 0);
console.log('   ├─ Token first 50 chars:', token ? token.substring(0, 50) + '...' : 'NULL');
console.log('   ├─ X-User-Id:', localStorage.getItem('userId') || 'NOT SET');
console.log('   └─ Headers being sent:');
console.log('      ├─ Authorization: Bearer ' + (token ? token.substring(0, 30) + '...' : 'NULL'));
console.log('      ├─ Content-Type: application/json');
console.log('      └─ X-User-Id: ' + (localStorage.getItem('userId') || 'MISSING'));
```

### 2. API Gateway Logging (SecurityConfig.java)

Add to `api-gateway/src/main/java/com/medicart/gateway/config/SecurityConfig.java`:

```java
log.debug("═══════════════════════════════════════════════════════════════");
log.debug("📡 [API GATEWAY] REQUEST RECEIVED");
log.debug("═══════════════════════════════════════════════════════════════");
log.debug("📍 Method: {} | URI: {}", request.getMethod(), request.getRequestURI());
log.debug("🔑 Authorization header: {}", request.getHeader("Authorization") == null ? "NULL" : request.getHeader("Authorization").substring(0, 30) + "...");
log.debug("👤 X-User-Id: {}", request.getHeader("X-User-Id") == null ? "NULL" : request.getHeader("X-User-Id"));
log.debug("🔀 Routing to: admin-catalogue-service:8082");
log.debug("═══════════════════════════════════════════════════════════════");
```

### 3. Admin-Catalogue Service - JWT Filter (JwtAuthenticationFilter.java)

CRITICAL: Already has logging. Check if it's capturing the flow.

### 4. Admin-Catalogue Service - Security Config (WebSecurityConfig.java)

Add debug logging for authorization rules.

---

## HOW TO CAPTURE THE COMPLETE FLOW

### Step 1: Enable Debug Logging

**File:** `admin-catalogue-service/application.properties`

```properties
# Add these lines to see JWT filter logs
logging.level.com.medicart.admin.config=DEBUG
logging.level.com.medicart.admin.config.JwtAuthenticationFilter=DEBUG
logging.level.org.springframework.security.web=DEBUG
logging.level.org.springframework.security.authorization=DEBUG
```

### Step 2: Capture Request/Response

**File:** Create new file `admin-catalogue-service/src/main/java/com/medicart/admin/filter/RequestResponseLoggingFilter.java`

```java
package com.medicart.admin.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RequestResponseLoggingFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(RequestResponseLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        long startTime = System.currentTimeMillis();
        
        log.debug("╔════════════════════════════════════════════════════════════════╗");
        log.debug("║ 🔍 REQUEST ENTRY POINT - ADMIN-CATALOGUE-SERVICE (8082)        ║");
        log.debug("╠════════════════════════════════════════════════════════════════╣");
        log.debug("║ Method: {} | Path: {}", httpRequest.getMethod(), httpRequest.getRequestURI());
        log.debug("║ Authorization: {}", 
            httpRequest.getHeader("Authorization") == null ? "NULL ❌" : 
            "Present ✓ (" + httpRequest.getHeader("Authorization").substring(0, 30) + "...)");
        log.debug("║ X-User-Id: {}", httpRequest.getHeader("X-User-Id") == null ? "NULL" : httpRequest.getHeader("X-User-Id"));
        log.debug("╚════════════════════════════════════════════════════════════════╝");
        
        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            log.debug("╔════════════════════════════════════════════════════════════════╗");
            log.debug("║ 📤 RESPONSE - Time: {}ms | Status: {}", duration, httpResponse.getStatus());
            
            if (httpResponse.getStatus() == 403) {
                log.error("║ ❌ 403 FORBIDDEN DETECTED!");
                log.error("║ Path: {} | User: {}", 
                    httpRequest.getRequestURI(), 
                    httpRequest.getHeader("X-User-Id"));
            } else if (httpResponse.getStatus() == 200) {
                log.debug("║ ✅ 200 OK");
            }
            
            log.debug("╚════════════════════════════════════════════════════════════════╝");
        }
    }

    @Override
    public void init(FilterConfig config) throws ServletException {}

    @Override
    public void destroy() {}
}
```

### Step 3: Monitor Log File

```powershell
# PowerShell - Real-time log monitoring
$logFile = "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log"

Get-Content -Path $logFile -Wait | Select-String "403|FORBIDDEN|Authorization|JWT FILTER"
```

---

## COMPLETE DIAGNOSTIC CHECKLIST

Run through this systematically:

### ✅ Checklist Item 1: Frontend
- [ ] Token is created during login
- [ ] Token is stored in localStorage
- [ ] Token is added to Authorization header
- [ ] X-User-Id is added to headers
- [ ] Request is sent to /batches (not /api/batches)

**Log Command:**
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token ? token.substring(0, 50) + '...' : 'MISSING');
```

### ✅ Checklist Item 2: API Gateway
- [ ] Request reaches API Gateway on port 8080
- [ ] Authorization header is forwarded
- [ ] Route /batches matches a gateway route
- [ ] Request is forwarded to admin-catalogue:8082

**Check in logs:**
```
Look for: "📡 [API GATEWAY]"
```

### ✅ Checklist Item 3: JWT Filter
- [ ] Authorization header is received
- [ ] Token is extracted correctly
- [ ] JWT signature is verified
- [ ] Claims are extracted
- [ ] "scope" claim exists
- [ ] Authority is created
- [ ] SecurityContext is set

**Check in logs:**
```
Look for: "[JWT FILTER]"
         "[JWT FILTER] JWT VALID"
         OR
         "[JWT FILTER] ❌" (error)
```

### ✅ Checklist Item 4: Security Config
- [ ] Request matches pattern
- [ ] Authorization rule found
- [ ] User is authenticated
- [ ] Authority check passed
- [ ] Request allowed

**Check in logs:**
```
Look for: "[WebSecurityConfig]"
         Access allowed OR Access denied
```

### ✅ Checklist Item 5: Controller
- [ ] Request reaches BatchController
- [ ] SecurityContext is accessible
- [ ] User information extracted
- [ ] Batch created
- [ ] 200 OK response

**Check in logs:**
```
Look for: "[BatchController]"
         "Creating batch"
```

---

## REAL-TIME DEBUGGING - DO THIS NOW

### Step 1: Add This Log Line

In `BatchController.java`, first line of createBatch():

```java
@PostMapping
public ResponseEntity<BatchDTO> createBatch(@RequestBody BatchDTO dto) {
    log.info("╔════════════════════════════════════════════════════════════════╗");
    log.info("║ 🎯 [BatchController.createBatch] - REQUEST REACHED CONTROLLER! ║");
    log.info("╠════════════════════════════════════════════════════════════════╣");
    
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    
    log.info("║ Authorization present: {} | Principal: {}", 
        auth != null ? "✓ YES" : "✗ NO", 
        auth != null ? auth.getPrincipal() : "NULL");
    log.info("║ Authenticated: {} | Authorities: {}",
        auth != null ? auth.isAuthenticated() : "N/A",
        auth != null ? auth.getAuthorities() : "NONE");
    log.info("╚════════════════════════════════════════════════════════════════╝");
    
    // ... rest of code ...
}
```

### Step 2: Rebuild Service

```powershell
cd admin-catalogue-service
mvn clean install -DskipTests
java -jar target/admin-catalogue-service-1.0.0.jar
```

### Step 3: Make Request

```
POST /batches
Authorization: Bearer {token}
...
```

### Step 4: Check Log Output

```
Look for these patterns:

✅ SUCCESS:
"🎯 [BatchController.createBatch] - REQUEST REACHED CONTROLLER!"

❌ FAILURE (before controller):
No such log message → 403 happened in filter/config
```

---

## THE 403 ERROR LOCATIONS

```
Where 403 can be thrown:

1. 🚫 JwtAuthenticationFilter
   ├─ Header missing → Clear context → Maybe 403
   ├─ Signature invalid → Clear context → 403 ✓
   ├─ Token expired → Clear context → 403 ✓
   └─ Exception thrown → Clear context → 403 ✓

2. 🚫 WebSecurityConfig
   ├─ .hasRole("ADMIN") but user has ROLE_CUSTOMER → 403 ✓
   ├─ User not authenticated → 403 ✓
   └─ Authority doesn't match → 403 ✓

3. 🚫 API Gateway
   ├─ CORS misconfigured → 403 (client-side)
   ├─ Header not forwarded → No auth → 403 ✓
   └─ Path mismatch → Wrong route → 404 or 403
```

---

## CAPTURE COMPLETE FLOW IN ONE REQUEST

Add this comprehensive logging to JwtAuthenticationFilter:

```java
log.debug("╔═══════════════════════════════════════════════════════════════════════╗");
log.debug("║                   JWT FILTER - COMPLETE FLOW DEBUG                   ║");
log.debug("╠═══════════════════════════════════════════════════════════════════════╣");

// 1. Check header
String header = request.getHeader(HttpHeaders.AUTHORIZATION);
log.debug("║ 1️⃣  Authorization Header");
log.debug("║    ├─ Exists: {}", header != null ? "✓ YES" : "✗ NULL");
if (header != null) {
    log.debug("║    ├─ Format: {}", header.startsWith("Bearer ") ? "✓ Bearer format" : "✗ Wrong format");
    log.debug("║    └─ Token: {}...", header.substring(0, Math.min(50, header.length())));
}

// 2. Parse token
try {
    if (header == null || !header.startsWith("Bearer ")) {
        log.warn("║ 2️⃣  Token Parsing: ✗ SKIPPED (no header)");
        log.debug("╚═══════════════════════════════════════════════════════════════════════╝");
        filterChain.doFilter(request, response);
        return;
    }
    
    String token = header.substring(7);
    log.debug("║ 2️⃣  Token Parsing");
    log.debug("║    ├─ Token length: {} chars", token.length());
    
    // Parse JWT
    Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    
    log.debug("║    ├─ Signature: ✓ VERIFIED");
    
    // 3. Extract claims
    String email = claims.getSubject();
    String role = (String) claims.get("scope");
    
    log.debug("║ 3️⃣  Claims Extracted");
    log.debug("║    ├─ Email (sub): {}", email);
    log.debug("║    ├─ Role (scope): {}", role != null ? role : "✗ NULL!");
    
    // 4. Create authority
    if (role == null) {
        log.error("║ 4️⃣  Authority Creation: ✗ FAILED - role is NULL");
        log.error("║    └─ This will cause 403!");
        SecurityContextHolder.clearContext();
    } else {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
        log.debug("║ 4️⃣  Authority Creation");
        log.debug("║    ├─ Authority: {}", authority.getAuthority());
        
        // 5. Create auth object
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        email, null, List.of(authority));
        
        log.debug("║ 5️⃣  Authentication Object Created");
        log.debug("║    ├─ Principal: {}", auth.getPrincipal());
        log.debug("║    ├─ Authenticated: {}", auth.isAuthenticated());
        log.debug("║    ├─ Authorities: {}", auth.getAuthorities());
        
        // 6. Set in context
        SecurityContextHolder.getContext().setAuthentication(auth);
        log.debug("║ 6️⃣  SecurityContext Set");
        log.debug("║    └─ ✓ Ready for authorization check");
    }
    
} catch (Exception e) {
    log.error("║ ❌ EXCEPTION IN JWT FILTER");
    log.error("║    ├─ Exception: {}", e.getClass().getSimpleName());
    log.error("║    ├─ Message: {}", e.getMessage());
    log.error("║    └─ This will cause 403!");
    SecurityContextHolder.clearContext();
}

log.debug("╚═══════════════════════════════════════════════════════════════════════╝");
filterChain.doFilter(request, response);
```

---

## SUMMARY

To find out WHY you're getting 403:

1. ✅ **Check Frontend Console** - Is token being sent?
2. ✅ **Check Admin Service Logs** - Is Authorization header received?
3. ✅ **Check JWT Filter Logs** - Is token validated?
4. ✅ **Check Security Config Logs** - Is authorization granted?
5. ✅ **Check Controller Logs** - Does request reach controller?

The issue is at the FIRST step that fails.

---

## NEXT STEPS

1. Add comprehensive logging (above)
2. Rebuild admin-catalogue-service
3. Make POST /batches request
4. Check logs for failure point
5. Report findings with log excerpts

**Then we can pinpoint the exact cause!** 🎯

