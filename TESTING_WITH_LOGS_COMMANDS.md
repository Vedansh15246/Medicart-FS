# 🧪 EXACT TEST COMMANDS WITH EXPECTED LOG OUTPUT

## Prerequisites

1. All services running:
   - Eureka Server on port 8761
   - Auth Service on port 8081
   - Admin Catalogue Service on port 8082

2. Admin user exists in auth_service_db:
   - Email: `admin@medicart.com`
   - Password: `admin123`

---

## Test 1: GET /medicines (Public - No Token)

### Command:
```bash
curl -v http://localhost:8082/medicines
```

### Expected Console Output in Admin Catalogue Service:

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

### Expected HTTP Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "name": "Paracetamol", ...},
  ...
]
```

### ✅ What This Means:
- JWT filter sees no token (OK for public endpoint)
- Request reaches controller
- Response sent successfully
- Status: **SUCCESS** ✓

---

## Test 2: GET /batches (Public - No Token)

### Command:
```bash
curl -v http://localhost:8082/batches
```

### Expected Console Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: GET | URI: /batches
════════════════════════════════════════════════════════════════

⚠️  Authorization header is NULL
→ Passing request to next filter WITHOUT authentication

🔷 [GET /batches] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [BatchController.getAllBatches] SECURITY CONTEXT CHECK
   ❌ Authentication: NULL
════════════════════════════════════════════════════════════════

✅ [GET /batches] RESPONSE SENT: X batches
```

### Expected HTTP Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

[
  {"id": 1, "batchCode": "BATCH001", ...},
  ...
]
```

### ✅ Status: **SUCCESS** ✓

---

## Test 3: Login to Get Token

### Command:
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medicart.com",
    "password": "admin123"
  }' | jq '.'
```

### Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6IlJPTEVfQURNSU4iLCJlbWFpbCI6ImFkbWluQG1lZGljYXJ0LmNvbSIsImZ1bGxOYW1lIjoiQWRtaW4gVXNlciIsImlhdCI6MTcwOTI0NTI4MCwiZXhwIjoxNzA5MjQ4ODgwfQ.7_SIGNATURE...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "userId": 1,
  "email": "admin@medicart.com",
  "fullName": "Admin User",
  "roles": ["ROLE_ADMIN"]
}
```

### ✅ Status: **SUCCESS** ✓

**Important:** Copy the `token` value for the next tests!

---

## Test 4: POST /medicines (Admin - With Valid Token)

### Step 1: Save Token (PowerShell)
```powershell
$response = curl -X POST http://localhost:8081/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@medicart.com","password":"admin123"}' | ConvertFrom-Json

$TOKEN = $response.token
Write-Host "Token saved: $TOKEN"
```

### Step 2: POST with Token
```powershell
curl -v -X POST http://localhost:8082/medicines `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Paracetamol",
    "description": "Pain relief medication",
    "price": 25.50,
    "stock": 100,
    "category": "Pain Relief"
  }'
```

### Expected Console Output in Admin Catalogue Service:

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
   🕐 iat (issued):    Sun Feb 01 2026 14:05:00 IST
   ⏱️  exp (expiry):    Sun Feb 01 2026 15:05:00 IST
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
   Body: MedicineDTO(id=null, name=Paracetamol, description=Pain relief medication, price=25.5, stock=100, category=Pain Relief)

════════════════════════════════════════════════════════════════
🎯 [MedicineController.createMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Principal: admin@medicart.com
   Authorities: [ROLE_ADMIN]
   Authenticated: true
════════════════════════════════════════════════════════════════

✅ [POST /medicines] RESPONSE SENT: 1
```

### Expected HTTP Response:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "Paracetamol",
  "description": "Pain relief medication",
  "price": 25.50,
  "stock": 100,
  "category": "Pain Relief"
}
```

### ✅ Status: **SUCCESS** ✓

**This is the GOLDEN SCENARIO** - JWT works perfectly!

---

## Test 5: POST /medicines (Admin - Invalid Token)

### Command:
```powershell
curl -v -X POST http://localhost:8082/medicines `
  -H "Authorization: Bearer invalid.token.here" `
  -H "Content-Type: application/json" `
  -d '{"name": "Paracetamol", "price": 25}'
```

### Expected Console Output in Admin Catalogue Service:

```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /medicines
════════════════════════════════════════════════════════════════

🔍 Reading Authorization header
📋 Header value: Bearer invalid.token.here

✂️  Extracting token from header (substring 7)
📝 Token length: 18 characters

🔓 Parsing JWT with secret key

❌ [JWT FILTER] EXCEPTION DURING JWT PARSING/VERIFICATION
   Exception type: io.jsonwebtoken.MalformedJwtException
   Exception message: Unable to read JSON value: Unexpected character...
   Exception cause: ...
   Stack trace: 
     at io.jsonwebtoken.impl.DefaultJwtParser.parse...
     at io.jsonwebtoken.impl.DefaultJwtParser.parseSignedClaims...
     ...

⚠️  [JWT FILTER] Clearing SecurityContext due to exception

→ [JWT FILTER] Passing request to next filter in chain
════════════════════════════════════════════════════════════════

[Spring Security] AuthenticationCredentialsNotFoundException
Access Denied: anonymous user cannot access
```

### Expected HTTP Response:
```
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "Unauthorized",
  "message": "Access Denied"
}
```

### ❌ Status: **EXPECTED FAILURE** (Correct behavior)

**Why:** Invalid token → JWT parsing failed → SecurityContext cleared → No authentication → 403 Forbidden ✓

---

## Test 6: POST /medicines (No Token)

### Command:
```powershell
curl -v -X POST http://localhost:8082/medicines `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Paracetamol",
    "price": 25
  }'
```

### Expected Console Output:

```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /medicines
════════════════════════════════════════════════════════════════

⚠️  Authorization header is NULL
→ Passing request to next filter WITHOUT authentication

[Spring Security] AuthenticationCredentialsNotFoundException
Access Denied: anonymous user cannot access
```

### Expected HTTP Response:
```
HTTP/1.1 403 Forbidden

{
  "error": "Unauthorized",
  "message": "Access Denied"
}
```

### ❌ Status: **EXPECTED FAILURE** (Correct behavior)

**Why:** No token → No SecurityContext → No authentication → POST requires auth → 403 Forbidden ✓

---

## Test 7: POST /batches (Admin - With Valid Token)

### Command:
```powershell
$response = curl -X POST http://localhost:8081/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@medicart.com","password":"admin123"}' | ConvertFrom-Json

$TOKEN = $response.token

curl -v -X POST http://localhost:8082/batches `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "batchCode": "BATCH001",
    "medicineId": 1,
    "quantity": 500,
    "manufacturingDate": "2025-01-01",
    "expiryDate": "2027-01-01"
  }'
```

### Expected Console Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: POST | URI: /batches
════════════════════════════════════════════════════════════════

✂️  Extracting token
✅ JWT SIGNATURE VERIFIED
✨ JWT CLAIMS EXTRACTED:
   👤 sub: admin@medicart.com
   🎭 scope: ROLE_ADMIN
✅ SecurityContext POPULATED

🔶 [POST /batches] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [BatchController.createBatch] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Principal: admin@medicart.com
   Authorities: [ROLE_ADMIN]
════════════════════════════════════════════════════════════════

✅ [POST /batches] RESPONSE SENT: 1
```

### Expected HTTP Response:
```
HTTP/1.1 200 OK

{
  "id": 1,
  "batchCode": "BATCH001",
  "medicineId": 1,
  "quantity": 500,
  "manufacturingDate": "2025-01-01",
  "expiryDate": "2027-01-01"
}
```

### ✅ Status: **SUCCESS** ✓

---

## Test 8: PUT /medicines/{id} (Admin - With Valid Token)

### Command:
```powershell
$response = curl -X POST http://localhost:8081/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@medicart.com","password":"admin123"}' | ConvertFrom-Json

$TOKEN = $response.token

curl -v -X PUT http://localhost:8082/medicines/1 `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Paracetamol Updated",
    "price": 30.00,
    "stock": 150
  }'
```

### Expected Console Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: PUT | URI: /medicines/1
✅ JWT SIGNATURE VERIFIED
✨ ROLE_ADMIN identified
✅ SecurityContext POPULATED

🔶 [PUT /medicines/1] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [MedicineController.updateMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Authorities: [ROLE_ADMIN]
════════════════════════════════════════════════════════════════

✅ [PUT /medicines/1] RESPONSE SENT
```

### Expected HTTP Response:
```
HTTP/1.1 200 OK

{
  "id": 1,
  "name": "Paracetamol Updated",
  "price": 30.00,
  "stock": 150
}
```

### ✅ Status: **SUCCESS** ✓

---

## Test 9: DELETE /medicines/{id} (Admin - With Valid Token)

### Command:
```powershell
$TOKEN = ... # from Test 3

curl -v -X DELETE http://localhost:8082/medicines/1 `
  -H "Authorization: Bearer $TOKEN"
```

### Expected Console Output:
```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: DELETE | URI: /medicines/1
✅ JWT SIGNATURE VERIFIED
✨ ROLE_ADMIN identified
✅ SecurityContext POPULATED

🔴 [DELETE /medicines/1] REQUEST RECEIVED

════════════════════════════════════════════════════════════════
🎯 [MedicineController.deleteMedicine] SECURITY CONTEXT CHECK
   ✅ Authentication: EXISTS
   Authorities: [ROLE_ADMIN]
════════════════════════════════════════════════════════════════

✅ [DELETE /medicines/1] RESPONSE SENT
```

### Expected HTTP Response:
```
HTTP/1.1 204 No Content
```

### ✅ Status: **SUCCESS** ✓

---

## 🎯 Summary of Expected Results

| Test | Endpoint | Token | Auth Required | Expected Result |
|------|----------|-------|---------------|-----------------|
| 1 | GET /medicines | ❌ No | No | ✅ 200 OK |
| 2 | GET /batches | ❌ No | No | ✅ 200 OK |
| 3 | POST /auth/login | ❌ No | No | ✅ 200 + Token |
| 4 | POST /medicines | ✅ Valid | Yes | ✅ 200 OK |
| 5 | POST /medicines | ❌ Invalid | Yes | ❌ 403 Forbidden |
| 6 | POST /medicines | ❌ No | Yes | ❌ 403 Forbidden |
| 7 | POST /batches | ✅ Valid | Yes | ✅ 200 OK |
| 8 | PUT /medicines/1 | ✅ Valid | Yes | ✅ 200 OK |
| 9 | DELETE /medicines/1 | ✅ Valid | Yes | ✅ 204 No Content |

---

## 🔍 If You See These, Something Is Wrong

### ❌ "ROLE_ANONYMOUS" appears in logs
**Cause:** Anonymous authentication is enabled  
**Fix:** Check WebSecurityConfig has `.anonymous(anon -> anon.disable())`

### ❌ "Created SecurityContextImpl [Null authentication]"
**Cause:** JWT filter not running or SecurityContext not set  
**Fix:** Check filter order, check JWT parsing doesn't fail

### ❌ "Authentication: NULL" for POST
**Cause:** Token not provided or invalid  
**Fix:** Provide valid token with Authorization header

### ❌ "scope: ADMIN" (no ROLE_ prefix)
**Cause:** auth-service not adding ROLE_ prefix  
**Fix:** Check JwtService in auth-service

### ❌ Token has correct claims but still 403
**Cause:** Wrong role claimed or hasRole() check failed  
**Fix:** Check token has ROLE_ADMIN, check user role in database

---

## Ready to Test!

All logging is in place. Restart admin-catalogue-service and run these tests to see the complete flow! 🚀

