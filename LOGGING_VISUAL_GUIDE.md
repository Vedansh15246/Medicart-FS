# 🎯 COMPREHENSIVE LOGGING - VISUAL GUIDE

## Before & After

### ❌ BEFORE: Blind Debugging

```
User: "Prescription upload is failing"
❓ Why?
  - No idea what's being sent
  - No idea what's being received
  - No idea why it's 403
  - Stuck guessing
```

### ✅ AFTER: Complete Visibility

```
User: "Prescription upload is failing"
✅ Check frontend logs:
   🌐 API REQUEST - POST /api/prescriptions
     Authorization: Bearer eyJ...
     X-User-Id: 1
   ❌ API ERROR - status 403

✅ Check backend logs:
   🔍 JWT Filter checking path: /prescriptions
   ❌ JWT VALIDATION FAILED: Signature verification failed

ROOT CAUSE FOUND: JWT secret key mismatch
```

---

## Data Flow With Logging

```
┌─────────────────────────────────────┐
│      BROWSER (Frontend)             │
│  - localStorage logs               │
│  - Console logs (real-time)       │
│                                    │
│  📦 ProductCard logs product data │
│  📤 Prescription logs file upload │
│  🌐 Client logs requests/responses │
└──────────────┬──────────────────────┘
               │
               │ POST /api/prescriptions
               │ + Authorization: Bearer ...
               │ + X-User-Id: 1
               │ + FormData: file=test.pdf
               ▼
┌──────────────────────────────────────┐
│    API Gateway (port 8080)          │
│    (Routes to auth-service)         │
└──────────────┬──────────────────────┘
               │
               │ POST /prescriptions
               ▼
┌──────────────────────────────────────┐
│   Auth Service (port 8081)          │
│                                      │
│  🔍 JwtAuthenticationFilter          │
│     ├─ 🔍 Checking path              │
│     ├─ 🔐 Validating JWT             │
│     └─ ✅/❌ Token valid/invalid     │
│                                      │
│  📋 PrescriptionController           │
│     ├─ 📤 POST request received      │
│     ├─ 📄 File: test.pdf, 1KB        │
│     └─ ✅ File uploaded               │
│                                      │
│  📁 logs/auth-service.log            │
│     (All details logged to file)     │
└──────────────────────────────────────┘
```

---

## What Gets Logged At Each Layer

### 🔵 Frontend Layer (Browser)

```
User Action: "Upload prescription"
  ↓
Logger captures:
  ├─ Component mounting
  ├─ File selection (name, size)
  ├─ Form submission
  ├─ Request data (method, URL, headers)
  ├─ Response status
  ├─ Response data size
  └─ Any errors (with full error object)

Result: localStorage + console log
```

### 🟢 API Client Layer (Interceptors)

```
Before sending request:
  ├─ 🔐 Extract token from localStorage
  ├─ 👤 Extract userId from token
  ├─ ➕ Add Authorization header
  ├─ ➕ Add X-User-Id header
  └─ 🌐 Log: "API REQUEST"

After receiving response:
  ├─ ✅ Status code received
  ├─ 📊 Data size calculated
  └─ 🌐 Log: "API RESPONSE" or "API ERROR"
```

### 🟡 Backend Filter Layer (Security)

```
Request arrives at /prescriptions
  ↓
JwtAuthenticationFilter:
  ├─ 🔍 Check if Authorization header exists
  ├─ ✂️ Extract token after "Bearer "
  ├─ 🔐 Validate token signature
  ├─ 📋 Extract claims (email, role)
  ├─ ✅ Set SecurityContext if valid
  └─ ❌ Clear SecurityContext if invalid

Logs captured:
  ├─ 🔍 JWT Filter checking path: /prescriptions
  ├─ 🔐 Validating JWT token
  ├─ ✅ JWT VALID - email, role (on success)
  └─ ❌ JWT VALIDATION FAILED - reason (on failure)
```

### 🔴 Backend Controller Layer

```
Request reaches PrescriptionController
  ↓
@PostMapping("/prescriptions"):
  ├─ 📤 Receive request
  ├─ ✅ Extract @RequestParam("file")
  ├─ ✅ Extract @RequestHeader("X-User-Id")
  ├─ ✅ Extract @RequestHeader("Authorization")
  ├─ 📄 Get file: name, size, type
  ├─ ✔️ Validate file
  ├─ 📁 Save/process file
  └─ ✅ Return 200 OK

Logs captured:
  ├─ ═══════════════════════════════════
  ├─ 📤 POST /prescriptions REQUEST
  ├─ Path, Method, Content-Type
  ├─ X-User-Id present? ✅
  ├─ Authorization present? ✅
  ├─ File name: test.pdf
  ├─ File size: 1024 bytes
  ├─ ═══════════════════════════════════
  └─ ✅ RESPONSE: File uploaded
```

---

## Problem Detection Flow

### Problem: 403 Forbidden

```
Frontend logs:
  ❌ API ERROR - status 403

Check these:
  1. Is Authorization header present? 🔐
  2. Is X-User-Id header present? 👤
  3. Look for: "🔐 Token added to request"

↓

Backend logs (auth-service):
  🔍 JWT Filter checking path: /prescriptions
  ❌ JWT VALIDATION FAILED: [REASON]

Possible reasons:
  ├─ "Token signature invalid" → Secret key mismatch
  ├─ "Token expired" → Need to refresh
  ├─ "Malformed JWT" → Token format wrong
  └─ "No signing key" → Configuration issue

Solution: Based on exact reason shown in logs
```

### Problem: OUT_OF_STOCK

```
Frontend logs:
  📦 ProductCard received product
    stockStatus: OUT_OF_STOCK
    totalQuantity: 0

Check these:
  1. Is API sending stockStatus field? ✅
  2. What value is stockStatus? (OUT_OF_STOCK)
  3. What is totalQuantity? (0)

↓

Backend logs (admin-catalogue):
  📊 Calculating stock status for medicineId: 1
    Found 0 batches
    ❌ NO BATCHES FOUND - Returning OUT_OF_STOCK

Root cause: No batches in database for this medicine

Solution:
  - Add batches to database
  - Check medicine-batch relationship in DB
  - Verify batch_no is not null in batches table
```

---

## Log File Locations Reference

```
Backend Logs:
  📁 microservices/
     ├─ auth-service/
     │  └─ logs/
     │     └─ auth-service.log ← All auth/prescription logs
     │
     └─ admin-catalogue-service/
        └─ logs/
           └─ admin-catalogue-service.log ← All product/stock logs

Frontend Logs:
  🌐 Browser
     ├─ localStorage: "medicart_logs" key
     └─ Console: F12 → Console tab
```

---

## Quick Log Reading Guide

### Emoji Meanings

```
🔐 Authentication / JWT related
👤 User ID operation
🔍 Searching / Finding data
✅ Success / Valid
❌ Error / Invalid / Failure
🌐 Network / HTTP request
📋 Data list / History
📤 Upload operation
📥 Download operation
📦 Product / Package data
📊 Statistics / Calculation
✔️ Validation passed
⚠️ Warning
🚫 Blocked / Forbidden
🔑 Key / Secret
🎭 Role / Permission
```

### Log Level Indicators

```
[INFO]  ℹ️ General information
        Example: ✅ JWT VALID, ✅ RESPONSE

[DEBUG] 🔍 Detailed debugging
        Example: 🔍 JWT Filter checking path

[WARN]  ⚠️ Warning but not error
        Example: ⚠️ Upload failed - file empty

[ERROR] ❌ Error occurred
        Example: ❌ JWT VALIDATION FAILED
```

---

## Verification Checklist

After deploying new JARs:

- [ ] Services started without errors
- [ ] Log files created in `logs/` directory
- [ ] Frontend console shows initialization logs
- [ ] Load products page → See stock calculation logs
- [ ] Login → See JWT validation logs
- [ ] Upload prescription → See detailed request/response logs
- [ ] Check backend logs for request details
- [ ] All logs contain expected emoji markers
- [ ] Error logs show specific reasons

---

## If Still Having Issues

1. **Collect logs:**
   ```powershell
   # Backend
   Get-Content "microservices\auth-service\logs\auth-service.log" | Out-File "auth-logs.txt"
   
   # Frontend
   # In browser console: logger.downloadLogs()
   ```

2. **Check for patterns:**
   ```powershell
   # Find all errors
   Select-String "❌" "auth-logs.txt"
   
   # Find JWT failures
   Select-String "JWT VALIDATION FAILED" "auth-logs.txt"
   ```

3. **Share exact log lines** showing the problem

With comprehensive logging, every issue has a clear root cause visible in logs! 📊
