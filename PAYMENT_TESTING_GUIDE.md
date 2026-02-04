# 🧪 Payment Integration Testing Guide

## ✅ Prerequisites

Before testing, ensure:
- ✅ Frontend built successfully (`npm run build` completed)
- ✅ All microservices running (auth, admin-catalogue, cart-orders, payment)
- ✅ MySQL database seeded with medicines and test data
- ✅ API Gateway running and routing to services
- ✅ Eureka service discovery running

## 🚀 Step-by-Step Testing

### Step 1: Start Frontend Dev Server
```powershell
cd "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\frontend"
npm run dev
```
- Opens at `http://localhost:5174`
- Should see MediCart homepage with medicine catalog

### Step 2: User Authentication (Login or Register)

#### Option A: Login with Existing User
```
Email: user@example.com
Password: password123
```

#### Option B: Register New User
1. Click "Sign Up"
2. Fill in details:
   - Name: Test User
   - Email: testuser@example.com
   - Password: Test@123
3. Click Register
4. Receive OTP (check console logs for OTP)
5. Enter OTP and verify
6. **Verify**: userId stored in localStorage
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('userId'))
   console.log(localStorage.getItem('accessToken'))
   ```

### Step 3: Add Medicines to Cart
1. Browse medicines on homepage
2. Click "Add to Cart" on any medicine
3. **Verify**: No 403 error (userId is being sent)
4. Add 2-3 different medicines
5. **Verify**: Cart icon shows count
6. Click cart to view items

### Step 4: Proceed to Checkout
1. On CartPage, click "Proceed to Checkout"
2. **Verify**: Redirected to CheckoutPage
3. **Verify**: Cart summary shows:
   - ✅ All items with quantities
   - ✅ Correct prices (from product.price * qty)
   - ✅ Subtotal calculation
   - ✅ Tax (18%)
   - ✅ Delivery charges (free if > ₹500, else ₹40)
   - ✅ Total amount

### Step 5: Select Delivery Address
1. On CheckoutPage, select delivery address
   - Or add new address if none exist
2. **Verify**: Address dropdown works
3. Click "Proceed to Payment" button
4. **Verify**: Redirected to `/payment/select`

### Step 6: Payment Selection Screen
**URL**: `http://localhost:5174/payment/select`

✅ **Verify Display**:
- Order summary with correct totals
- 4 payment method options visible:
  - 💳 Credit Card
  - 💳 Debit Card
  - 📱 UPI Payment
  - 🏦 Net Banking
- Item count displayed
- Free delivery indicator (if applicable)

### Step 7: Credit Card Payment Flow
1. Click "Credit Card" option
2. **URL**: Should navigate to `/payment/card`

#### Step 7a: Card Payment Form
✅ **Verify Form Elements**:
- Cardholder Name input
- Card Number input (with formatting)
- Expiry Month (1-12 validation)
- Expiry Year (2-digit)
- CVV (3-4 digits)
- Amount display showing correct total
- "Pay ₹XXX Securely" button
- Security notice and test card info

#### Step 7b: Form Validation

**Test 1: Missing Fields**
- Leave cardholder name empty
- Click Pay
- **Verify**: Error: "Please fill all card details"

**Test 2: Invalid Card Number**
- Enter: `1234`
- Click Pay
- **Verify**: Error: "Invalid card number"

**Test 3: Invalid CVV**
- Card: `4532123456789010`
- CVV: `12`
- **Verify**: Error: "Invalid CVV"

**Test 4: Valid Test Card**
- Cardholder: `Test User`
- Card Number: `4532 1234 5678 9010` (auto-formatted)
- Expiry: `12/25`
- CVV: `123`
- Click Pay
- **Expected**: 
  - Button shows "Processing Payment..." with loading indicator
  - Payment API call made to backend
  - Navigate to `/payment/success`

### Step 8: Success Page
**URL**: `http://localhost:5174/payment/success`

✅ **Verify Display**:
- ✅ Success animation with checkmark
- ✅ "Payment Successful! 🎉" message
- ✅ Amount paid: `₹XXX.XX`
- ✅ Timestamp in correct format
- ✅ Payment ID displayed
- ✅ Transaction ID displayed
- ✅ Payment method: "💳 Credit Card"
- ✅ Status badge: "Completed"
- ✅ Next steps information
- ✅ Action buttons:
  - Download Receipt (gray button)
  - View Orders (blue button)
  - Continue Shopping (green button)
- ✅ Support contact info

### Step 9: Post-Payment Actions

**Test Continue Shopping**:
1. Click "Continue Shopping"
2. **Verify**: Redirected to `/`
3. **Verify**: Cart is cleared (count = 0)
4. **Verify**: Can add items again

**Test View Orders**:
1. Click "View Orders"
2. **Verify**: Redirected to `/orders`
3. **Verify**: New order appears in list
4. **Verify**: Order shows:
   - Order ID (should match)
   - Status
   - Total amount
   - Order date

## 🔍 Console Logging Verification

Open browser DevTools (F12) → Console tab

**During Payment Process, Should See**:
```
💳 Processing card payment {amount: 500.00, cardholder: "Test User"}
📤 Sending payment to backend {method: "CREDIT_CARD"}
✅ Payment processed successfully {paymentId: "PAY-...", transactionId: "TXN-..."}
```

**In CartSlice (Redux)**:
```
✅ Payment successful - clearing cart
```

## 🐛 Debugging Checklist

If payment fails:

1. **Check X-User-Id Header**:
   ```javascript
   // In browser console, check Network tab → any request
   // Should see header: X-User-Id: <userId>
   ```

2. **Check Cart State**:
   ```javascript
   // In Redux DevTools or console:
   // Open Redux DevTools Extension
   // Verify cart.items array is populated
   // Verify cart.loading = false
   ```

3. **Check localStorage**:
   ```javascript
   localStorage.getItem('userId')        // Should have UUID
   localStorage.getItem('accessToken')   // Should have JWT
   ```

4. **Backend Payment Service Logs**:
   - Check payment service logs for `/api/payment/process` calls
   - Verify orderId is received
   - Verify amount is correct
   - Check for any validation errors

5. **Network Tab (F12)**:
   - Check POST to `/api/payment/process`
   - Response should include `paymentId` and `transactionId`
   - Status code should be 200

## 📋 Test Scenarios

| Scenario | Steps | Expected Result | Status |
|----------|-------|-----------------|--------|
| **Happy Path** | Login → Add items → Checkout → Select payment → Pay | Order created, payment success page | ⏳ Test |
| **Invalid Card** | Enter 4-digit card number | Form validation error | ⏳ Test |
| **Missing CVV** | Leave CVV empty | Form validation error | ⏳ Test |
| **Expired Card** | Enter expired expiry (01/20) | Expiry validation error | ⏳ Test |
| **Multiple Items** | Add 5 items, different quantities | Correct total calculation | ⏳ Test |
| **Free Delivery** | Add items totaling > ₹500 | Delivery charge = FREE | ⏳ Test |
| **Tax Calculation** | Any order | Tax = 18% of subtotal | ⏳ Test |
| **Cart Clear** | After success, check cart | Cart items = 0 | ⏳ Test |
| **Continue Shopping** | From success page | Can add items again | ⏳ Test |

## 🎯 Success Criteria

✅ All tests should pass:
- [ ] Login/Register flow works
- [ ] Cart operations work (add, view, quantities correct)
- [ ] Checkout page displays correct totals
- [ ] Payment selection page displays all methods
- [ ] Card payment form validates inputs correctly
- [ ] Payment API called with correct data
- [ ] Success page displays transaction details
- [ ] Cart is cleared after payment
- [ ] Can continue shopping or view orders
- [ ] No console errors
- [ ] No Redux errors

## 🚨 Known Issues & Solutions

**Issue**: Button disabled after payment submission
**Solution**: Check if payment endpoint is responding correctly

**Issue**: Form validation showing false error
**Solution**: Clear localStorage and refresh page

**Issue**: X-User-Id not in request headers
**Solution**: 
1. Clear localStorage
2. Login again
3. Verify OtpPage extracts userId correctly

## 📞 Support Commands

**Check Logs**:
```javascript
// In browser console:
const logs = JSON.parse(localStorage.getItem('app_logs'));
console.table(logs.slice(-10));  // Last 10 logs
```

**Clear All State**:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Trigger Redux Update**:
```javascript
// Manually dispatch Redux action
store.dispatch(fetchCart());  // Sync cart from backend
```

---

## ✅ Ready to Test!

All components are ready. Start testing by:
1. Running frontend: `npm run dev`
2. Follow Step-by-Step Testing above
3. Report any issues with logs from console and Network tab
