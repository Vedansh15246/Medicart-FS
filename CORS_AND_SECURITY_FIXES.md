# CORS & Security Fixes - Complete Implementation

## Overview
Fixed all CORS policy violations and service discovery issues that were preventing frontend from communicating with backend microservices.

---

## Issues Fixed

### Issue 1: Services Registered with IP Address Instead of Hostname
**Error**: Requests redirected from `localhost:8080/medicines` to `192.168.0.107:8082/login`

**Root Cause**: 
```properties
eureka.instance.prefer-ip-address=true  # ❌ WRONG - Returns IP addresses
```

**Solution**: Changed in all microservices to use hostname
```properties
eureka.instance.prefer-ip-address=false  # ✓ CORRECT
eureka.instance.hostname=localhost
```

**Files Modified**:
- ✓ auth-service/src/main/resources/application.properties
- ✓ admin-catalogue-service/src/main/resources/application.properties
- ✓ cart-orders-service/src/main/resources/application.properties
- ✓ analytics-service/src/main/resources/application.properties
- ✓ payment-service/src/main/resources/application.properties

---

### Issue 2: CORS Policy Blocking All Requests
**Error**: `Access to XMLHttpRequest blocked by CORS policy: No 'Access-Control-Allow-Origin' header`

**Root Cause**: 
- Controllers using `@CrossOrigin(origins = "*")` (too permissive)
- Missing specific allowed origins configuration
- API Gateway not properly configured for CORS

**Solution**: 

#### A. Updated All Controllers with Specific Origins
Changed from:
```java
@CrossOrigin(origins = "*")  // ❌ INSECURE
```

To:
```java
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
    allowCredentials = "true",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    maxAge = 3600
)  // ✓ SECURE & SPECIFIC
```

**Controllers Updated**:
1. ✓ AuthController (auth-service)
2. ✓ UserController (auth-service)
3. ✓ MedicineController (admin-catalogue-service)
4. ✓ BatchController (admin-catalogue-service)
5. ✓ PrescriptionController (admin-catalogue-service)
6. ✓ CartController (cart-orders-service)
7. ✓ OrderController (cart-orders-service)
8. ✓ AddressController (cart-orders-service)
9. ✓ AnalyticsController (analytics-service)
10. ✓ ReportController (analytics-service)
11. ✓ PaymentController (payment-service)

#### B. API Gateway Already Has CORS Configuration ✓
```java
// GatewayConfig.java - Has custom CORS filter
// SecurityConfig.java - Has CorsWebFilter with allowed origins
```

Configuration in [api-gateway/src/main/resources/application.properties](api-gateway/src/main/resources/application.properties):
```properties
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000,http://localhost:5174
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600
```

---

### Issue 3: Frontend Dev Server Not Properly Configured
**Problem**: Direct requests to backend bypassing proxy

**Solution**: Added Vite proxy configuration

**File Modified**: ✓ [frontend/vite.config.js](frontend/vite.config.js)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        ws: true,
      },
    },
  },
})
```

**Benefit**: 
- Frontend routes `/api/*` through Vite dev server
- Vite forwards to API Gateway on `localhost:8080`
- No direct service calls (all go through API Gateway)

---

## Request Flow - After Fixes

```
┌─────────────────────────────────────────────────────────────────┐
│ CORRECT REQUEST FLOW                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend (localhost:5173)                                      │
│  ↓                                                               │
│  Axios client.post("/auth/login")                               │
│  ↓                                                               │
│  Vite Proxy (localhost:5173 → localhost:8080)                   │
│  ↓                                                               │
│  API Gateway (localhost:8080)                                   │
│  ↓ (Routes request based on path)                               │
│  Routes to: /auth/** → Auth Service (localhost:8081)            │
│  ↓                                                               │
│  Auth Service checks Eureka for registered services             │
│  ↓ (Gets localhost:8081 via Eureka, NOT 192.168.0.107)          │
│  Auth Service processes request                                 │
│  ↓                                                               │
│  Response returned with proper CORS headers                     │
│  Access-Control-Allow-Origin: http://localhost:5173            │
│  ↓                                                               │
│  Frontend receives response ✓ SUCCESS                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Architecture

### Microservices Ports
| Service | Port | Eureka Registration |
|---------|------|---------------------|
| Eureka Server | 8761 | (Registry) |
| API Gateway | 8080 | localhost:8080 |
| Auth Service | 8081 | localhost:8081 |
| Admin Catalogue | 8082 | localhost:8082 |
| Cart Orders | 8083 | localhost:8083 |
| Analytics | 8085 | localhost:8085 |
| Payment | 8086 | localhost:8086 |

### Frontend
| Component | Port |
|-----------|------|
| Vite Dev Server | 5173 |
| API Base URL | http://localhost:8080 |

---

## Security Improvements

### Before (Insecure)
- ❌ All services accepting `@CrossOrigin(origins = "*")`
- ❌ Services registered with IP addresses
- ❌ No credential handling configured
- ❌ Frontend making direct service calls

### After (Secure)
- ✓ Only specific origins allowed
- ✓ Services use hostnames for local development
- ✓ Credentials properly configured with CORS
- ✓ All traffic through API Gateway (single entry point)
- ✓ Specific HTTP methods configured (GET, POST, PUT, DELETE, OPTIONS)
- ✓ Max age set to 3600 seconds (1 hour) for preflight cache

---

## Deployment Checklist

### Before Starting Services

- [ ] Verify all microservice configuration files updated
- [ ] Check API Gateway has correct Eureka configuration
- [ ] Ensure frontend vite.config.js has proxy settings
- [ ] Confirm all CORS annotations updated in controllers

### When Starting Services

1. **Start Eureka Server first**
   ```bash
   # Port 8761
   ```

2. **Start API Gateway**
   ```bash
   # Port 8080
   ```

3. **Start Individual Microservices**
   ```bash
   # Port 8081 - Auth Service
   # Port 8082 - Admin Catalogue Service
   # Port 8083 - Cart Orders Service
   # Port 8085 - Analytics Service
   # Port 8086 - Payment Service
   ```

4. **Start Frontend Dev Server**
   ```bash
   npm run dev  # Port 5173
   ```

### Verification Steps

1. **Check Eureka Dashboard**
   - Navigate to `http://localhost:8761`
   - Verify all services registered with `localhost:XXXX` (NOT IP addresses)

2. **Test Login Endpoint**
   - Use frontend login form
   - Check Network tab in browser DevTools
   - Verify request goes to `localhost:5173` → API Gateway → Auth Service
   - Confirm response has `Access-Control-Allow-Origin: http://localhost:5173`

3. **Monitor Browser Console**
   - No CORS errors
   - No 404 errors
   - No network timeouts

4. **Check API Gateway Logs**
   - Verify routing is correct
   - No authentication failures
   - Services properly load balanced

---

## Testing the Fix

### Test 1: Login Endpoint
```javascript
// Expected: 200 OK with user data
fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
})
.then(r => r.json())
.then(data => console.log('✓ Login successful:', data))
.catch(e => console.error('✗ Login failed:', e));
```

### Test 2: Get Medicines
```javascript
// Expected: 200 OK with medicines array
fetch('http://localhost:8080/medicines')
  .then(r => r.json())
  .then(data => console.log('✓ Medicines loaded:', data))
  .catch(e => console.error('✗ Medicines failed:', e));
```

### Test 3: Options Preflight Request
```bash
curl -X OPTIONS http://localhost:8080/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected response headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

---

## Summary of Changes

| Component | Change | Impact |
|-----------|--------|--------|
| Eureka Config | `prefer-ip-address: true` → `false` | Services use localhost for local dev |
| All Controllers | `@CrossOrigin(origins="*")` → specific origins | Secure CORS policy |
| Vite Config | Added proxy configuration | Frontend routes through API Gateway |
| API Gateway | Already correct ✓ | No changes needed |

---

## Troubleshooting

### Still Getting CORS Error?
1. Check browser DevTools Network tab - verify response has `Access-Control-Allow-Origin` header
2. Check Eureka dashboard - verify services NOT showing IP addresses
3. Restart all services - refresh Eureka registration
4. Clear browser cache - old CORS preflight responses may be cached

### Services Not Found (404)?
1. Verify microservice is running on correct port
2. Check API Gateway routing configuration
3. Verify Eureka shows service as UP
4. Check API Gateway logs for routing errors

### Connection Refused Errors?
1. Ensure all services started in correct order (Eureka → Gateway → Microservices)
2. Check firewall not blocking ports
3. Verify localhost resolution working (`ping localhost`)

