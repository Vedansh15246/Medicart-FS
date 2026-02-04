# 🧪 QUICK TEST GUIDE - Payment Flow

## ✅ All 3 Critical Issues Fixed

1. ✅ Cart data lost on refresh → **FIXED**: Now syncs from backend
2. ✅ Duplicate payment error → **FIXED**: Updates existing payment instead
3. ✅ Cart not cleared from DB → **FIXED**: Cleared after successful payment

---

## 🚀 Start Services

### Terminal 1: Payment Service
```bash
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\payment-service"
mvn spring-boot:run
```
Expected: ✅ Running on port 8086

### Terminal 2: Cart-Orders Service
```bash
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\cart-orders-service"
mvn spring-boot:run
```
Expected: ✅ Running on port 8083

### Terminal 3: API Gateway
```bash
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\api-gateway"
mvn spring-boot:run
```
Expected: ✅ Running on port 8080

### Terminal 4: Admin Catalogue Service
```bash
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service"
mvn spring-boot:run
```
Expected: ✅ Running on port 8082

### Terminal 5: Frontend Dev Server
```bash
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\frontend"
npm run dev
```
Expected: ✅ Running on http://localhost:5173

---

## 📝 Test Scenario 1: Cart Persistence on Refresh

**Objective**: Verify cart data is NOT lost on page refresh

```
STEPS:
1. Open http://localhost:5173 in browser
2. Login with test account
3. Add medicine to cart (any item)
4. Go to Cart page
5. Note: Total amount should be > ₹40
6. Click "Checkout"
7. Select delivery address
8. Click "Proceed to Payment"
9. → Navigates to /payment/select
10. ✅ VERIFY: Total amount shown should be SAME as step 5
11. Refresh page (F5 or Ctrl+R)
12. ✅ VERIFY: Cart items still show in summary
13. ✅ VERIFY: Total amount still correct (not ₹40 dummy)

EXPECTED RESULTS:
✅ Total persists across refresh
✅ Cart items visible
✅ No "dummy" ₹40 delivery charge
✅ Real calculated total shown
```

---

## 📝 Test Scenario 2: Payment Processing (No Duplicate Error)

**Objective**: Verify payment succeeds and cart is cleared

```
STEPS:
1. Continue from previous test or start fresh
2. Add item to cart
3. Go to Checkout → Select address → "Proceed to Payment"
4. Select "Credit Card"
5. Fill form:
   - Card Number: 4111111111111111
   - Expiry Month: 12
   - Expiry Year: 25
   - CVV: 123
   - Cardholder Name: TEST USER
6. Click "Pay"
7. Wait 2-3 seconds...
8. ✅ VERIFY: Success page appears (NO error message)
9. ✅ VERIFY: Order ID shown
10. ✅ VERIFY: Order Number shown (e.g., ORD-2024-xxxxx)
11. ✅ VERIFY: Total amount shown

EXPECTED RESULTS:
✅ No "Duplicate entry" error
✅ Payment processed successfully
✅ Success page shown
✅ Order details displayed
```

---

## 📝 Test Scenario 3: Cart Cleared After Payment

**Objective**: Verify cart items removed from database after successful payment

```
STEPS:
1. Continue from previous test
2. From success page, note the Order ID (e.g., 11)
3. Click "Continue Shopping" or navigate to Cart
4. ✅ VERIFY: Cart page shows EMPTY (0 items)
5. ✅ VERIFY: No items listed
6. Go to Orders page (/orders)
7. ✅ VERIFY: New order appears in list
8. Click on the order to view details
9. ✅ VERIFY: Order shows status = CONFIRMED
10. ✅ VERIFY: Order shows all items that were in cart
11. ✅ VERIFY: Order shows correct total amount
12. ✅ VERIFY: Items show batch information

DATABASE VERIFICATION:
1. Open MySQL terminal
2. Run: USE cart_orders_db;
3. Run: SELECT * FROM cart_items WHERE user_id = 101;
4. ✅ VERIFY: Result is EMPTY (0 rows)
5. Run: SELECT * FROM orders WHERE id = 11;
6. ✅ VERIFY: Order exists with status = CONFIRMED
7. Run: SELECT * FROM order_items WHERE order_id = 11;
8. ✅ VERIFY: Shows all items from original cart

EXPECTED RESULTS:
✅ Cart is empty after payment
✅ Order created with correct items
✅ Order status = CONFIRMED
✅ All items moved from cart to order
✅ Database cart_items table empty for user
```

---

## 📝 Test Scenario 4: UPI Payment

**Objective**: Test alternative payment method

```
STEPS:
1. Add item to cart
2. Checkout → Select address → "Proceed to Payment"
3. Select "UPI Payment"
4. Enter UPI ID: testuser@okhdfcbank
5. Click "Pay"
6. ✅ VERIFY: Success page appears
7. ✅ VERIFY: Cart is empty
8. ✅ VERIFY: Order appears in /orders

EXPECTED RESULTS:
✅ UPI payment processed
✅ Same cart clearing logic works
✅ Order created successfully
```

---

## 📝 Test Scenario 5: Net Banking Payment

**Objective**: Test another payment method

```
STEPS:
1. Add item to cart
2. Checkout → Select address → "Proceed to Payment"
3. Select "Net Banking"
4. Select bank: HDFC Bank
5. Click "Pay"
6. ✅ VERIFY: Success page appears
7. ✅ VERIFY: Cart is empty
8. ✅ VERIFY: Order appears in /orders

EXPECTED RESULTS:
✅ Net Banking payment processed
✅ Same cart clearing logic works
✅ Order created successfully
```

---

## 🔍 Console/Log Verification

### Frontend Console
```
Expected logs when navigating to /payment/select:
📍 PaymentSelect: Syncing cart from backend
✅ Cart fetched from backend
```

### Backend Console (Payment Service)
```
Expected logs during payment:
📍 /api/payment/process called
✅ Checking for existing payment...
✅ Payment processing...
✅ Payment saved successfully
✅ Clearing cart...
✅ Cart cleared
```

### Backend Console (Cart-Orders Service)
```
Expected logs:
📍 POST /api/orders/place called
✅ Order created
📍 DELETE /api/cart/clear called
✅ Cart items deleted
```

---

## ❌ If You See Errors

### Error 1: "Duplicate entry '11' for key 'payments.unique_order_payment'"
**Solution**: This error should NOT appear with the fix. If it does:
1. Rebuild payment-service: `mvn clean package -DskipTests`
2. Restart payment service
3. Try payment again

### Error 2: Cart shows ₹40 on refresh
**Solution**: PaymentSelect is not fetching cart
1. Rebuild frontend: `npm run build`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh: Ctrl+Shift+R
4. Try again

### Error 3: Cart not empty after payment
**Solution**: Cart clearing endpoint might not be called
1. Check browser console for errors
2. Check backend logs for warning: "Failed to clear cart"
3. Rebuild cart-orders-service: `mvn clean package -DskipTests`
4. Restart cart-orders service

---

## 📊 Success Criteria

### All Tests Pass If:
- [ ] Cart data persists on refresh (not ₹40 dummy)
- [ ] Payment succeeds without duplicate error
- [ ] Success page shown with order details
- [ ] Cart is empty after payment
- [ ] Order appears in /orders with CONFIRMED status
- [ ] Database shows cart_items = 0 for user
- [ ] Order items show correct medicine and quantities
- [ ] UPI and Net Banking also work

---

## 🎯 Next Steps

If all tests pass:
1. ✅ System is production-ready
2. ✅ Can deploy to staging/production
3. ✅ All payment flows working end-to-end

If any test fails:
1. Check error logs in backend console
2. Check browser console (F12 → Console tab)
3. Verify all services are running
4. Check database connections
5. Rebuild affected service
6. Try test again

---

## 📞 Support

**Issues to check:**
- Port conflicts (8080, 8083, 8086)
- MySQL running and accessible
- All services registered with Eureka
- JWT tokens valid
- X-User-Id header being sent

**Quick restart all:**
```bash
# Kill all Java processes
taskkill /F /IM java.exe

# Then start services one by one from their terminals
```

