# ✅ MediCart System Deployment Checklist

## Phase 1: Pre-Deployment ✅

### Code Compilation
- [x] API Gateway CORS configuration added
- [x] API Gateway compiles without errors
- [x] All 9 microservices previously compiled
- [x] Frontend APIs created/updated
- [x] MediCart Billing APIs created/updated

### Documentation
- [x] INTEGRATION_FIXES_GUIDE.md created
- [x] QUICK_START.md created
- [x] FIXES_SUMMARY.md created
- [x] This checklist created

---

## Phase 2: Pre-Startup ✅

### Database
- [x] MySQL or H2 database configured
- [x] db-setup.sql exists at `microservices/db-setup.sql`
- [x] All application.properties configured

### Microservice Dependencies
- [x] Eureka server pom.xml validated
- [x] API Gateway pom.xml validated
- [x] Auth Service pom.xml validated
- [x] Catalogue Service pom.xml validated
- [x] Cart-Orders Service pom.xml validated
- [x] Payment Service pom.xml validated

### Frontend Dependencies
- [x] `frontend/src/api/` folder complete
- [x] `frontend/src/components/cart/cartSlice.js` fixed
- [x] `frontend/src/features/payment/CheckoutPage.jsx` updated
- [x] `medicart-billing/src/api/` folder complete

---

## Phase 3: Startup (DO THIS IN ORDER)

### Terminal 1: Start Eureka Server
```bash
[ ] cd microservices/eureka-server
[ ] mvn spring-boot:run
[ ] Wait for: "Started EurekaServerApplication"
[ ] Verify: http://localhost:8761 accessible
```

### Terminal 2: Start API Gateway (CORS ✅)
```bash
[ ] cd microservices/api-gateway
[ ] mvn spring-boot:run
[ ] Wait for: "Started ApiGatewayApplication"
[ ] Check logs: "CorsWebFilter" mentioned
[ ] Verify: http://localhost:8080 accessible
```

### Terminal 3: Start Auth Service
```bash
[ ] cd microservices/auth-service
[ ] mvn spring-boot:run
[ ] Wait for: "Started AuthServiceApplication"
[ ] Check Eureka: Should see "AUTH-SERVICE" registered
```

### Terminal 4: Start Catalogue Service
```bash
[ ] cd microservices/admin-catalogue-service
[ ] mvn spring-boot:run
[ ] Wait for: "Started AdminCatalogueServiceApplication"
[ ] Check Eureka: Should see "ADMIN-CATALOGUE-SERVICE" registered
```

### Terminal 5: Start Cart-Orders Service
```bash
[ ] cd microservices/cart-orders-service
[ ] mvn spring-boot:run
[ ] Wait for: "Started CartOrdersServiceApplication"
[ ] Check Eureka: Should see "CART-ORDERS-SERVICE" registered
```

### Terminal 6: Start Payment Service
```bash
[ ] cd microservices/payment-service
[ ] mvn spring-boot:run
[ ] Wait for: "Started PaymentServiceApplication"
[ ] Check Eureka: Should see "PAYMENT-SERVICE" registered
```

### Terminal 7: Start Frontend
```bash
[ ] cd frontend
[ ] npm install (if needed)
[ ] npm run dev
[ ] Wait for: "Local: http://localhost:5173"
[ ] Open: http://localhost:5173 in browser
```

### Terminal 8: (Optional) Start MediCart Billing
```bash
[ ] cd medicart-billing
[ ] npm install (if needed)
[ ] npm run dev
[ ] Access: http://localhost:5174
```

---

## Phase 4: Verification

### Service Health
- [ ] Eureka Dashboard: http://localhost:8761
  - [ ] See 6 services registered
  - [ ] All services status "UP" (green)
  
- [ ] API Gateway: http://localhost:8080 (returns 404 is OK)
  - [ ] Gateway is listening
  - [ ] Ready to route requests

### Frontend Health
- [ ] Frontend loads: http://localhost:5173
  - [ ] No errors in console (F12)
  - [ ] Can see Home page
  
- [ ] Network tab (F12 → Network)
  - [ ] GET /medicines → 200 OK
  - [ ] No CORS errors ✅

### CORS Headers Verification
- [ ] Open DevTools → Network tab
- [ ] Make any request to /medicines
- [ ] Check Response Headers:
  ```
  Access-Control-Allow-Origin: http://localhost:5173 ✅
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS ✅
  Access-Control-Allow-Credentials: true ✅
  ```

---

## Phase 5: Functional Testing

### Authentication Flow
- [ ] Can see Register page at `/auth/register`
- [ ] Can register new user
  - Email: testuser@example.com
  - Password: Test@123456
  - Full Name: Test User
  - Phone: 9876543210
- [ ] POST /auth/register succeeds (200)
- [ ] Token saved in localStorage

### Login Flow
- [ ] Can see Login page at `/auth/login`
- [ ] Can login with registered credentials
- [ ] POST /auth/login succeeds (200)
- [ ] Redirected to home page
- [ ] Token in localStorage: `localStorage.accessToken`

### Medicines Browsing
- [ ] Home page shows medicines list
- [ ] GET /medicines request succeeds (200)
- [ ] No CORS errors in console ✅
- [ ] Can see medicines with prices

### Cart Operations
- [ ] Can click "Add to Cart" on medicine
- [ ] POST /api/cart/add succeeds (200)
- [ ] Cart count increments
- [ ] GET /api/cart returns cart items (200)
- [ ] Can update quantity (PUT /api/cart/update/{id})
- [ ] Can remove items (DELETE /api/cart/remove/{id})

### Checkout Flow
- [ ] Can navigate to `/payment` page
- [ ] Address dropdown loads (GET /api/address)
- [ ] Can select address
- [ ] Price breakdown shows:
  - [ ] Subtotal
  - [ ] Tax (18% GST)
  - [ ] Delivery charge
  - [ ] Total amount
- [ ] "Confirm & Pay" button enabled

### Order Placement
- [ ] Click "Confirm & Pay"
- [ ] POST /api/orders/place succeeds (200)
- [ ] Backend FIFO algorithm runs
- [ ] Receive order object with ID

### Payment Processing
- [ ] POST /api/payment/process succeeds (200)
- [ ] Receive payment confirmation
- [ ] Payment ID displayed
- [ ] Transaction ID displayed
- [ ] Cart cleared after payment

### Success Page
- [ ] Shows "Payment Successful" message
- [ ] Displays invoice with:
  - [ ] Order ID
  - [ ] Payment ID
  - [ ] Transaction ID
  - [ ] Items ordered
  - [ ] Price breakdown
  - [ ] Total amount
- [ ] Can download invoice (print)
- [ ] Can navigate back to home

### Order History
- [ ] Can navigate to `/orders` page
- [ ] GET /api/orders returns user's orders
- [ ] Shows completed order in list
- [ ] Can view order details

---

## Phase 6: MediCart Billing (Optional)

### Billing Dashboard
- [ ] Loads at http://localhost:5174
- [ ] Shows payment history (GET /api/payment/user/history)
- [ ] Lists past payments with:
  - [ ] Payment ID
  - [ ] Order ID
  - [ ] Amount
  - [ ] Status
  - [ ] Date

### Card Payment
- [ ] Can click "PROCEED TO PAY"
- [ ] Card payment form displays
- [ ] Form validation works:
  - [ ] Card number validation
  - [ ] Expiry month/year validation
  - [ ] CVV validation
- [ ] POST /api/payment/process succeeds
- [ ] Redirects to success page

### Success Page
- [ ] Shows payment confirmation
- [ ] Displays real invoice data from backend
- [ ] Payment status shows "SUCCESS"
- [ ] Can download invoice

---

## Phase 7: Error Scenarios (Optional)

### Network Errors
- [ ] Stop one microservice
- [ ] Try operation that needs it
- [ ] See appropriate error message
- [ ] Error message is user-friendly

### Invalid Data
- [ ] Try to add non-existent medicine to cart
- [ ] Try with invalid address ID
- [ ] Try to place order with 0 items
- [ ] All show appropriate error messages

### CORS Errors (Should NOT appear!)
- [ ] ❌ No "CORS policy blocked" errors
- [ ] ❌ No "Access denied" errors
- [ ] ❌ No preflight failures
- [ ] All cross-origin requests succeed ✅

---

## Phase 8: Performance & Logging

### Logging
- [ ] API Gateway logs include route info
- [ ] Microservice logs show requests processed
- [ ] No ERROR or WARN spam
- [ ] Token validation messages appear

### Performance
- [ ] Cart loads within 2 seconds
- [ ] Order placement within 3 seconds
- [ ] Payment processing within 2 seconds
- [ ] UI responsive (no lag)

### Resource Usage
- [ ] No memory leaks evident
- [ ] Reasonable CPU usage
- [ ] No database connection errors

---

## Phase 9: Final Verification

### System Status
- [ ] All 8 services running (6 microservices + 2 frontends)
- [ ] All services registered in Eureka
- [ ] No service restarts or crashes
- [ ] No unhandled exceptions

### User Journey
- [ ] Can complete full order from register to payment
- [ ] No CORS errors at any point
- [ ] All requests succeed with appropriate responses
- [ ] Data persists in database

### Integration Points
- [ ] Frontend ↔ API Gateway: ✅
- [ ] API Gateway ↔ Auth Service: ✅
- [ ] API Gateway ↔ Catalogue Service: ✅
- [ ] API Gateway ↔ Cart-Orders Service: ✅
- [ ] Cart-Orders ↔ Catalogue (Feign): ✅
- [ ] API Gateway ↔ Payment Service: ✅
- [ ] Payment ↔ Cart-Orders (Feign): ✅

---

## 📋 Sign-Off

| Component | Verified By | Date | Status |
|-----------|------------|------|--------|
| API Gateway CORS | ✅ | 2026-01-30 | ✅ |
| Frontend APIs | ✅ | 2026-01-30 | ✅ |
| Order Flow | 👉 | - | Pending |
| Payment Flow | 👉 | - | Pending |
| Full System | 👉 | - | Pending |

---

## 🎯 Deployment Complete When:

1. ✅ Code compiled and deployed to all services
2. ✅ All 8 services running and registered
3. ✅ No CORS errors in console
4. ✅ Can register and login
5. ✅ Can browse medicines
6. ✅ Can add to cart and checkout
7. ✅ Can place order (FIFO works)
8. ✅ Can process payment
9. ✅ Can see payment history in billing
10. ✅ All requests show proper response headers

---

## 🆘 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| CORS errors | Check API Gateway logs for CorsWebFilter |
| Cart empty | Reload page - syncs from backend |
| Can't place order | Select address first |
| Payment fails | Check payment-service logs |
| Microservice down | Check Eureka dashboard |
| Frontend not loading | Check npm errors, try `npm install` |
| Token invalid | Clear localStorage, login again |
| Database errors | Ensure MySQL running, check db-setup.sql |

---

**Total Steps**: 100+  
**Estimated Time**: 15-30 minutes  
**Success Criteria**: All checkboxes checked ✅

**Start Now!** → Follow Phase 3 for startup procedure
