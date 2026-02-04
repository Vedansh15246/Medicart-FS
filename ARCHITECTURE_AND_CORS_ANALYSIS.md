# MediCart - Complete Architecture & CORS Analysis

## 1. SYSTEM ARCHITECTURE OVERVIEW

### Frontend Setup
- **URL**: `http://localhost:5173` (Vite dev server)
- **Framework**: React 18
- **API Client**: Axios with base URL `http://localhost:8080`
- **Port**: 5173

### Backend - Microservices Setup

#### Service Ports:
| Service | Port | Purpose |
|---------|------|---------|
| **Eureka Server** | 8761 | Service Discovery & Registry |
| **API Gateway** | 8080 | Entry point, routes to microservices |
| **Auth Service** | 8081 | Authentication & Authorization |
| **Admin Catalogue Service** | 8082 | Medicines & Batches Management |
| **Cart Orders Service** | 8083 | Cart & Order Management |
| **Analytics Service** | 8085 | Analytics & Reports |
| **Payment Service** | 8086 | Payment Processing |

---

## 2. REQUEST FLOW ANALYSIS

### Correct Flow:
```
Frontend (localhost:5173)
    ↓
Axios Client (baseURL: localhost:8080)
    ↓
API Gateway (port 8080) - CORS Enabled
    ↓
Routes Requests to Microservices:
    /auth/** → Auth Service (8081)
    /medicines/** → Admin Catalogue Service (8082)
    /batches/** → Admin Catalogue Service (8082)
    /api/cart/** → Cart Orders Service (8083)
    /api/orders/** → Cart Orders Service (8083)
    /api/analytics/** → Analytics Service (8085)
    /api/payment/** → Payment Service (8086)
```

---

## 3. ROOT CAUSES OF ERRORS

### **Error 1: CORS Policy Blocking**
```
Access to XMLHttpRequest at 'http://192.168.0.107:8082/login' 
(redirected from 'http://localhost:8080/medicines') 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Root Causes:**
1. **IP Address Issue**: Browser redirected to `192.168.0.107:8082` instead of going through API Gateway
2. **Missing CORS Headers**: Backend not returning `Access-Control-Allow-Origin` header
3. **Service Discovery Problem**: Eureka is returning IP addresses instead of service names
4. **Direct Access**: Frontend trying to access backend services directly instead of through API Gateway

---

### **Error 2: 404 Not Found**
```
Failed to load resource: the server responded with a status of 404
```

**Root Causes:**
1. **Route Mismatch**: `/medicines` endpoint might not exist or route configuration incorrect
2. **Service Not Registered**: Microservice not properly registered in Eureka
3. **Network Failure**: Service endpoint is unreachable

---

### **Error 3: net::ERR_FAILED**
```
GET http://192.168.0.107:8082/login net::ERR_FAILED
```

**Root Cause:**
Direct connection to IP address failed because:
- Firewall blocking port 8082 on that IP
- Service not running on that IP
- Network connectivity issue

---

## 4. CONFIGURATION ISSUES FOUND

### API Gateway Configuration ✓ (Correct)
```properties
server.port=8080
spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=lb://auth-service  # Load balance to auth service
spring.cloud.gateway.routes[0].predicates[0]=Path=/auth/**

spring.cloud.gateway.routes[1].id=medicines-service
spring.cloud.gateway.routes[1].uri=lb://admin-catalogue-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/medicines/**,/medicines
```

### CORS Configuration in API Gateway
✓ **GatewayConfig.java** - Has CORS filter
✓ **SecurityConfig.java** - Has CorsWebFilter
✓ **application.properties** - Has CORS allowed origins

### BUT: Issue in Auth Service Controller
```java
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")  // Too permissive
public class AuthController
```

The `@CrossOrigin(origins = "*")` with credentials can cause issues.

### Eureka Configuration Issue
```properties
eureka.instance.prefer-ip-address=true  # ← PROBLEM!
```

This tells Eureka to register services using IP addresses instead of hostnames, causing requests to use `192.168.0.107` instead of `localhost`.

---

## 5. COMPLETE SOLUTION

### **Fix 1: Disable IP Address Registration**

All microservices should use hostnames for local development:

```properties
eureka.instance.prefer-ip-address=false
eureka.instance.hostname=localhost
```

### **Fix 2: Enhance CORS Configuration**

Replace permissive `@CrossOrigin(origins = "*")` with proper configuration.

### **Fix 3: Fix Vite Dev Server Configuration**

Add proxy configuration to avoid CORS issues:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### **Fix 4: Update Frontend API Client**

Already correctly configured to use `http://localhost:8080` ✓

---

## 6. SERVICE DISCOVERY FLOW

### Current Problem:
```
Frontend → localhost:8080 (API Gateway)
    ↓
API Gateway queries Eureka (localhost:8761)
    ↓
Eureka returns: 192.168.0.107:8081, 192.168.0.107:8082, etc.
    ↓
API Gateway tries to route to IP addresses
    ↓
Network error or wrong machine!
```

### Fixed Flow:
```
Frontend → localhost:8080 (API Gateway)
    ↓
API Gateway queries Eureka (localhost:8761)
    ↓
Eureka returns: localhost:8081, localhost:8082, etc.
    ↓
API Gateway successfully routes through load balancer
    ↓
✓ Success
```

---

## 7. VALIDATION CHECKLIST

- [ ] All microservices have `eureka.instance.prefer-ip-address=false`
- [ ] All microservices have `eureka.instance.hostname=localhost`
- [ ] API Gateway CORS filter is enabled
- [ ] Auth Service uses proper CORS configuration
- [ ] Frontend baseURL is `http://localhost:8080`
- [ ] All microservices registered in Eureka
- [ ] Ports are correctly configured (8080, 8081, 8082, 8083, 8085, 8086)

