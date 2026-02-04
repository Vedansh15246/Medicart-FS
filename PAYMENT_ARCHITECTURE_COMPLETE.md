# 🏗️ Payment Architecture Overview

## 🎯 Complete E-Commerce Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MEDICART E-COMMERCE FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

1. DISCOVERY & BROWSING
   ├─ User lands on Homepage (/)
   ├─ Browses medicines from admin-catalogue-service
   ├─ Views real-time quantities from Batch entities
   └─ Adds medicines to Redux cart

2. AUTHENTICATION
   ├─ Login/Register at /auth/login or /auth/register
   ├─ OTP verification via SMS (backend)
   ├─ Extract userId from OTP response
   ├─ Store token + userId in localStorage
   └─ Configure X-User-Id header for all requests

3. CART MANAGEMENT
   ├─ Add/Remove items (CartSlice Redux actions)
   ├─ Update quantities (incrementQty, decrementQty)
   ├─ Fetch cart from backend (/api/cart)
   ├─ All cart operations include X-User-Id header
   └─ Calculate totals in CartSlice or component

4. CHECKOUT FLOW
   ├─ Select/Add delivery address (AddressPage)
   ├─ View order summary (CheckoutPage)
   │  ├─ Subtotal calculation
   │  ├─ Tax (18% GST)
   │  ├─ Delivery charges (free if > ₹500)
   │  └─ Total amount
   ├─ Place order (orderService.placeOrder)
   │  └─ Backend creates Order record with items
   └─ Navigate to PaymentSelect

5. PAYMENT SELECTION
   ├─ Display 4 payment methods (PaymentSelect)
   ├─ Show order summary with totals
   ├─ Pass cart data to selected payment method
   └─ Options:
      ├─ Credit Card → /payment/card
      ├─ Debit Card → /payment/debit (future)
      ├─ UPI → /payment/upi (future)
      └─ Net Banking → /payment/netbanking (future)

6. PAYMENT PROCESSING
   ├─ Card Payment (CardPayment component)
   │  ├─ Form validation (card, CVV, expiry)
   │  ├─ Call paymentService.processPayment()
   │  ├─ Backend processes via Payment Service
   │  ├─ Backend returns paymentId, transactionId
   │  ├─ Clear cart from Redux
   │  └─ Navigate to Success page
   └─ Backend updates Order.paymentStatus = PAID

7. CONFIRMATION
   ├─ Success page displays (Success component)
   ├─ Show payment details (ID, amount, timestamp)
   ├─ Display next steps
   ├─ Offer options:
   │  ├─ Download receipt (future)
   │  ├─ View orders
   │  └─ Continue shopping
   └─ Send confirmation email (backend)

8. POST-PURCHASE
   ├─ User can view order history (/orders)
   ├─ Can track order status
   ├─ Can view order details
   └─ Process repeat purchases
```

## 🔗 Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   API GATEWAY (port 8085)                │
│                (Routes all requests)                      │
└──────────────────────────────────────────────────────────┘
          ↓              ↓              ↓              ↓
     ┌─────────┐   ┌──────────┐  ┌──────────┐  ┌─────────────┐
     │ Auth    │   │ Admin-   │  │ Cart-    │  │ Payment     │
     │ Service │   │ Catalogue│  │ Orders   │  │ Service     │
     │(8081)   │   │ Service  │  │ Service  │  │(8086)       │
     │         │   │(8082)    │  │(8083)    │  │             │
     └─────────┘   └──────────┘  └──────────┘  └─────────────┘
        ↓              ↓              ↓              ↓
     ┌─────────────────────────────────────────────────────┐
     │         MySQL Database (unified schema)             │
     │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
     │  │ Users    │  │ Medicines│  │ Orders   │  ...     │
     │  └──────────┘  └──────────┘  └──────────┘           │
     └─────────────────────────────────────────────────────┘

All services registered with Eureka (service discovery)
All requests go through API Gateway with load balancing
```

## 📱 Frontend Structure

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.jsx          (Email + Password)
│   │   │   ├── Register.jsx       (Create account)
│   │   │   └── OtpPage.jsx        (Verify OTP → stores userId)
│   │   ├── components/
│   │   │   └── OtpPage.jsx        (Also here - used by flow)
│   │   └── layout/
│   │       ├── General.jsx        (Auth layout container)
│   │       └── ClientDashboard.jsx (Protected dashboard)
│   │
│   ├── catalog/
│   │   ├── HomePage.jsx           (Browse medicines)
│   │   ├── ProductCard.jsx        (Add to cart)
│   │   └── ProductFilter.jsx      (Search/filter)
│   │
│   ├── payment/
│   │   ├── CheckoutPage.jsx       (📍 Now routes to PaymentSelect)
│   │   ├── PaymentSelect.jsx      (✨ NEW - Select payment method)
│   │   ├── CardPaymentNew.jsx     (✨ NEW - Credit card form)
│   │   ├── Success.jsx            (✨ NEW - Order confirmation)
│   │   ├── DebitCard.jsx          (Future)
│   │   ├── UPI.jsx                (Future)
│   │   ├── NetBanking.jsx         (Future)
│   │   └── MediCartModule4.jsx    (Old payment - kept for reference)
│   │
│   ├── order/
│   │   ├── MyOrdersPage.jsx       (View all orders)
│   │   └── OrderDetailsPage.jsx   (View specific order)
│   │
│   ├── delivery/
│   │   └── AddressPage.jsx        (Manage addresses)
│   │
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminProductsPage.jsx
│       ├── AdminBatchPage.jsx
│       └── ... (admin routes)
│
├── components/
│   ├── cart/
│   │   ├── CartPage.jsx           (View cart)
│   │   ├── CartSlice.js           (Redux state management)
│   │   └── CartItem.jsx           (Individual item component)
│   │
│   └── common/
│       ├── Header.jsx             (Navigation)
│       ├── Footer.jsx
│       └── LoadingSpinner.jsx
│
├── api/
│   ├── client.js                  (Axios instance with interceptors)
│   ├── paymentService.js          (Payment API endpoints)
│   ├── orderService.js            (Order API endpoints)
│   ├── medicineService.js         (Medicine API endpoints)
│   └── ... (other services)
│
├── store/
│   ├── store.js                   (Redux store configuration)
│   └── slices/
│       ├── authSlice.js           (User auth state)
│       ├── cartSlice.js           (Shopping cart state)
│       └── orderSlice.js          (Order state)
│
├── utils/
│   ├── logger.js                  (Logging utility)
│   └── validators.js              (Form validation)
│
└── App.jsx                        (Main routing)
```

## 💾 Redux State Management

```javascript
// Redux Store Structure
{
  auth: {
    user: { id, name, email, phone },
    token: "jwt-token",
    status: "idle" | "loading" | "succeeded" | "failed"
  },
  
  cart: {
    items: [
      {
        id: 1,
        product: { id, name, price, description },
        qty: 2
      },
      { ... }
    ],
    status: "idle" | "loading" | "succeeded" | "failed"
  },
  
  orders: {
    items: [ { id, status, total, createdAt, items }, ... ],
    status: "idle" | "loading" | "succeeded" | "failed"
  }
}
```

## 🔐 Authentication Flow

```
┌──────────────────────────────┐
│     User Registration        │
│   (Register.jsx)             │
│  Email, Name, Password       │
└──────────────────┬───────────┘
                   ↓
┌──────────────────────────────┐
│  Backend creates User         │
│  Password hashed with bcrypt  │
│  Sends OTP via SMS            │
└──────────────────┬───────────┘
                   ↓
┌──────────────────────────────┐
│   OTP Verification           │
│   (OtpPage.jsx)              │
│   User enters OTP             │
└──────────────────┬───────────┘
                   ↓
┌──────────────────────────────┐
│  Backend validates OTP        │
│  ✅ Generates JWT token      │
│  ✅ Returns userId           │
└──────────────────┬───────────┘
                   ↓
┌──────────────────────────────┐
│  Store in localStorage:      │
│  - accessToken (JWT)         │
│  - userId (UUID)             │
│  - Set in axios headers      │
└──────────────────────────────┘
                   ↓
┌──────────────────────────────┐
│   All API Requests Include:  │
│  Authorization: Bearer <JWT> │
│  X-User-Id: <userId>        │
└──────────────────────────────┘
```

## 📡 API Endpoints

### Authentication Service (`/auth`)
```
POST /auth/register         → Create new user
POST /auth/login           → Login with email/password
POST /auth/verify-otp      → Verify OTP (returns userId, token)
POST /auth/logout          → Logout user
GET  /auth/refresh-token   → Refresh JWT token
```

### Admin-Catalogue Service (`/medicines`)
```
GET    /medicines               → List all medicines
GET    /medicines/:id           → Get medicine details
GET    /medicines/:id/batches   → Get batches for medicine
POST   /medicines (admin)       → Create medicine
PUT    /medicines/:id (admin)   → Update medicine
DELETE /medicines/:id (admin)   → Delete medicine
```

### Cart-Orders Service (`/cart` & `/orders`)
```
GET    /cart                → Get user's cart
POST   /cart/items          → Add item to cart
PUT    /cart/items/:itemId  → Update cart item quantity
DELETE /cart/items/:itemId  → Remove from cart
DELETE /cart                → Clear cart (after payment)

POST   /orders              → Place new order
GET    /orders              → Get user's orders
GET    /orders/:id          → Get order details
PUT    /orders/:id/status   → Update order status
```

### Payment Service (`/payment`)
```
POST   /payment/process           → Process payment
GET    /payment/:paymentId        → Get payment status
GET    /payment/order/:orderId    → Get payment by order
GET    /payment/user/history      → User's payment history
POST   /payment/:paymentId/refund → Refund payment
```

## 🎨 New Component Specifications

### CardPayment.jsx
```javascript
Props: None (uses Redux state)
Redux State Read: 
  - cart.items (for amount calculation)
Redux Dispatch:
  - clearCart() (after payment success)
API Calls:
  - paymentService.processPayment(orderId, amount, method)
Navigation:
  - navigate('/payment/success', { state: {...} })
```

### PaymentSelect.jsx
```javascript
Props: None (uses Redux state)
Redux State Read:
  - cart.items (for amount calculation)
API Calls: None
Navigation:
  - navigate(paymentMethod.path, { state: {...} })
  - Example: navigate('/payment/card', { state: {...} })
```

### Success.jsx
```javascript
Props: None (uses location.state)
Location State:
  - paymentId
  - transactionId
  - amount
  - method
  - timestamp
API Calls: None
Navigation:
  - navigate('/orders') - View Orders
  - navigate('/') - Continue Shopping
```

## 🔄 Data Flow Diagram

```
┌─────────────┐
│  User Login │
└──────┬──────┘
       │
       ├─→ OtpPage.jsx
       │   └─→ Extracts userId from response
       │   └─→ Store in localStorage
       │   └─→ Set in axios headers
       │
       ├─→ HomePage.jsx
       │   └─→ Display medicines from API
       │   └─→ Add to cart via Redux dispatch
       │
       ├─→ CartPage.jsx
       │   └─→ Show Redux cart.items
       │   └─→ Can update quantities
       │   └─→ Proceed to checkout
       │
       ├─→ CheckoutPage.jsx
       │   └─→ Select address
       │   └─→ Call orderService.placeOrder()
       │   └─→ Redirect to /payment/select
       │
       ├─→ PaymentSelect.jsx (NEW!)
       │   └─→ Show 4 payment options
       │   └─→ Display order summary
       │   └─→ Select payment method
       │   └─→ Redirect to /payment/card
       │
       ├─→ CardPayment.jsx (NEW!)
       │   └─→ Validate card details
       │   └─→ Call paymentService.processPayment()
       │   └─→ Backend processes payment
       │   └─→ Clear Redux cart
       │   └─→ Redirect to /payment/success
       │
       ├─→ Success.jsx (NEW!)
       │   └─→ Show payment confirmation
       │   └─→ Options:
       │       ├─→ Continue Shopping (back to home)
       │       ├─→ View Orders (to /orders)
       │       └─→ Download Receipt (future)
       │
       └─→ MyOrdersPage.jsx
           └─→ List all user orders
           └─→ Can view order details
```

## ✨ Key Features Implemented

| Feature | Component | Status |
|---------|-----------|--------|
| User Registration with OTP | OtpPage.jsx | ✅ Complete |
| Real-time Quantity from Batches | HomePage + MedicineService | ✅ Complete |
| Redux Cart Management | cartSlice.js | ✅ Complete |
| Checkout with Address | CheckoutPage.jsx | ✅ Complete |
| Payment Method Selection | PaymentSelect.jsx | ✨ NEW |
| Credit Card Payment Form | CardPayment.jsx | ✨ NEW |
| Card Validation | CardPayment.jsx | ✨ NEW |
| Payment Success Confirmation | Success.jsx | ✨ NEW |
| Order Confirmation Email | (Backend) | ⏳ Pending |
| Receipt Download | Success.jsx | ⏳ Pending |
| Debit Card Payment | DebitCard.jsx | ⏳ Future |
| UPI Payment | UPI.jsx | ⏳ Future |
| Net Banking Payment | NetBanking.jsx | ⏳ Future |

## 🚀 Deployment Readiness

- ✅ Frontend builds successfully (dist/ generated)
- ✅ All components use Redux for state management
- ✅ All API calls include proper headers (X-User-Id, Authorization)
- ✅ Error handling with user-friendly messages
- ✅ Logging integrated for debugging
- ✅ Responsive design for mobile/tablet/desktop
- ⏳ Backend payment service needs verification
- ⏳ Email notifications need configuration
- ⏳ Payment gateway integration (if using real payment processor)

---

**Last Updated**: After payment integration complete
**Status**: Ready for Testing Phase ✅
