# 🔍 VISUAL LOGGING REFERENCE GUIDE

## Request Flow with Logging Points

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT REQUEST: POST /medicines with Authorization: Bearer ...  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
       ═══════════════════════════════════════════════════
       📍 [JWT FILTER] START
       METHOD: POST | URI: /medicines
       ═══════════════════════════════════════════════════
                       │
       ┌───────────────┴───────────────┐
       │                               │
       ▼ (Has Authorization Header)    ▼ (No Header)
       │                               │
       ✂️ Extracting token             ⚠️  Authorization: NULL
       📝 Token length: 234            ✅ Allow (public endpoint)
       │                               │
       ▼                               │
       🔓 Parsing JWT                  │
       ┌──────────────┬────────────────┘
       │              │
       ▼ (Success)    ▼ (Failure)
       │              │
       ✅ Verified    ❌ EXCEPTION
       ✨ Extract     Exception type:
       Claims:       MalformedJwtException
       • email       Clear SecurityContext
       • role
       │
       ▼
       🔐 Create Auth Token
       🔐 Set SecurityContext
       ✅ POPULATED
       │
       ▼ (Pass to next filter)
       
[Spring Security TRACE logs from FilterChainProxy & AuthorizationFilter]
       ├─ Filter: JwtAuthenticationFilter
       ├─ Filter: UsernamePasswordAuthenticationFilter (skipped)
       ├─ Filter: AuthorizationFilter
       │  ├─ Checking: /medicines
       │  ├─ Matching against: POST /medicines → hasRole('ADMIN')
       │  └─ Result: GRANT (has ROLE_ADMIN) or DENY (missing role)
       │
       ▼

       🔶 [POST /medicines] REQUEST RECEIVED
       
       ════════════════════════════════════════════════════════
       🎯 [MedicineController.createMedicine]
          SECURITY CONTEXT CHECK
          
          ✅ Authentication: EXISTS
          Principal: admin@medicart.com
          Authorities: [ROLE_ADMIN]
          Authenticated: true
       ════════════════════════════════════════════════════════
       
       ✅ [POST /medicines] RESPONSE SENT: ID=1
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│ RESPONSE: 200 OK (with created medicine)                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Log Levels Visual

```
TRACE (Maximum Detail) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ org.springframework.security.web.FilterChainProxy
│  └─ [TRACE] /medicines at position 1 of 12 in filter chain
│  └─ [TRACE] firing Filter: 'JwtAuthenticationFilter'
│  └─ [TRACE] /medicines at position 2 of 12 in filter chain
│  └─ [TRACE] firing Filter: 'AuthorizationFilter'
│
├─ org.springframework.security.authorization.AuthorizationFilter
│  └─ [TRACE] Checking match of request to /medicines
│  └─ [TRACE] Authorization granted
│
└─ org.springframework.web.servlet.mvc.method.annotation
   └─ [TRACE] Mapped to MedicineController#createMedicine

DEBUG (Moderate Detail) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ com.medicart.admin.config.JwtAuthenticationFilter
│  └─ [DEBUG] 📍 [JWT FILTER] START
│  └─ [DEBUG] 🔓 [JWT FILTER] Parsing JWT with secret key
│  └─ [DEBUG] ✅ [JWT FILTER] JWT SIGNATURE VERIFIED
│
├─ com.medicart.admin.controller.MedicineController
│  └─ [DEBUG] 🔶 [POST /medicines] REQUEST RECEIVED
│  └─ [DEBUG] ✅ Authentication: EXISTS
│
└─ org.springframework.security.config.WebSecurityConfig
   └─ [DEBUG] 🛡️ Initializing SecurityFilterChain

INFO (Basic) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ com.medicart.admin.AdminCatalogueServiceApplication
│  └─ [INFO] Starting AdminCatalogueServiceApplication
│
└─ org.springframework.boot.StartupInfoLogger
   └─ [INFO] Application started in 5.234 seconds

WARN (Issues) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ com.medicart.admin.config.JwtAuthenticationFilter
│  └─ [WARN] ⚠️  Authorization header is NULL

ERROR (Failures) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ com.medicart.admin.config.JwtAuthenticationFilter
│  └─ [ERROR] ❌ JWT validation failed
│  └─ [ERROR] Exception type: io.jsonwebtoken.MalformedJwtException

```

---

## Color-Coded Request Types

```
🔷 Blue   = GET (Read, typically public)
   [GET /medicines] REQUEST RECEIVED
   [GET /medicines/{id}] REQUEST RECEIVED

🔶 Orange = POST (Create, typically requires ADMIN)
   [POST /medicines] REQUEST RECEIVED
   [POST /medicines] REQUEST RECEIVED

🟡 Yellow = PUT (Update, typically requires ADMIN)
   [PUT /medicines/{id}] REQUEST RECEIVED

🔴 Red   = DELETE (Delete, typically requires ADMIN)
   [DELETE /medicines/{id}] REQUEST RECEIVED

🟢 Green = Health/Status (Always public)
   [GET /health] REQUEST RECEIVED
```

---

## SecurityContext State Visual

```
┌──────────────────────────────────────────────────────────────┐
│ SCENARIO 1: Public GET (No Token)                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BEFORE JWT FILTER:    AFTER JWT FILTER:   IN CONTROLLER:   │
│  ┌──────────────┐      ┌──────────────┐    ┌──────────────┐ │
│  │ SecurityCtx  │      │ SecurityCtx  │    │ SecurityCtx  │ │
│  ├──────────────┤      ├──────────────┤    ├──────────────┤ │
│  │ Auth: NULL   │      │ Auth: NULL   │    │ Auth: NULL   │ │
│  │              │      │              │    │              │ │
│  │ Result:      │      │ Result:      │    │ Result:      │ │
│  │ ✅ permitAll │      │ ✅ permitAll │    │ ✅ 200 OK    │ │
│  └──────────────┘      └──────────────┘    └──────────────┘ │
│                                                               │
│  LOGS:                                                        │
│  ⚠️  Authorization header is NULL                           │
│  → Passing request to next filter WITHOUT authentication     │
│  ❌ Authentication: NULL                                    │
│  ✅ Request allowed (permitAll)                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SCENARIO 2: Admin POST (Valid Token)                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BEFORE JWT:         AFTER JWT:          IN CONTROLLER:      │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐    │
│  │ SecurityCtx  │    │ SecurityCtx  │   │ SecurityCtx  │    │
│  ├──────────────┤    ├──────────────┤   ├──────────────┤    │
│  │ Auth: NULL   │    │ Auth:        │   │ Auth:        │    │
│  │              │    │ UsernamePass │   │ UsernamePass │    │
│  │              │    │ Principal:   │   │ Principal:   │    │
│  │              │    │ admin@...    │   │ admin@...    │    │
│  │              │    │ Authorities: │   │ Authorities: │    │
│  │              │    │ [ROLE_ADMIN] │   │ [ROLE_ADMIN] │    │
│  │ Result:      │    │ Result:      │   │ Result:      │    │
│  │ N/A (no auth)│    │ ✅ Verified  │   │ ✅ 200 OK    │    │
│  └──────────────┘    └──────────────┘   └──────────────┘    │
│                                                               │
│  LOGS:                                                        │
│  ✂️  Extracting token                                       │
│  ✅ JWT SIGNATURE VERIFIED                                  │
│  👤 sub: admin@medicart.com                                 │
│  🎭 scope: ROLE_ADMIN                                       │
│  ✅ SecurityContext POPULATED                               │
│  ✅ Authentication: EXISTS                                  │
│  ✅ Authorities: [ROLE_ADMIN]                               │
│  ✅ hasRole('ADMIN') passed                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SCENARIO 3: Admin POST (Invalid Token)                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BEFORE JWT:         AFTER JWT FAIL:      IN CONTROLLER:     │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐    │
│  │ SecurityCtx  │    │ SecurityCtx  │   │ SecurityCtx  │    │
│  ├──────────────┤    ├──────────────┤   ├──────────────┤    │
│  │ Auth: NULL   │    │ Auth: NULL   │   │ Auth: NULL   │    │
│  │              │    │ (CLEARED)    │   │              │    │
│  │              │    │              │   │              │    │
│  │              │    │              │   │              │    │
│  │              │    │              │   │              │    │
│  │              │    │              │   │              │    │
│  │ Result:      │    │ Result:      │   │ Result:      │    │
│  │ N/A (no auth)│    │ ❌ Exception │   │ ❌ 403       │    │
│  └──────────────┘    └──────────────┘   └──────────────┘    │
│                                                               │
│  LOGS:                                                        │
│  ✂️  Extracting token                                       │
│  ❌ EXCEPTION DURING JWT PARSING                            │
│  Exception type: MalformedJwtException                       │
│  ⚠️  Clearing SecurityContext due to exception              │
│  ❌ Authentication: NULL                                    │
│  ❌ Access Denied: anonymous user cannot access             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 403 Forbidden Root Cause Flowchart

```
                    Request for POST /medicines
                            │
                            ▼
               ┌─────────────────────────────┐
               │ Is Authorization header set?│
               └────────┬────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
          NO                        YES
           │                         │
           ▼                         ▼
      ⚠️  No Token        Is Bearer format?
         Logs:                  │
      "NULL"           ┌────────┴──────┐
           │          NO              YES
           │           │                │
           │           ▼                ▼
           │      ⚠️  Wrong        ✂️  Extract
           │      Format           Token
           │         Logs:         │
           │      "not Bearer"     ▼
           │           │       🔓 Parse JWT
           │           │       ┌─────┴─────┐
           │           │      FAIL        SUCCESS
           │           │       │           │
           │           │       ▼           ▼
           │           │    ❌ Exception  ✨ Extract
           │           │    Clear Ctx    Claims
           │           │       │         │
           └───────────┼───────┴──┬──────┘
                       │          │
                       ▼          ▼
              🔐 No Auth in    🔐 Auth Set
              SecurityContext  to ROLE_X
                       │          │
                       └──────┬───┘
                              │
                              ▼
                    Is POST /medicines?
                  (hasRole('ADMIN') required)
                              │
                ┌─────────────┴─────────────┐
                │                           │
               NO                          YES
                │                           │
           ✅  Allow              Check: Is ROLE_ADMIN?
               (permitAll)                  │
                              ┌─────────────┴─────────────┐
                              │                           │
                           NO                            YES
                            │                             │
                            ▼                             ▼
                    ❌ 403 Forbidden             ✅ 200 OK
                   "Missing ROLE_ADMIN"        "Request allowed"
                   (has: ROLE_USER)             (Processing...")
```

---

## Log Message Quick Reference

| Icon | Meaning | Next Step |
|------|---------|-----------|
| 📍 | Filter start | Should appear for every request |
| 🔍 | Checking header | Looking for Authorization header |
| 📋 | Header value | Shows what header contains (NULL or Bearer...) |
| ⚠️ | Warning | Missing data or unexpected format |
| ✂️ | Extracting | Pulling token from header |
| 📝 | Details | Token length, first chars |
| 🔓 | Parsing | Reading JWT signature |
| ✅ | Success | Operation completed successfully |
| ❌ | Failure | Operation failed, check details |
| 👤 | Email | User identifier from token |
| 🎭 | Role | User's role from token |
| 🕐 | Issued at | Token creation time |
| ⏱️ | Expiry | Token expiration time |
| 🔐 | Security | SecurityContext operation |
| 🔷 | GET request | Read operation (usually public) |
| 🔶 | POST request | Create operation (usually needs auth) |
| 🔴 | DELETE | Delete operation (usually needs auth) |
| 🎯 | Controller check | Security context at controller |

---

## Debugging Decision Tree

```
START HERE: You got a 403 error

Q1: Is "📍 [JWT FILTER] START" in logs?
├─ NO:  Filter not running → Check WebSecurityConfig registration
└─ YES: Go to Q2

Q2: Is "Authorization header" present?
├─ NULL:  No token sent → Add -H "Authorization: Bearer $TOKEN"
├─ Wrong: Not Bearer format → Use "Bearer <token>" format
└─ OK:    Go to Q3

Q3: Is "✅ JWT SIGNATURE VERIFIED"?
├─ NO:    Exception shown → Check JWT validity, secret match
└─ YES:   Go to Q4

Q4: Are claims correct?
├─ NO role: "JWT has NO 'scope' claim" → Check auth-service JwtService
├─ Wrong role: "scope: USER" not "ROLE_ADMIN" → Check user role
└─ OK:    Go to Q5

Q5: Is "✅ SecurityContext POPULATED"?
├─ NO:    Security context cleared → JWT parsing failed
└─ YES:   Go to Q6

Q6: Does request reach controller?
├─ NO:    "🔶 [POST...]" missing → Denied by Spring Security
└─ YES:   Go to Q7

Q7: What authentication in controller?
├─ NULL:   "❌ Authentication: NULL" → SecurityContext not set
├─ WRONG:  "Authorities: [ROLE_USER]" → Not authorized for this endpoint
└─ OK:     "✅ Authorities: [ROLE_ADMIN]" → Should have 200 OK

→ Root cause identified! Check specific fix in docs
```

---

## Complete Log Example - Success Case

```
════════════════════════════════════════════════════════════════════════════
REQUEST ARRIVES
POST /medicines with Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
════════════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /medicines
Remote Address: 127.0.0.1
═══════════════════════════════════════════════════════════════════════════

🔍 [JWT FILTER] Reading Authorization header
📋 Header value: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4i...

✂️  [JWT FILTER] Extracting token from header (substring 7)
📝 Token length: 234 characters
🔑 Token first 50 chars: eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4i...

🔓 [JWT FILTER] Parsing JWT with secret key
   Secret length: 57 characters

✅ [JWT FILTER] JWT SIGNATURE VERIFIED SUCCESSFULLY

════════════════════════════════════════════════════════════════════════════
✨ [JWT FILTER] JWT CLAIMS EXTRACTED:
   👤 sub (email):     admin@medicart.com
   🎭 scope (role):    ROLE_ADMIN
   🕐 iat (issued):    Sun Feb 01 2026 14:05:00 IST
   ⏱️  exp (expiry):    Sun Feb 01 2026 15:05:00 IST
════════════════════════════════════════════════════════════════════════════

🔐 [JWT FILTER] Creating authentication token
   Principal (email): admin@medicart.com
   Granted authority: ROLE_ADMIN

🔐 [JWT FILTER] Setting SecurityContext with authentication
   Before: NULL auth=null
   After: auth=UsernamePasswordAuthenticationToken [Principal=admin@medicart.com, Credentials=[PROTECTED], Authenticated=true, Details=null, Granted Authorities=[ROLE_ADMIN]]

✅ [JWT FILTER] SecurityContext UPDATED
════════════════════════════════════════════════════════════════════════════

→ [JWT FILTER] Passing request to next filter in chain

[SPRING SECURITY TRACE LOGS]
[TRACE FilterChainProxy] /medicines at position 1 of 12
[TRACE FilterChainProxy] firing Filter: 'JwtAuthenticationFilter'
[TRACE AuthorizationFilter] Checking match of request to /medicines
[TRACE AuthorizationFilter] Authorization granted (user has ROLE_ADMIN)

═══════════════════════════════════════════════════════════════════════════
🔶 [POST /medicines] REQUEST RECEIVED
   Body: MedicineDTO(...)

════════════════════════════════════════════════════════════════════════════
🎯 [MedicineController.createMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Principal: admin@medicart.com
   Authorities: [ROLE_ADMIN]
   Authenticated: true
════════════════════════════════════════════════════════════════════════════

✅ [POST /medicines] RESPONSE SENT: 1

═══════════════════════════════════════════════════════════════════════════
RESPONSE SENT
HTTP 200 OK
{
  "id": 1,
  "name": "Paracetamol",
  ...
}
═══════════════════════════════════════════════════════════════════════════
```

---

**This visual guide shows EVERYTHING you'll see in logs!**
Use it with [TESTING_WITH_LOGS_COMMANDS.md](TESTING_WITH_LOGS_COMMANDS.md) to understand actual log output! 📊

