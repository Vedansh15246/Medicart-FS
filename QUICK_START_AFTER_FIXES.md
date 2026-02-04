# Quick Start Guide - After CORS/Security Fixes

## All Issues Fixed ✓

Your MediCart application now has:
- ✓ Proper CORS configuration (secure & specific)
- ✓ Service discovery using hostnames (not IP addresses)
- ✓ API Gateway as single entry point
- ✓ Frontend proxy configuration
- ✓ All microservices properly configured

---

## How to Deploy & Test

### Phase 1: Start Backend Services

**Order matters! Start in this sequence:**

#### 1️⃣ Eureka Server (Port 8761)
```bash
# Terminal in: microservices folder
cd microservices
mvn clean install

# Find and run EurekaServerApplication
# OR use VS Code Java extension to run the class
```
**Verify:** Open http://localhost:8761 in browser

---

#### 2️⃣ API Gateway (Port 8080)
```bash
# New terminal in: microservices folder
# Run ApiGatewayApplication
```
**Verify:** Should appear in Eureka dashboard as GATEWAY

---

#### 3️⃣ Microservices (Start each in a new terminal)

**Auth Service (Port 8081)**
```bash
# Run AuthServiceApplication
```

**Admin Catalogue Service (Port 8082)**
```bash
# Run AdminCatalogueServiceApplication
```

**Cart Orders Service (Port 8083)**
```bash
# Run CartOrdersServiceApplication
```

**Analytics Service (Port 8085)**
```bash
# Run AnalyticsServiceApplication
```

**Payment Service (Port 8086)**
```bash
# Run PaymentServiceApplication
```

**Verify:** All 6 services appear in Eureka dashboard (http://localhost:8761)

---

### Phase 2: Start Frontend

```bash
# Terminal in: frontend folder
cd frontend

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# Frontend should be at: http://localhost:5173
```

---

### Phase 3: Verify Everything Works

#### 1️⃣ Check Eureka Dashboard
- Go to: http://localhost:8761
- Verify all services showing with **localhost:PORT** (NOT IP addresses)

```
✓ api-gateway registered
✓ auth-service registered  
✓ admin-catalogue-service registered
✓ cart-orders-service registered
✓ analytics-service registered
✓ payment-service registered
```

**Should NOT see:**
```
✗ 192.168.0.107:8081
✗ 192.168.0.107:8082
✗ etc.
```

#### 2️⃣ Test Frontend
- Go to: http://localhost:5173
- Try login with test credentials
- **Expected:** Login works without CORS errors

#### 3️⃣ Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Should see: **NO CORS errors**
- Should see: **NO net::ERR_FAILED errors**
- Should see: **Requests completing successfully**

#### 4️⃣ Check Network Tab
- Click any action in frontend (login, fetch medicines, etc.)
- Open DevTools Network tab
- Verify requests:
  - Start at: `localhost:5173`
  - Go to: `localhost:8080` (API Gateway)
  - **NOT** to any IP addresses
  - Response headers have: `Access-Control-Allow-Origin: http://localhost:5173`

---

## Common Issues & Solutions

### Issue 1: Eureka Still Shows IP Addresses
**Solution:**
1. Kill all Java processes: `Ctrl+C` in all terminals
2. Give it 30 seconds to fully shutdown
3. Restart services in order (Eureka → Gateway → Others)
4. Check Eureka dashboard again

### Issue 2: CORS Errors Still Appearing
**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Restart frontend dev server: `npm run dev`
3. Hard refresh frontend: `Ctrl+Shift+R`

### Issue 3: 404 Errors
**Solution:**
1. Check API Gateway routing in terminal logs
2. Verify microservice is registered in Eureka
3. Check endpoint path in controller matches request path

### Issue 4: Services Won't Connect
**Solution:**
1. Ensure Eureka server started first
2. Ensure API Gateway started before other services
3. Check ports: 8761 (Eureka), 8080 (Gateway), 8081-8086 (Services)
4. Check firewall not blocking ports

---

## Files Changed

### Backend Microservices
All **application.properties** files updated:
```
✓ auth-service/src/main/resources/application.properties
✓ admin-catalogue-service/src/main/resources/application.properties
✓ cart-orders-service/src/main/resources/application.properties
✓ analytics-service/src/main/resources/application.properties
✓ payment-service/src/main/resources/application.properties
```

All **Controller** classes updated:
```
✓ 11 Controller files
✓ All @CrossOrigin annotations updated
✓ Specific origins configured
```

### Frontend
```
✓ frontend/vite.config.js (Added proxy configuration)
```

### Documentation
```
✓ ARCHITECTURE_AND_CORS_ANALYSIS.md (System overview)
✓ CORS_AND_SECURITY_FIXES.md (Detailed fixes)
✓ ERROR_ANALYSIS_AND_EXPLANATION.md (Error explanations)
```

---

## The Three Fixes Explained Simply

### Fix 1: Eureka Hostname Registration
**Changed:** `prefer-ip-address: true` → `false`
**Why:** Services now register as `localhost:8081` instead of `192.168.0.107:8081`
**Impact:** No more IP address redirects, all requests use localhost

### Fix 2: CORS Authorization
**Changed:** `@CrossOrigin(origins="*")` → specific origins
**Why:** Secure CORS policy instead of allowing everyone
**Impact:** Browser accepts responses from backend properly

### Fix 3: Frontend Proxy
**Added:** Vite proxy configuration
**Why:** Frontend routes all API calls through dev server → API Gateway
**Impact:** Centralized routing, consistent origin

---

## Architecture After Fixes

```
┌─────────────────┐
│   Frontend      │
│  localhost:5173 │
└────────┬────────┘
         │
         │ proxy: /api → localhost:8080
         │
    ┌────▼────────┐
    │  Vite DevSvr│
    └────┬────────┘
         │
         │
    ┌────▼─────────────────┐
    │   API Gateway       │
    │   localhost:8080     │
    │   (Single Entry Pt)  │
    └────┬────┬────┬──┬────┘
         │    │    │  │
    ┌────┘┐ ┌─┘ ┌──┘  └──┐
    │     │ │   │        │
┌───▼──┐┌─▼──┐┌─▼───┐┌──▼────┐┌──────┐
│Auth  ││Cart││Admin││Payment││Analytics
│8081  ││8083││8082 ││8086   ││8085
└──────┘└────┘└─────┘└───────┘└───────┘

All through Eureka Service Discovery (localhost:8761)
```

---

## Database Note

Ensure MySQL is running with these databases:
```sql
✓ auth_service_db
✓ admin_catalogue_db  
✓ cart_orders_db
✓ analytics_db
✓ payment_db
```

---

## Success Criteria

Your system is working correctly when:

- [ ] All services appear in Eureka with `localhost:PORT`
- [ ] Frontend loads at `http://localhost:5173`
- [ ] No CORS errors in browser console
- [ ] No `net::ERR_FAILED` errors
- [ ] No 404 errors for API calls
- [ ] Login form works
- [ ] Can browse medicines
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Network requests go through API Gateway

---

## Next Steps

1. **Test Full User Flow**
   - Register user
   - Login
   - Browse medicines
   - Add to cart
   - Checkout
   - Payment

2. **Test Admin Flow**
   - Admin login
   - Add medicines
   - View analytics
   - Generate reports

3. **Monitor Logs**
   - Check for any errors
   - Verify routing is correct
   - Monitor performance

4. **Production Deployment**
   - Change origins to production URLs
   - Update database connections
   - Add SSL certificates
   - Configure environment variables

---

## Quick Commands

```bash
# Kill all Java processes
pkill -f java

# Check if port is in use
netstat -ano | findstr :8080

# Test API Gateway
curl http://localhost:8080/medicines

# Test Auth Service
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}'

# Frontend
npm run dev
```

