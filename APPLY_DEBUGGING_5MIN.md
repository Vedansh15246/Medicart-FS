# ⚡ APPLY DEBUGGING - 5 MINUTES

## What We Created

1. **Debugging Log Guide** - Where to check for 403
2. **RequestResponseLoggingFilter** - Logs all requests/responses
3. **Action Plan** - Step by step to find the issue

---

## DO THIS NOW (5 minutes to setup, get logs immediately)

### STEP 1: Enable Debug Logging in Config (1 minute)

**File:** `admin-catalogue-service/application.properties`

Add these lines at the end:

```properties
# ════════════════════════════════════════════════════════════════
# 🔍 DEBUG LOGGING FOR 403 ERROR INVESTIGATION
# ════════════════════════════════════════════════════════════════

# JWT Filter debugging
logging.level.com.medicart.admin.filter=DEBUG
logging.level.com.medicart.admin.config=DEBUG
logging.level.com.medicart.admin.config.JwtAuthenticationFilter=DEBUG

# Spring Security debugging
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.security.web=DEBUG
logging.level.org.springframework.security.web.authentication=DEBUG

# Request/Response logging
logging.level.org.springframework.web.servlet.mvc.method.annotation=DEBUG

# API Gateway debugging
logging.level.org.springframework.cloud.gateway=DEBUG
```

---

### STEP 2: Rebuild Service (2 minutes)

```powershell
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service"

# Clean and rebuild
mvn clean install -DskipTests

# Wait for "BUILD SUCCESS" message...
```

---

### STEP 3: Start Service (1 minute)

```powershell
# Start the service
java -jar target/admin-catalogue-service-1.0.0.jar

# You should see:
# ✅ Started AdminCatalogueServiceApplication
```

---

### STEP 4: Make Request (1 minute)

In frontend:
1. Try to create a batch
2. You'll get 403 error

---

### STEP 5: Check Logs Immediately

The logs will show:

```
╔════════════════════════════════════════════════════════════════════════╗
║                    🔍 REQUEST ENTRY POINT                             ║
║              ADMIN-CATALOGUE-SERVICE (Port 8082)                       ║
╠════════════════════════════════════════════════════════════════════════╣
║ ⏰ Timestamp: ...
║ 📍 Method: POST | Path: /batches
║ 🔑 Authorization Header:
║    ✓ Present
║    ├─ Format: Bearer
║    ├─ Token length: XXX chars
║    └─ First 40 chars: eyJhbGciOiJIUzM4NCJ9...
╚════════════════════════════════════════════════════════════════════════╝

... (filter chain processes request) ...

╔════════════════════════════════════════════════════════════════════════╗
║                    📤 RESPONSE EXIT POINT                             ║
╠════════════════════════════════════════════════════════════════════════╣
║ 🚫 Status: 403 FORBIDDEN - ACCESS DENIED!
║    This is the 403 error!
║    User-Id: 1
║    Path: /batches
║
║ 🔍 403 ERROR ROOT CAUSE ANALYSIS
║    Possible reasons:
║    1️⃣  JWT signature invalid (SECRET key mismatch)
║    2️⃣  JWT 'scope' claim is NULL
║    3️⃣  JwtAuthenticationFilter not setting SecurityContext
║    4️⃣  WebSecurityConfig requires .hasRole('ADMIN')
║    5️⃣  API Gateway not forwarding Authorization header
╚════════════════════════════════════════════════════════════════════════╝
```

---

## What to Look For in Logs

### Log Location 1: Authorization Header Received?
```
Look for:
✓ "Authorization Header: ✓ Present"
  → Token IS being sent from frontend ✓

❌ "Authorization Header: ❌ NULL"
  → Token NOT being sent from frontend ❌
  → Check: localStorage.getItem('accessToken')
```

### Log Location 2: JWT Valid?
```
Look for:
✓ "[JWT FILTER] JWT VALID"
  → Token signature is correct ✓

❌ "[JWT FILTER] JWT SIGNATURE VERIFICATION FAILED"
  → SECRET key mismatch ❌
  → Solution: Check jwt.secret in all services
```

### Log Location 3: Role Present?
```
Look for:
✓ "Granted authority: ROLE_USER"
  → Role is in token ✓

❌ "Granted authority: null"
  → Role is NULL in database ❌
  → Solution: Run SQL migration
```

### Log Location 4: Authorization Check?
```
Look for:
✓ "Access granted to pattern"
  → User has permission ✓

❌ "Access denied by rule"
  → User doesn't have required role ❌
  → Solution: Change .hasRole to .authenticated()
```

---

## COMPLETE FLOW IN LOGS

When you make a request, you should see:

1. **REQUEST ENTRY:**
   ```
   🔍 REQUEST ENTRY POINT
   POST /batches
   Authorization Header: ✓ Present
   ```

2. **JWT FILTER:**
   ```
   JWT FILTER PROCESSING
   ├─ Token received: ✓
   ├─ Signature valid: ✓
   ├─ Scope claim: ROLE_USER
   └─ Authority created: ✓
   ```

3. **SECURITY CONFIG:**
   ```
   WebSecurityConfig
   ├─ Pattern matches: ✓
   ├─ Authorization check: ✓
   └─ Access: GRANTED
   ```

4. **CONTROLLER:**
   ```
   BatchController.createBatch
   ├─ Request received: ✓
   ├─ SecurityContext available: ✓
   └─ Batch created: ✓
   ```

5. **RESPONSE EXIT:**
   ```
   📤 RESPONSE EXIT POINT
   Status: 200 OK ✅
   ```

---

## If You STILL Get 403

The logs will pinpoint exactly where it fails:

**If logs show:**
```
Authorization Header: ❌ NULL
```
→ Token not sent from frontend
→ Check: batchApi.js and catalogService.js

**If logs show:**
```
JWT SIGNATURE VERIFICATION FAILED
```
→ Secret key mismatch
→ Check: jwt.secret in all 3 services

**If logs show:**
```
Granted authority: null
```
→ Role is NULL in database
→ Solution: Run SQL migration

**If logs show:**
```
Access denied by rule .hasRole('ADMIN')
```
→ Config requires ADMIN role
→ Solution: Change to .authenticated()

**If logs show:**
```
Request doesn't reach controller
```
→ Stopped in filter or security config
→ Check full logs for exception

---

## Real-Time Log Monitoring

### PowerShell - Watch Logs in Real Time

```powershell
$logFile = "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log"

# Watch for 403 errors specifically
Get-Content -Path $logFile -Wait | Select-String "403|FORBIDDEN|REQUEST ENTRY|RESPONSE EXIT"
```

### PowerShell - Filter by keyword

```powershell
# Show only JWT filter logs
Get-Content -Path $logFile -Wait | Select-String "JWT FILTER"

# Show only 403 errors
Get-Content -Path $logFile -Wait | Select-String "FORBIDDEN"

# Show authorization decisions
Get-Content -Path $logFile -Wait | Select-String "Access granted|Access denied|GRANTED|DENIED"
```

---

## Sample Output - Success Case

When it works (200 OK):
```
═══════════════════════════════════════════════════════════════════════
🔍 REQUEST ENTRY POINT
POST /batches
Authorization Header: ✓ Present
Token: eyJhbGciOiJIUzM4NCJ9...
═══════════════════════════════════════════════════════════════════════

JWT FILTER:
├─ Token extracted: ✓
├─ Signature verified: ✓
├─ Scope: ROLE_USER
└─ Authority created: ✓

WebSecurityConfig:
├─ Pattern matched: POST /batches/** ✓
├─ Rule: .authenticated()
├─ User authenticated: ✓
└─ Access: GRANTED ✓

═══════════════════════════════════════════════════════════════════════
📤 RESPONSE EXIT POINT
Status: 200 OK ✅
Processing time: 45ms
═══════════════════════════════════════════════════════════════════════
```

---

## Sample Output - 403 Error Case

When it fails (403):
```
═══════════════════════════════════════════════════════════════════════
🔍 REQUEST ENTRY POINT
POST /batches
Authorization Header: ✓ Present
Token: eyJhbGciOiJIUzM4NCJ9...
═══════════════════════════════════════════════════════════════════════

JWT FILTER:
├─ Token extracted: ✓
├─ Signature: ❌ INVALID
└─ SecurityContext: CLEARED

═══════════════════════════════════════════════════════════════════════
📤 RESPONSE EXIT POINT
Status: 403 FORBIDDEN ❌
REASON: JWT signature verification failed
CAUSE: Different SECRET key
═══════════════════════════════════════════════════════════════════════
```

---

## Next Steps After Getting Logs

1. **Collect complete log output** from the 403 request
2. **Identify which step failed** (header, JWT, authority, config)
3. **Share log excerpt** with the root cause message
4. **Apply appropriate fix** based on the exact failure

---

## Summary

✅ **5 minute setup** to get complete 403 debugging
✅ **Clear log output** showing exactly where it fails
✅ **Actionable diagnostics** to fix the issue
✅ **Real-time monitoring** to verify fixes

**You'll know EXACTLY why 403 is happening!** 🎯

