# 🔍 ROOT CAUSE FOUND: 403 on Feign Call to Admin-Catalogue-Service

## Problem Flow
```
User clicks "Proceed to Payment" 
  ↓
Frontend: POST /api/orders/place with body {addressId: 3}
  ↓ (with X-User-Id header, through API Gateway)
Cart-Orders-Service OrderController receives request ✅
  ↓
OrderService.placeOrder(userId=7, addressId=3)
  ↓
Gets cart items from DB ✅
  ↓
For each cart item, calls: medicineClient.getAvailableBatches(medicineId)
  ↓ (Feign client - NO JWT token, NO auth headers)
Admin-Catalogue-Service GET /batches/10/available
  ↓
WebSecurityConfig.java: "GET /batches/** → permitAll()"
  BUT security filter had anon.disable() which breaks permitAll() for unauthenticated requests
  ↓
Response: 403 FORBIDDEN ❌
```

## Why 403 (not 401)?
- 401 = Authentication required but not provided
- 403 = Authenticated but not authorized
- The security filter sees NO authentication (because anon is disabled) and treats it as "not authenticated but trying to access resource" = 403

## Solutions (in order of preference)

### Solution 1: Enable Anonymous Authentication in Admin-Catalogue (ALREADY APPLIED ✅)
**Status**: ✅ DONE
**File**: `admin-catalogue-service/src/main/java/com/medicart/admin/config/WebSecurityConfig.java`
**Change**: Removed the `.anonymous(anon -> anon.disable())` block

**Why it works**:
- Allows unauthenticated requests to GET /batches/** (marked with permitAll)
- Feign internal calls that don't include JWT can still access public endpoints
- Security: /batches/** GET is public anyway (no sensitive data modification)

**Status**: Build completed, needs restart of admin-catalogue-service.

---

### Solution 2 (Backup): Add Service-to-Service Authentication with Feign Interceptor
**Status**: NOT YET APPLIED (only if Solution 1 doesn't work after restart)
**How**: Create a FeignRequestInterceptor to add a service token to all Feign requests

```java
@Component
public class FeignClientInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        // Add X-Service-Token or Bearer token for service-to-service calls
        template.header("X-Service-Token", "service-internal-token");
        // OR generate a service JWT with special scope
    }
}
```

---

## Current Status

| Step | Status | Details |
|------|--------|---------|
| 1. Identified 403 cause | ✅ DONE | Feign call to GET /batches/{id}/available |
| 2. Fixed admin-catalogue WebSecurityConfig | ✅ DONE | Removed anon.disable() |
| 3. Rebuilt admin-catalogue JAR | ✅ DONE | Build successful (8.578s) |
| 4. Restart admin-catalogue service | ⏳ PENDING | Need to restart process with new JAR |
| 5. Test order placement | ⏳ PENDING | Click "Proceed to Payment" and verify no 403 |

---

## What to Do Next

### Step 1: Restart Admin-Catalogue-Service
Kill the old process and start it with the new JAR:

```bash
# Stop old process
taskkill /IM java.exe /F  # or kill specific process

# Start with new JAR
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service"
java -jar target/admin-catalogue-service-1.0.0.jar
```

### Step 2: Verify Service Started
Check Eureka at http://localhost:8761
- Should show "ADMIN-CATALOGUE-SERVICE" registered and UP

Check logs should show:
```
🛡️  [WebSecurityConfig] INITIALIZING SECURITY FILTER CHAIN
✅ GET /batches/**  → permitAll (public)
```

### Step 3: Test Order Placement
1. Navigate to frontend checkout: http://localhost:5173/payment
2. Ensure cart has items, select address
3. Click "Proceed to Payment"

### Step 4: Expected Logs

**Frontend Console**:
```
✅ Validated addressId: 3
📤 Sending POST /api/orders/place with addressId: 3
👤 User ID added to request {userId: 7, url: '/api/orders/place'}
✅ Order created successfully: {id: 1, userId: 7, ...}
```

**Cart-Orders-Service Console**:
```
📍 /api/orders/place called
   X-User-Id header: '7'
   addressId from body: '3'
✅ Parsed userId: 7, addressId: 3
[Feign] GET http://admin-catalogue-service/batches/10/available
✅ Order created with ID: 1
```

**Admin-Catalogue-Service Console**:
```
📍 [JWT FILTER] START
METHOD: GET | URI: /batches/10/available
Authorization header: NULL  ← This is OK for public endpoint
✓ GET /batches/10/available → permitAll (public)
Response: BatchDTO[]
```

---

## If Still Getting 403 After Restart

**Diagnosis**:
1. Check if the JAR was actually updated:
   ```bash
   ls -lt "microservices/admin-catalogue-service/target/*.jar"
   # Should show recent modification time
   ```

2. Check if new process is using new JAR:
   ```bash
   Get-Process java | Select ProcessName, Path
   ```

3. Check admin-catalogue logs for WebSecurityConfig initialization:
   - Should NOT see: "✅ Anonymous Authentication: DISABLED"
   - Should see: "✅ GET /batches/** → permitAll (public)"

4. If still 403, apply Solution 2 (Feign service token interceptor)

---

## Verification Checklist

After restart, verify:
- [ ] Admin-Catalogue-Service shows UP in Eureka
- [ ] No errors in admin-catalogue startup logs
- [ ] WebSecurityConfig logs show permitAll for /batches/**
- [ ] Frontend place order call shows "Order created successfully"
- [ ] Cart-Orders logs show order ID created (not 403 from Feign)
- [ ] Admin-Catalogue logs show GET /batches/... requests received

---

## Architecture Diagram

```
Frontend (port 5173)
    ↓ POST /api/orders/place (with X-User-Id header)
API Gateway (port 8080)
    ↓ Routes to /api/orders/** → cart-orders-service:8083
Cart-Orders-Service (port 8083)
    ├─ OrderController.placeOrder()
    │   └─ OrderService.placeOrder()
    │       ├─ cartItemRepository.findByUserId()  ✅ Local DB
    │       └─ medicineClient.getAvailableBatches(medicineId)  ← FEIGN CALL
    │           ↓ (No JWT, no auth headers - but /batches/** is public)
    │           Feign: GET http://admin-catalogue-service/batches/10/available
    │               ↓ (Eureka resolves to admin-catalogue-service:8082)
    │               Admin-Catalogue-Service (port 8082)
    │               ├─ JwtAuthenticationFilter (sees NO Authorization header - OK)
    │               ├─ WebSecurityConfig (permitAll for GET /batches/**)
    │               └─ BatchController.getAvailableBatches()
    │                   └─ Returns BatchDTO[] ✅
    │           ← Response: 200 OK with batches
    │       └─ Allocate stock from batches (FIFO)
    │       └─ Save order
    │   └─ Return OrderDTO
    ↓ Response: 200 OK with order details
Frontend receives order, redirects to /payment/select
```

