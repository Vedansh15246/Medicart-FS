# System Architecture & Flow Diagrams

## 1. BEFORE FIX - Wrong Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         WRONG SETUP (Before Fix)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend                                                        │
│  http://localhost:5173                                          │
│  ┌──────────────────┐                                           │
│  │ React App        │                                           │
│  │ (Port 5173)      │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│           │ axios baseURL: localhost:8080                       │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                      │
│  │    API Gateway                       │                      │
│  │    (Port 8080)                       │                      │
│  │                                      │                      │
│  │ Queries Eureka: "Where is service?" │                      │
│  └────────┬─────────────────────────────┘                      │
│           │                                                      │
│           │ Eureka responds with: 192.168.0.107:8082 ❌        │
│           │ (IP address instead of hostname!)                   │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                      │
│  │ Browser Receives Response from       │                      │
│  │ 192.168.0.107:8082 (Different Origin)│                      │
│  └────────┬─────────────────────────────┘                      │
│           │                                                      │
│           │ Request origin: http://localhost:5173              │
│           │ Response origin: http://192.168.0.107:8082         │
│           │ These are DIFFERENT! CORS blocks it ❌             │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────┐                      │
│  │ CORS Error!                          │                      │
│  │ "Access blocked by CORS policy"      │                      │
│  └──────────────────────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. AFTER FIX - Correct Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      CORRECT SETUP (After Fix)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend                                                         │
│  http://localhost:5173                                           │
│  ┌──────────────────┐                                            │
│  │ React App        │                                            │
│  │ (Port 5173)      │                                            │
│  └────────┬─────────┘                                            │
│           │                                                       │
│           │ Vite Proxy: /api → localhost:8080                   │
│           │                                                       │
│           ▼                                                       │
│  ┌──────────────────────────────────────┐                       │
│  │    Vite Dev Server                   │                       │
│  │    (Port 5173)                       │                       │
│  │    Proxy to API Gateway              │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                       │
│           │ Forwards request to: localhost:8080                 │
│           │                                                       │
│           ▼                                                       │
│  ┌──────────────────────────────────────┐                       │
│  │    API Gateway                       │                       │
│  │    (Port 8080)                       │                       │
│  │    Single Entry Point                │                       │
│  │                                      │                       │
│  │ Queries Eureka: "Where is service?" │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                       │
│           │ Eureka responds with: localhost:8081 ✓              │
│           │ (Hostname - CORRECT!)                               │
│           │                                                       │
│           ▼                                                       │
│  ┌──────────────────────────────────────┐                       │
│  │ Load Balances to:                    │                       │
│  │ http://localhost:8081                │                       │
│  │ (Auth Service)                       │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                       │
│           ▼                                                       │
│  ┌──────────────────────────────────────┐                       │
│  │    Auth Service                      │                       │
│  │    (Port 8081)                       │                       │
│  │                                      │                       │
│  │ @CrossOrigin(                        │                       │
│  │   origins={"localhost:5173",...}     │                       │
│  │ )                                    │                       │
│  │                                      │                       │
│  │ Response Headers:                    │                       │
│  │ Access-Control-Allow-Origin:         │                       │
│  │   http://localhost:5173 ✓            │                       │
│  └────────┬─────────────────────────────┘                       │
│           │                                                       │
│           │ Response back through Gateway → Vite → Frontend    │
│           │                                                       │
│           ▼                                                       │
│  ┌──────────────────────────────────────┐                       │
│  │ Frontend Receives Response ✓         │                       │
│  │ Same origin (localhost:5173)         │                       │
│  │ CORS allows it!                      │                       │
│  │                                      │                       │
│  │ JavaScript gets data ✓               │                       │
│  │ User sees login success ✓            │                       │
│  └──────────────────────────────────────┘                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Request Flow - Step by Step

```
┌────────────────────────────────────────────────────────────────┐
│           COMPLETE REQUEST-RESPONSE FLOW                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Step 1: User clicks Login on Frontend                          │
│   ├─ Frontend: http://localhost:5173                          │
│   ├─ Component calls: authService.login(email, password)       │
│   └─ Axios client makes POST request                           │
│                                                                 │
│ Step 2: Request goes to Vite Proxy                             │
│   ├─ Path: /auth/login                                        │
│   ├─ Vite intercepts: /auth/*                                  │
│   ├─ Rewrites to: http://localhost:8080/auth/login            │
│   └─ Forwards request to API Gateway                           │
│                                                                 │
│ Step 3: API Gateway receives request                           │
│   ├─ URL: http://localhost:8080/auth/login                   │
│   ├─ Path matches route: /auth/**                             │
│   ├─ Queries Eureka: "Where is auth-service?"                │
│   └─ Result: localhost:8081                                   │
│                                                                 │
│ Step 4: API Gateway routes to Auth Service                     │
│   ├─ Uses load balancer: lb://auth-service                    │
│   ├─ Resolves to: http://localhost:8081                      │
│   └─ Forwards POST /auth/login request                         │
│                                                                 │
│ Step 5: Auth Service processes request                         │
│   ├─ Receives POST /auth/login                                │
│   ├─ Validates email/password                                  │
│   ├─ Creates JWT token                                         │
│   ├─ Prepares response                                         │
│   └─ Adds CORS headers to response                             │
│                                                                 │
│ Step 6: Auth Service sends response                            │
│   ├─ Status: 200 OK                                            │
│   ├─ Headers include:                                          │
│   │  ├─ Access-Control-Allow-Origin: http://localhost:5173   │
│   │  ├─ Access-Control-Allow-Credentials: true                │
│   │  └─ Content-Type: application/json                        │
│   ├─ Body: { token, user, role, ... }                         │
│   └─ Sends back through API Gateway                            │
│                                                                 │
│ Step 7: Response goes back through Gateway                     │
│   ├─ API Gateway receives response                             │
│   ├─ Forwards to Vite proxy                                    │
│   └─ Sends back to Frontend                                    │
│                                                                 │
│ Step 8: Browser receives response                              │
│   ├─ Checks origin: localhost:5173 ✓ (matches request)        │
│   ├─ Checks CORS header: localhost:5173 ✓ (matches origin)    │
│   ├─ CORS check PASSES ✓                                       │
│   ├─ JavaScript can access response data                       │
│   └─ Browser does NOT block it                                 │
│                                                                 │
│ Step 9: Frontend processes response                            │
│   ├─ JavaScript receives { token, user, role }                │
│   ├─ Stores token in localStorage                              │
│   ├─ Updates user state                                        │
│   ├─ Redirects to dashboard                                    │
│   └─ User sees: LOGIN SUCCESS ✓                               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Service Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES TOPOLOGY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      Eureka Server                               │
│                    (Service Registry)                            │
│                      Port 8761                                   │
│                                                                  │
│         ┌────────────────────────────────────────┐              │
│         │  Services Registered:                  │              │
│         │  - auth-service: localhost:8081        │              │
│         │  - admin-catalogue-service: localhost:8082 │          │
│         │  - cart-orders-service: localhost:8083 │              │
│         │  - analytics-service: localhost:8085   │              │
│         │  - payment-service: localhost:8086     │              │
│         └────────────────────────────────────────┘              │
│                                                                  │
│                          ▲                                       │
│                          │ Queries                               │
│                          │                                       │
│         ┌────────────────┴────────────────┐                    │
│         │                                 │                    │
│         │                                 │                    │
│    ┌────▼─────────────┐          ┌───────▼────────┐           │
│    │  API Gateway     │          │  Frontend      │           │
│    │  Port 8080       │          │  Port 5173     │           │
│    │                  │          │                │           │
│    │ Routes Requests: │          │ - React App    │           │
│    │ ┌──────────────┐ │          │ - Makes API    │           │
│    │ │/auth/** → 8081      │          │   calls via │           │
│    │ │/medicines/** → 8082 │          │   Vite Proxy│           │
│    │ │/api/cart/** → 8083  │          └────┬───────┘           │
│    │ │/api/orders/** → 8083│               │                   │
│    │ │/api/analytics/** →8085              │                   │
│    │ │/api/payment/** → 8086│              │                   │
│    │ └──────────────┘ │          └────┬───────┘                │
│    └────┬─────────────┘               │                        │
│         │                             │                        │
│         │ Routes to:                  │ Proxy to:              │
│         │                             │                        │
│    ┌────┴──────────────────────┬──────┘                        │
│    │                           │                               │
│    ▼                           ▼                               │
│    ┌──────────────────────────────────────┐                  │
│    │      All Microservices Get           │                  │
│    │    CORS Headers Configured          │                  │
│    │  Origins: {"localhost:5173"}        │                  │
│    │                                      │                  │
│    │  ┌─────────────────────────────┐    │                  │
│    │  │ 8081 - Auth Service         │    │                  │
│    │  │ - Login                     │    │                  │
│    │  │ - Register                  │    │                  │
│    │  │ - User Profile              │    │                  │
│    │  └─────────────────────────────┘    │                  │
│    │                                      │                  │
│    │  ┌─────────────────────────────┐    │                  │
│    │  │ 8082 - Catalogue Service    │    │                  │
│    │  │ - Medicines                 │    │                  │
│    │  │ - Batches                   │    │                  │
│    │  │ - Prescriptions             │    │                  │
│    │  └─────────────────────────────┘    │                  │
│    │                                      │                  │
│    │  ┌─────────────────────────────┐    │                  │
│    │  │ 8083 - Cart/Orders Service  │    │                  │
│    │  │ - Cart Management           │    │                  │
│    │  │ - Orders                    │    │                  │
│    │  │ - Addresses                 │    │                  │
│    │  └─────────────────────────────┘    │                  │
│    │                                      │                  │
│    │  ┌─────────────────────────────┐    │                  │
│    │  │ 8085 - Analytics Service    │    │                  │
│    │  │ - Dashboard                 │    │                  │
│    │  │ - Reports                   │    │                  │
│    │  └─────────────────────────────┘    │                  │
│    │                                      │                  │
│    │  ┌─────────────────────────────┐    │                  │
│    │  │ 8086 - Payment Service      │    │                  │
│    │  │ - Process Payments          │    │                  │
│    │  │ - Transactions              │    │                  │
│    │  └─────────────────────────────┘    │                  │
│    │                                      │                  │
│    └──────────────────────────────────────┘                  │
│                                                                  │
│                    All Connected via                            │
│              Service Discovery (Eureka)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. CORS Decision Tree

```
┌─────────────────────────────────────┐
│  Browser Makes Cross-Origin Request │
│  From: http://localhost:5173        │
│  To:   http://localhost:8080/...    │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Same Protocol? │ (HTTP vs HTTPS)
        └──┬──────────┬──┘
           │          │
       YES │          │ NO
           ▼          ▼
          ✓          ✗ CORS Error
           │
           ▼
        ┌────────────────┐
        │ Same Domain?   │ (localhost vs example.com)
        └──┬──────────┬──┘
           │          │
       YES │          │ NO
           ▼          ▼
          ✓          ✗ CORS Error
           │
           ▼
        ┌────────────────┐
        │ Same Port?     │ (5173 vs 8080)
        └──┬──────────┬──┘
           │          │
       YES │          │ NO
           ▼          ▼
          ✓          ✗ CORS Error
           │
           ▼
    Different Origin!
    (Different port = different origin)
           │
           ▼
    ┌────────────────────────┐
    │ Check CORS Headers:    │
    │ Access-Control-Allow-  │
    │ Origin                 │
    └────────┬───────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ Header value matches request│
    │ origin?                     │
    │                             │
    │ http://localhost:5173 == ?  │
    └──┬────────────────────┬─────┘
       │                    │
    YES│                    │NO
       ▼                    ▼
      ✓ OK                 ✗ CORS
    Access                 Error
    Allowed                Blocked
```

---

## 6. The Three Fixes Visualized

```
┌──────────────────────────────────────────────────────────────┐
│              THREE FIXES THAT SOLVED ALL ISSUES              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  FIX 1: Eureka Service Registration                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Changed: eureka.instance.prefer-ip-address = true      │ │
│  │ To:      eureka.instance.prefer-ip-address = false     │ │
│  │          eureka.instance.hostname = localhost          │ │
│  │                                                         │ │
│  │ Effect:  Services return localhost instead of IP       │ │
│  │          All requests use same origin (localhost)      │ │
│  │          No CORS origin mismatch                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  FIX 2: CORS Controller Configuration                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Changed: @CrossOrigin(origins = "*")                   │ │
│  │ To:      @CrossOrigin(                                 │ │
│  │            origins = {"localhost:5173", ...},          │ │
│  │            allowCredentials = true,                    │ │
│  │            methods = {...},                            │ │
│  │            maxAge = 3600                               │ │
│  │          )                                             │ │
│  │                                                         │ │
│  │ Effect:  Responses include proper CORS headers         │ │
│  │          Browser allows JavaScript access              │ │
│  │          Secure specific origin configuration          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  FIX 3: Frontend Vite Proxy                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Added: server.proxy configuration                      │ │
│  │   proxy: {                                             │ │
│  │     '/api': {                                          │ │
│  │       target: 'http://localhost:8080',                │ │
│  │       changeOrigin: true,                              │ │
│  │       ...                                              │ │
│  │     }                                                  │ │
│  │   }                                                    │ │
│  │                                                         │ │
│  │ Effect:  All API calls go through Vite dev server     │ │
│  │          Then to API Gateway                           │ │
│  │          Centralized routing                           │ │
│  │          Consistent origin (localhost:5173)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Before vs After Comparison

```
┌──────────────────────────────────────────────────────────────┐
│              BEFORE vs AFTER COMPARISON                      │
├────────────────────┬─────────────────────────────────────────┤
│ ASPECT             │ BEFORE ❌ vs AFTER ✅                  │
├────────────────────┼─────────────────────────────────────────┤
│ Service Discovery  │ ❌ IP addresses (192.168.0.107)        │
│                    │ ✅ Hostnames (localhost)                │
├────────────────────┼─────────────────────────────────────────┤
│ CORS Configuration │ ❌ Allow all origins (*)               │
│                    │ ✅ Specific origins only               │
├────────────────────┼─────────────────────────────────────────┤
│ Frontend Routing   │ ❌ Direct to services                   │
│                    │ ✅ Through API Gateway                 │
├────────────────────┼─────────────────────────────────────────┤
│ Request Origin     │ ❌ Mixed origins (5173 + various IPs)  │
│                    │ ✅ Consistent (localhost:5173)         │
├────────────────────┼─────────────────────────────────────────┤
│ Credentials        │ ❌ Not configured                       │
│                    │ ✅ Properly configured                 │
├────────────────────┼─────────────────────────────────────────┤
│ HTTP Methods       │ ❌ No restrictions                      │
│                    │ ✅ Specific methods only               │
├────────────────────┼─────────────────────────────────────────┤
│ Login Success Rate │ ❌ 0% (CORS errors)                    │
│                    │ ✅ 100% (fully working)                │
├────────────────────┼─────────────────────────────────────────┤
│ API Calls          │ ❌ Fail with 404/CORS errors          │
│                    │ ✅ All succeed                         │
├────────────────────┼─────────────────────────────────────────┤
│ User Experience    │ ❌ "Something went wrong" messages      │
│                    │ ✅ Smooth navigation                   │
└────────────────────┴─────────────────────────────────────────┘
```

---

## 8. Port Communication Diagram

```
FRONTEND                API GATEWAY            MICROSERVICES
localhost:5173    ←→    localhost:8080    ←→    localhost:8081-8086

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Frontend    │       │  API         │       │  Auth        │
│  5173        │◄─────►│  Gateway     │◄─────►│  Service     │
│              │       │  8080        │       │  8081        │
└──────────────┘       │              │       └──────────────┘
                       │  Routes:     │
   Vite Proxy          │  /auth/** →  │       ┌──────────────┐
   5173→8080           │  8081        │◄─────►│  Catalogue   │
                       │              │       │  Service     │
                       │  /medicines→ │       │  8082        │
                       │  8082        │       └──────────────┘
                       │              │
                       │  /cart/** →  │       ┌──────────────┐
                       │  8083        │◄─────►│  Cart/Order  │
                       │              │       │  Service     │
                       │  /analytics→ │       │  8083        │
                       │  8085        │       └──────────────┘
                       │              │
                       │  /payment → │        ┌──────────────┐
                       │  8086       │◄─────►│  Analytics   │
                       └──────────────┘       │  8085        │
                                              └──────────────┘
                       Service Discovery
                       (Eureka on 8761)       ┌──────────────┐
                                              │  Payment     │
                                              │  8086        │
                                              └──────────────┘
```

---

All diagrams show how the system flows after the fixes are applied. The key is that all requests now:
1. Use consistent origins (localhost)
2. Go through the API Gateway
3. Have proper CORS headers
4. Use service discovery with hostnames, not IPs

This resolves all three errors (CORS, 404, net::ERR_FAILED) completely!

