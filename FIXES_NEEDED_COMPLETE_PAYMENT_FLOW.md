# 🔧 Three Critical Fixes for Payment Flow

## Issue 1: Cart Not Clearing After Payment ❌

### Current Problem:
- User pays successfully
- Order is created and status changed to CONFIRMED
- Cart items remain in database
- Cart shows old items on next page load

### Root Cause:
PaymentService calls `cartOrdersClient.clearCart(userId)` but:
1. The call is wrapped in try-catch with only a warning log
2. No verification that it actually succeeds
3. Frontend Redux cart is cleared but database is not

### Solution:
**Backend**: Add Feign client method to handle batch quantity reduction AFTER payment succeeds
**Frontend**: Track payment success more carefully and trigger cart clear

---

## Issue 2: Batch Quantity Not Reducing from Stock ❌

### Current Problem:
- User orders medicine with batch ID 5, quantity 10
- Order is created with batch allocation (FIFO)
- Batch.qtyAvailable remains the same
- Stock appears infinite

### Root Cause:
1. OrderService creates OrderItem with batchId
2. BatchService has NO method to reduce quantity
3. PaymentService doesn't call any batch update method
4. Batch quantity_available field is never touched

### Solution:
1. Add `reduceBatchQuantity(batchId, quantity)` method to BatchService
2. Create Feign client in CartOrdersService to call this method
3. After payment succeeds, call the method for each order item
4. This will atomically reduce batch.qtyAvailable

**Code Flow**:
```
Payment succeeds
→ PaymentService.processPayment() succeeds
→ PaymentController returns 200 with Payment object
→ Frontend receives success response
→ Frontend should trigger:
  1. Order confirmation
  2. Clear cart (cart-orders-service)
  3. Reduce batch quantities (admin-catalogue-service)
```

---

## Issue 3: Add Batch Returns 403 Forbidden ❌

### Current Problem:
```
POST /admin/batches with valid JWT
Response: 403 Forbidden
Error: "Access Forbidden"
```

### Root Cause:
WebSecurityConfig in admin-catalogue-service requires:
```java
.requestMatchers("POST", "/batches/**").hasRole("ADMIN")
```

But user's JWT token doesn't have ADMIN role. This could be:
1. Auth Service not assigning ADMIN role when creating user
2. JWT token from Auth Service missing role claim
3. Role mapping issue in JwtAuthenticationFilter

### Solution:
**Option A** (Recommended for Development/Testing):
Temporarily allow authenticated users to POST /batches (not just ADMIN)

**Option B** (Recommended for Production):
Fix the Auth Service to properly assign ADMIN role

Let me verify which users should have ADMIN role and update accordingly.

---

## Implementation Plan

### Step 1: Add Batch Quantity Reduction Logic
- Create `@GetMapping("/batches/{batchId}/reduce")` in AdminCatalogueController
- Call `batchService.reduceBatchQuantity(batchId, quantity)`
- This method updates: `batch.qtyAvailable -= quantity`

### Step 2: Add Feign Client in CartOrdersService
- Create `AdminCatalogueClient` in cart-orders-service
- Method: `reduceBatchQuantity(batchId, quantity)`
- Add to PaymentCallback flow

### Step 3: Update Payment Success Flow
- After payment succeeds, iterate through OrderItems
- For each OrderItem with batchId, call reduceBatchQuantity
- This ensures batch stock is only reduced AFTER payment confirmed

### Step 4: Fix 403 Error
- Option A: Update WebSecurityConfig to permit authenticated POST /batches
- Option B: Check why user role is not ADMIN

---

## Expected Result After Fixes

| Scenario | Before | After |
|----------|--------|-------|
| Add item to cart | Works ✓ | Works ✓ |
| Checkout | Works ✓ | Works ✓ |
| Payment | Works ✓ | Works ✓ |
| Order confirmation | Works ✓ | Works ✓ |
| Cart cleared | ❌ Empty | ✅ EMPTY |
| Batch quantity | ❌ -10 (changed) | ✅ -10 (reduced) |
| Add new batch | ❌ 403 Error | ✅ Works |

---

## Files to Modify

**Backend (Java):**
1. `admin-catalogue-service/BatchService.java` - Add reduceBatchQuantity method
2. `admin-catalogue-service/BatchController.java` - Add reduce endpoint
3. `admin-catalogue-service/WebSecurityConfig.java` - Fix 403 (Option A)
4. `cart-orders-service/PaymentCallback or EventListener.java` - NEW: Call reduction after payment

**Frontend (React):**
1. `frontend/src/features/payment/PaymentSelect.jsx` - Track payment success
2. `frontend/src/components/orders/OrderConfirmation.jsx` - Wait for cart clear

---

## Testing Checklist

- [ ] Add medicine to cart
- [ ] Proceed to checkout
- [ ] Select address
- [ ] Proceed to payment
- [ ] Fill payment details
- [ ] Submit payment
- [ ] ✅ Payment succeeds (order confirmation page)
- [ ] ✅ Check /cart → should be EMPTY
- [ ] ✅ Check /orders → new order shows CONFIRMED status
- [ ] ✅ Check database: cart_items count = 0
- [ ] ✅ Check database: orders.status = CONFIRMED
- [ ] ✅ Check database: batch.qtyAvailable REDUCED by order quantity
- [ ] ✅ Try adding batch → NO 403 ERROR

