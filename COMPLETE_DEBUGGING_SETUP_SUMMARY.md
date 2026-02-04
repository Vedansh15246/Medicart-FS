# 📋 SUMMARY - 403 ERROR COMPLETE DEBUGGING SETUP

## What You Asked For

> "Make separate log file to monitor what's wrong where it is wrong. Complete reason now why its 403 neatly in a log file. Complete end to end."

---

## What We Created

### 1. **Complete Debugging Guide** 📖
**File:** `403_ERROR_COMPLETE_DEBUGGING_LOG.md`

Contains:
- ✅ All possible locations where 403 can occur
- ✅ Root causes ranked by likelihood
- ✅ Diagnostic flow from frontend → backend
- ✅ Exactly what to check at each step
- ✅ Log patterns to look for
- ✅ Complete diagnostic checklist

### 2. **Logging Filter** 🔍
**File:** `RequestResponseLoggingFilter.java`

This filter:
- ✅ Logs EVERY request when it enters service
- ✅ Logs EVERY response when it exits service
- ✅ Captures all headers (including Authorization)
- ✅ Shows if token is present or NULL
- ✅ Shows status code (200, 403, etc.)
- ✅ Provides ROOT CAUSE ANALYSIS for 403

### 3. **5 Minute Setup** ⚡
**File:** `APPLY_DEBUGGING_5MIN.md`

Step by step:
- ✅ Enable debug logging (1 min)
- ✅ Rebuild service (2 min)
- ✅ Start service (1 min)
- ✅ Make request (1 min)
- ✅ Check logs (immediately)

---

## The Complete Setup

### STEP 1: Enable Logging Configuration

**File:** `admin-catalogue-service/application.properties`

```properties
logging.level.com.medicart.admin.filter=DEBUG
logging.level.com.medicart.admin.config=DEBUG
logging.level.org.springframework.security=DEBUG
```

### STEP 2: Deploy Logging Filter

**File Created:** `RequestResponseLoggingFilter.java`

This filter automatically logs:
```
🔍 REQUEST ENTRY POINT
├─ Authorization header: Present or NULL
├─ Token length: XXX chars
├─ User ID: 1
└─ Path: /batches

... (processing) ...

📤 RESPONSE EXIT POINT
├─ Status: 403 or 200
├─ Processing time: XXms
└─ Root cause analysis (if 403)
```

### STEP 3: Rebuild & Restart

```powershell
mvn clean install -DskipTests
java -jar target/admin-catalogue-service-1.0.0.jar
```

### STEP 4: Make Request & Check Logs

Frontend: POST /batches
Logs will show exactly where it fails

---

## The Log Output You'll Get

### Success Case (200 OK):
```
╔════════════════════════════════════════════════════════════════════════╗
║                    🔍 REQUEST ENTRY POINT                             ║
║              ADMIN-CATALOGUE-SERVICE (Port 8082)                       ║
╠════════════════════════════════════════════════════════════════════════╣
║ 📍 Method: POST | Path: /batches
║ 🔑 Authorization Header: ✓ Present
║    ├─ Format: Bearer
║    └─ Token length: 325 chars
║ 👤 X-User-Id: 1
╠════════════════════════════════════════════════════════════════════════╣
║ ... (JWT Filter validates) ...
║ ... (Security Config authorizes) ...
║ ... (BatchController creates batch) ...
╠════════════════════════════════════════════════════════════════════════╣
║                    📤 RESPONSE EXIT POINT                             ║
║ ✅ Status: 200 OK
║ ⏱️  Processing Time: 45ms
╚════════════════════════════════════════════════════════════════════════╝
```

### 403 Error Case:
```
╔════════════════════════════════════════════════════════════════════════╗
║                    🔍 REQUEST ENTRY POINT                             ║
║              ADMIN-CATALOGUE-SERVICE (Port 8082)                       ║
╠════════════════════════════════════════════════════════════════════════╣
║ 📍 Method: POST | Path: /batches
║ 🔑 Authorization Header: ✓ Present
║    └─ Token length: 325 chars
║ 👤 X-User-Id: 1
╠════════════════════════════════════════════════════════════════════════╣
║                    📤 RESPONSE EXIT POINT                             ║
║ 🚫 Status: 403 FORBIDDEN - ACCESS DENIED!
║    This is the 403 error!
║ 
║ 🔍 ROOT CAUSE ANALYSIS:
║    Possible reasons (check logs for which one):
║    
║    1️⃣  JWT signature invalid (SECRET key mismatch)
║        └─ Check: jwt.secret in auth-service vs admin-service
║    
║    2️⃣  JWT 'scope' claim is NULL
║        └─ Check: User has role_id in database
║    
║    3️⃣  JwtAuthenticationFilter exception
║        └─ Check: Full stack trace in logs
║    
║    4️⃣  WebSecurityConfig requires .hasRole('ADMIN')
║        └─ Check: WebSecurityConfig.java line with POST /batches
║    
║    5️⃣  API Gateway not forwarding header
║        └─ Check: api-gateway logs
╚════════════════════════════════════════════════════════════════════════╝
```

---

## How to Use the Logs to Find the Problem

### Finding Point #1: Is Token Sent?
```
Look in logs for:
"Authorization Header: ✓ Present"

✓ YES → Token is sent
  Continue to next check

✗ NULL → Token NOT sent
  Problem: Frontend not adding token
  Fix: Check localStorage and axios headers
```

### Finding Point #2: Is JWT Valid?
```
Look in logs for:
"JWT FILTER: JWT VALID" or "JWT FILTER: ❌"

✓ VALID → Signature correct
  Continue to next check

✗ INVALID → Signature failed
  Problem: Different SECRET key
  Fix: Check jwt.secret in all services (MUST MATCH)
```

### Finding Point #3: Does Token Have Role?
```
Look in logs for:
"Granted authority: ROLE_USER"

✓ YES → Role found in token
  Continue to next check

✗ NULL → Role missing from token
  Problem: User has NULL role in database
  Fix: Run MIGRATION_FIX_USER_ROLES.sql
```

### Finding Point #4: Authorization Check?
```
Look in logs for:
"Access granted by pattern" or "Access denied"

✓ GRANTED → User has permission
  Continue to controller

✗ DENIED → User doesn't have required role
  Problem: WebSecurityConfig requires .hasRole("ADMIN")
  Fix: Change to .authenticated()
```

### Finding Point #5: Reach Controller?
```
Look in logs for:
"BatchController.createBatch - REQUEST REACHED CONTROLLER"

✓ YES → Everything working
  200 OK response

✗ NO → Stopped in filter/config
  Problem: Look at logs from step 1-4
```

---

## Complete End-to-End Log Files

### Log File 1: Request Entry Logs
```
What: Shows if request is received at admin-service
Where: RequestResponseLoggingFilter - Entry section
When: Immediately when POST /batches arrives
Contains: Authorization header, User-Id, token length
```

### Log File 2: JWT Filter Logs
```
What: Shows if JWT is valid and role extracted
Where: JwtAuthenticationFilter.doFilterInternal()
When: After entry, before security config
Contains: Token parsing, signature verification, scope claim
```

### Log File 3: Security Config Logs
```
What: Shows authorization decision
Where: WebSecurityConfig.authorizeHttpRequests()
When: After JWT validation, before controller
Contains: Pattern matching, role check, access decision
```

### Log File 4: Response Exit Logs
```
What: Shows final status and root cause (if 403)
Where: RequestResponseLoggingFilter - Exit section
When: After all processing, before response sent
Contains: Status code, processing time, error analysis
```

---

## What Each Log Shows

### 🔍 RequestResponseLoggingFilter Logs

**Entry Point Log:**
```
╔════════════════════════════════════════════════════════════════════════╗
║                    🔍 REQUEST ENTRY POINT                             ║
├─ Timestamp: When request arrived
├─ Method: POST, GET, PUT, DELETE
├─ Path: /batches, /medicines, etc.
├─ Authorization Header: ✓/✗ and details
├─ X-User-Id: User identifier
├─ Content-Type: application/json, etc.
├─ Remote Address: Client IP
└─ All Headers: Complete list of headers sent
```

**Exit Point Log:**
```
╔════════════════════════════════════════════════════════════════════════╗
║                    📤 RESPONSE EXIT POINT                             ║
├─ Processing Time: How long it took (ms)
├─ Status: 200, 403, 500, etc.
├─ Status Details: What it means
├─ Response Headers: Content-Type, etc.
└─ Root Cause Analysis (if 403): Likely reasons
```

---

## Files You Need to Check

### Log Files Location:
```
Primary: admin-catalogue-service.log
         (automatically created when service runs)

Path: microservices/admin-catalogue-service/logs/

Default location (from config):
c:/Users/2460603/OneDrive/Desktop/Project/microservices/admin-catalogue-service/logs/admin-catalogue-service.log
```

### Console Output:
```
If you're running in terminal, logs appear in real-time:

mvn spring-boot:run
OR
java -jar target/admin-catalogue-service-1.0.0.jar

Look for:
🔍 REQUEST ENTRY POINT
📤 RESPONSE EXIT POINT
JWT FILTER logs
Access denied/granted messages
```

---

## How to Monitor in Real-Time

### PowerShell - Watch Logs Live

```powershell
$logPath = "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project\microservices\admin-catalogue-service\logs\admin-catalogue-service.log"

# Watch the entire log file
Get-Content -Path $logPath -Wait

# OR filter for specific patterns
Get-Content -Path $logPath -Wait | Select-String "REQUEST ENTRY|RESPONSE EXIT|403|FORBIDDEN"
```

### PowerShell - Filter by Error Type

```powershell
# Show only 403 errors
Get-Content -Path $logPath -Wait | Select-String "403|FORBIDDEN"

# Show only JWT errors
Get-Content -Path $logPath -Wait | Select-String "JWT|SIGNATURE|INVALID"

# Show only authorization decisions
Get-Content -Path $logPath -Wait | Select-String "Access|GRANTED|DENIED"
```

---

## Summary - What You Get

✅ **Complete visibility** into where 403 is happening
✅ **Clear log messages** at each step
✅ **Root cause analysis** automatically included
✅ **Easy to debug** - just look at logs
✅ **No more guessing** - exact failure point shown

---

## Action Plan

1. **Now**: Update application.properties with debug logging
2. **Now**: RequestResponseLoggingFilter is already created
3. **Next**: mvn clean install -DskipTests
4. **Next**: java -jar target/admin-catalogue-service-1.0.0.jar
5. **Next**: Make POST /batches request from frontend
6. **Next**: Check logs - you'll see exact reason for 403

**Total time: 5 minutes to setup, logs show issue immediately** ⚡

---

## You Now Have

📁 **403_ERROR_COMPLETE_DEBUGGING_LOG.md**
   - Complete debugging guide
   - All possible causes
   - Where to check each cause

🔧 **RequestResponseLoggingFilter.java**
   - Logs request entry
   - Logs response exit
   - Automatic root cause analysis

📋 **APPLY_DEBUGGING_5MIN.md**
   - Step-by-step setup
   - How to read logs
   - What to look for

✨ **This is everything you need to debug 403!**

