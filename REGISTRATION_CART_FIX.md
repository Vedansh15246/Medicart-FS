# Fix: 403 Forbidden Error When Adding to Cart After Registration

## Problem
After registering and completing OTP verification, users received a **403 Forbidden** error when trying to add items to the cart. This happened even though logging in worked fine.

## Root Cause
1. **OtpPage.jsx** was storing the JWT `token` in localStorage after OTP verification
2. BUT it was **NOT storing the `userId`** from the response
3. **client.js** request interceptor tries to extract userId from:
   - Token payload (via `extractUserIdFromToken()`)
   - localStorage as fallback
4. Since the token was newly created and userId wasn't in localStorage, the `X-User-Id` header was **not being sent** with the cart request
5. **CartController** requires the `X-User-Id` header (it returns 403 if missing/null)

## Solution
Modified **`frontend/src/features/auth/components/OtpPage.jsx`** to:
1. Extract `userId` from the OTP verification response (`res.data.userId`)
2. Store it in localStorage: `localStorage.setItem("userId", String(userId))`
3. Add it to client default headers: `client.defaults.headers.common["X-User-Id"] = String(userId)`

### Changes Made
**File:** `frontend/src/features/auth/components/OtpPage.jsx`
- In `handleVerify()` function, lines ~72-85
- Added extraction of `userId` from response
- Added storage of `userId` to localStorage
- Added `X-User-Id` header to client defaults

## How It Works Now
1. User **registers** → email/phone/password sent
2. User **verifies OTP** → backend returns JWT token + userId + email
3. Frontend stores BOTH:
   - `localStorage.accessToken = token`
   - `localStorage.userId = userId` ✅ **NEW**
4. Frontend sets client headers with both token AND userId ✅ **NEW**
5. All subsequent requests include `X-User-Id` header
6. User clicks "Buy Now" → cart request includes `X-User-Id` → CartController accepts it → ✅ **WORKS**

## Testing Steps
1. Open http://localhost:5174
2. Click "Register"
3. Enter: 
   - Name: `Test User`
   - Phone: `9999999999`
   - Email: `testuser@example.com`
   - Password: `Secure@123`
4. Click "Register"
5. Copy the demo OTP shown in alert (e.g., `123456`)
6. Paste OTP and click "Verify"
7. Should redirect to home page
8. Find a medicine and click "Buy Now"
9. Should see **success** (200 response, item added to cart)

## Logs to Verify
When adding to cart after registration, check browser console for:
```
✓ User ID added to request {userId: 1, url: '/api/cart/add?...'}
```

And in backend cart service logs:
```
✅ [POST /api/cart/add] REQUEST RECEIVED
   medicineId: 2, quantity: 1, userId: 1
✅ Medicine found: [Medicine Name]
✅ Item added to cart: [CartItem ID]
```

## Files Modified
- `frontend/src/features/auth/components/OtpPage.jsx` ✅

## Status
✅ **FIXED** - Ready for testing
