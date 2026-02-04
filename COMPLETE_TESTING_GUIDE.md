# 🚀 COMPLETE FIX TESTING GUIDE - 400 ERROR RESOLUTION

## ✅ What Was Fixed

| Component | Issue | Fix |
|-----------|-------|-----|
| **Backend OrderController** | No detailed error messages in 400 response | Added Map-based error responses with detailed info |
| **Frontend client.js** | userId=0 not sent as X-User-Id header | Changed validation from truthiness to null/undefined check |
| **Frontend orderService.js** | addressId validation too weak | Added explicit null/undefined/empty string checks |
| **Frontend CheckoutPage.jsx** | Already correct | Verified button disabled when no address selected |

---

## 📋 Pre-Testing Checklist

- [ ] Backend rebuild completed: `mvn clean package -DskipTests` ✅
- [ ] Frontend rebuild completed: `npm run build` ✅
- [ ] Both services JAR files updated in target folders
- [ ] Old services stopped (if running)
- [ ] Browser cache cleared (Ctrl+Shift+Del)
- [ ] localStorage checked for existing session

---

## 🧪 STEP-BY-STEP TEST PROCEDURE

### Phase 1: Start Services

#### 1. Start Backend Services (in order):
```bash
# Terminal 1 - Eureka Server (port 8761)
cd microservices\eureka-server
java -jar target\eureka-server-1.0.0.jar

# Terminal 2 - API Gateway (port 8080)
cd microservices\api-gateway
java -jar target\api-gateway-1.0.0.jar

# Terminal 3 - Auth Service (port 8081)
cd microservices\auth-service
java -jar target\auth-service-1.0.0.jar

# Terminal 4 - Admin-Catalogue Service (port 8082)
cd microservices\admin-catalogue-service
java -jar target\admin-catalogue-service-1.0.0.jar

# Terminal 5 - Cart-Orders Service (port 8083)
cd microservices\cart-orders-service
java -jar target\cart-orders-service-1.0.0.jar

# Terminal 6 - Frontend (port 5173)
cd frontend
npm run dev
```

#### 2. Verify All Services Running:
```bash
# In browser, check:
http://localhost:8761          # Eureka - should see all services registered
http://localhost:5173          # Frontend - should load
```

---

### Phase 2: User Flow Testing

#### Test 2.1: Login / OTP Flow
```
1. Navigate to http://localhost:5173
2. Click "Login" or "New Account"
3. Fill in details (email, password)
4. If "New Account", proceed through signup
5. Enter OTP (any 6 digits in test mode)
6. ✅ EXPECTED: Redirected to home page, "Hello [User]" shown
7. ✅ VERIFY in DevTools Console:
   - Should see: "✅ User logged in"
   - Should see: "✅ Auth state initialized"
```

**Browser Console Check**:
```javascript
// Check localStorage
localStorage.getItem("userId")       // Should show user ID (e.g., "7")
localStorage.getItem("accessToken")  // Should show JWT token
localStorage.getItem("userName")     // Should show user name

// Check Redux auth state
store.getState().auth.userId         // Should be numeric
store.getState().auth.token          // Should be JWT string
store.getState().auth.user           // Should be object with user details
```

---

#### Test 2.2: Browse Medicines & Add to Cart
```
1. Click "Shop Medicines" or browse category
2. View medicine list
3. Click "Add to Cart" on any medicine
4. ✅ EXPECTED: Toast notification "Added to cart"
5. ✅ VERIFY: Cart count increases in header
6. Add 2-3 different medicines to cart
```

**Browser Console Check**:
```javascript
// Check cart state
store.getState().cart.items        // Should have items array
store.getState().cart.items.length // Should be > 0
store.getState().cart.items[0]     // Should show {id, name, quantity, price}
```

---

#### Test 2.3: View Cart
```
1. Click "View Cart" or cart icon
2. ✅ EXPECTED: See list of medicines added
3. ✅ EXPECTED: See quantity selectors
4. ✅ EXPECTED: See "Proceed to Checkout" button
5. Click "Proceed to Checkout"
```

---

#### Test 2.4: CRITICAL TEST - Checkout (Address Selection)
```
1. ✅ EXPECTED: CheckoutPage loads
   - No "Please login to continue" message
   - Shows order summary
   - Shows address dropdown

2. Select an address from dropdown
   ✅ EXPECTED: Address shown as selected

3. ✅ VERIFY in DevTools Console:
   - Should see: "✅ User auth state loaded"
   - Should see: "getAddresses called"
   - Should see: "GET /api/address response: [...]"

4. ✅ VERIFY Button State:
   - If address selected: Button should be GREEN (enabled)
   - If no address selected: Button should be GRAY (disabled)
```

**Browser Console Check**:
```javascript
// Check addresses loaded
store.getState().checkout?.addresses  // Should be array with at least 1 address
store.getState().checkout?.selectedAddress // Should show selected address ID

// Check Redux auth still there
store.getState().auth.userId        // Should still be present (not cleared)
```

---

### Phase 3: 🔥 THE CRITICAL TEST - Place Order (This is where 400 happened)

#### Test 3.1: Validate X-User-Id Header Is Sent

**IMPORTANT**: Open DevTools **BEFORE** clicking "Proceed to Payment"

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Refresh page to clear old requests**
4. **Select an address** in the dropdown
5. **Click "Proceed to Payment"** button

**EXPECTED in Console**:
```
✅ Validated addressId: 1
📤 Sending POST /api/orders/place with params: {addressId: 1}
👤 User ID added to request {userId: 7, url: '/api/orders/place'}
```

**EXPECTED in Network tab**:
```
Request URL: POST http://localhost:5173/api/orders/place?addressId=1
Status: 200 (NOT 400!)

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
  X-User-Id: 7                    ← ✅ THIS MUST BE PRESENT!
  Content-Type: application/json

Query String:
  addressId: 1                    ← ✅ THIS MUST BE PRESENT!

Response Body:
{
  "id": 1,
  "userId": 7,
  "addressId": 1,
  "status": "PENDING",
  "createdAt": "2026-02-02T22:50:00",
  "totalAmount": 1500.00,
  "items": [...]
}
```

---

#### Test 3.2: If You See 400 Error (Debug Steps)

**If Network tab shows 400 instead of 200**:

1. **Check Response Body**:
   - Should show: `{"error": "...", "status": "failed"}`
   - Note the exact error message

2. **Check Console Logs**:
   ```javascript
   // Run these commands in console
   console.log("User ID:", localStorage.getItem("userId"));
   console.log("Token:", localStorage.getItem("accessToken")?.substring(0, 20) + "...");
   console.log("Selected Address:", store.getState().checkout?.selectedAddress);
   console.log("Cart Items:", store.getState().cart?.items?.length);
   ```

3. **Check Backend Logs**:
   - Look at Terminal 5 (cart-orders-service)
   - Should see logs like:
     ```
     📍 /api/orders/place called
     X-User-Id header: '7'
     addressId param: '1'
     ✅ Parsed userId: 7, addressId: 1
     ✅ Order created with ID: 1
     ```

---

### Phase 4: ✅ Success - Continue to Payment Flow

**ONLY if Phase 3 returns 200 with OrderDTO**:

#### Test 4.1: Redirected to Payment Method Selection
```
1. ✅ EXPECTED: Redirected to /payment/select
2. ✅ EXPECTED: See "Select Payment Method"
3. ✅ EXPECTED: See two options:
   - "Credit/Debit Card"
   - "Wallet" (if implemented)
4. ✅ EXPECTED: See order total displayed
```

**Browser Console Check**:
```javascript
// Check order in Redux state
store.getState().checkout?.currentOrder  // Should have order details
```

---

#### Test 4.2: Card Payment Form
```
1. Click "Credit/Debit Card"
2. ✅ EXPECTED: CardPayment component loads
3. Fill in form:
   - Card Number: 4111111111111111 (test card)
   - Expiry: 12/25
   - CVV: 123
   - Cardholder Name: Test User
4. ✅ EXPECTED: Real-time validation feedback
5. Submit form
```

---

#### Test 4.3: Success Page
```
1. ✅ EXPECTED: Redirected to /payment/success
2. ✅ EXPECTED: See "Order Successfully Placed!"
3. ✅ EXPECTED: See order details:
   - Order ID
   - Total amount
   - Items ordered
   - Estimated delivery
```

---

## 🔍 Diagnostic Console Commands

Run these in browser DevTools Console to verify fixes:

```javascript
// Check if fixes are active
console.log("===== AUTHENTICATION STATE =====");
console.log("Redux Auth State:", store.getState().auth);
console.log("localStorage userId:", localStorage.getItem("userId"));
console.log("localStorage token:", localStorage.getItem("accessToken")?.substring(0, 30) + "...");

console.log("\n===== CHECKOUT STATE =====");
console.log("Addresses:", store.getState().checkout?.addresses);
console.log("Selected Address:", store.getState().checkout?.selectedAddress);
console.log("Current Order:", store.getState().checkout?.currentOrder);

console.log("\n===== CART STATE =====");
console.log("Cart Items:", store.getState().cart?.items);
console.log("Cart Total:", store.getState().cart?.total);

console.log("\n===== REQUEST VALIDATION =====");
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("accessToken");
console.log("X-User-Id will be sent as:", userId);
console.log("Authorization will be sent as:", token ? "Bearer <token>" : "NOT SENT");
console.log("⚠️ If userId is null/undefined, 400 error will occur");
console.log("⚠️ If token is null/undefined, 401 error will occur");
```

---

## 📊 Expected vs Actual Results

### Test Case 1: User Not Logged In
```
Expected: Cannot access /payment (redirected to login)
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 2: Logged In, No Cart Items
```
Expected: CheckoutPage shows "Cart is empty"
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 3: Logged In, Cart Items, No Address
```
Expected: "Proceed to Payment" button is DISABLED (gray)
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 4: Logged In, Cart Items, Address Selected
```
Expected: Click "Proceed to Payment" → 
          GET /api/orders/place returns 200 with OrderDTO
Actual: [Your result - Check Network tab status]
Status: [ ] ✅ PASS [ ] ❌ FAIL

Response Status Code: [___]
```

### Test Case 5: Verify X-User-Id Header
```
Expected: Network tab shows X-User-Id: 7 in Request Headers
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 6: Verify addressId Parameter
```
Expected: Network tab shows addressId=1 in Query String
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 7: Payment Method Selection
```
Expected: Page shows payment method options
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 8: Card Payment Form
```
Expected: Form validates input, accepts valid card, rejects invalid
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

### Test Case 9: Success Page
```
Expected: Shows order confirmation and order details
Actual: [Your result]
Status: [ ] ✅ PASS [ ] ❌ FAIL
```

---

## 🆘 Troubleshooting

### Problem: Still Getting 400 Error

**Step 1**: Verify builds were successful
```bash
# Check if cart-orders-service JAR has new code
dir "microservices\cart-orders-service\target\*.jar"
# Should show cart-orders-service-1.0.0.jar

# Check if frontend dist has new code
dir "frontend\dist\*.js" | head -5
# Should show recent modification date
```

**Step 2**: Force clear cache
```bash
# Browser DevTools (F12)
→ Application → Storage
→ Clear site data for localhost:5173
→ Refresh page (Ctrl+Shift+R hard refresh)
```

**Step 3**: Verify services restarted with new builds
```bash
# Kill old processes and restart with new JARs
# Check that Terminal 5 shows NEW jar file being loaded
```

### Problem: Button Still Disabled When Address Selected

**Debug**:
```javascript
// In console:
store.getState().checkout?.selectedAddress  // Should not be null
store.getState().cart?.items?.length        // Should be > 0
store.getState().auth?.userId               // Should not be null
```

If any of these are null, the button stays disabled (by design).

### Problem: X-User-Id Header Not Showing in Network Tab

**Check**:
1. localStorage.getItem("userId") returns null?
   → User not logged in properly → Login again

2. Token is there but header missing?
   → Frontend needs rebuild → `npm run build`

3. Header shows in some requests but not /api/orders/place?
   → Check if that endpoint requires X-User-Id in backend
   → OrderController expects it → Check if it's being sent

---

## ✅ SUCCESS CRITERIA

**All tests PASS if**:
1. ✅ User can login/OTP
2. ✅ User can add items to cart
3. ✅ CheckoutPage loads without "Please login" error
4. ✅ Addresses load in dropdown
5. ✅ Button disabled when no address selected
6. ✅ X-User-Id header present in network requests
7. ✅ addressId query param present in network requests
8. ✅ POST /api/orders/place returns 200 (not 400)
9. ✅ Response contains OrderDTO with order details
10. ✅ Redirects to payment method selection
11. ✅ Payment flow continues to success page

---

## 📝 Log Observations

### Good Logs (Backend - cart-orders-service):
```
📍 /api/orders/place called
X-User-Id header: '7'
addressId param: '1'
✅ Parsed userId: 7, addressId: 1
✅ Order created with ID: 1
```

### Bad Logs (Indicates 400 error):
```
❌ MISSING X-User-Id header
❌ MISSING addressId parameter
❌ Invalid format - userId: 'abc', addressId: 'xyz'
```

---

## 🎯 Final Checklist

After all tests complete:

- [ ] Verified backend compiled successfully
- [ ] Verified frontend compiled successfully
- [ ] Services started in correct order
- [ ] User login works
- [ ] Cart operations work
- [ ] Checkout page loads
- [ ] Address selection works
- [ ] X-User-Id header is sent
- [ ] addressId parameter is sent
- [ ] Order placement returns 200 (not 400)
- [ ] Payment flow continues
- [ ] Success page displays

**If all checked ✅**: 400 error is FIXED! 🎉

---

**Documentation Date**: 2026-02-02
**Fixes Applied**: OrderController, client.js, orderService.js
**Build Status**: ✅ Frontend and Backend both successful
