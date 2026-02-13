# 06 — Payment System

## 📌 What This Feature Does

The Payment System handles the entire payment flow after a user has added items to their cart and selected a delivery address. It supports **4 payment methods** (Credit Card, Debit Card, UPI, Net Banking), processes the payment, reduces medicine stock (FIFO batch deduction), clears the user's cart, and shows a **success page with a downloadable PDF receipt**.

> **Important:** This is a **simulated** payment system. No real payment gateway (Stripe, Razorpay, etc.) is integrated. The backend always returns "success" after a small delay. This is perfect for learning — you see the full flow without needing real bank accounts.

---

## 🏗️ Architecture Overview

```
User clicks "Pay" on a payment page
        │
        ▼
┌─────────────────────┐
│  Frontend (React)   │
│  CardPaymentNew.jsx │  ── or UPIPayment.jsx or NetBankingPayment.jsx
│  PaymentSelect.jsx  │
└─────────┬───────────┘
          │  HTTP POST
          ▼
┌─────────────────────┐
│   API Gateway       │  (port 8080)
│   Validates JWT     │
│   Adds X-User-Id    │
└─────────┬───────────┘
          │  Routes to payment-service
          ▼
┌─────────────────────┐
│  Payment Service    │  (port 8086)
│  PaymentController  │
│  PaymentService     │
└─────────┬───────────┘
          │  Feign call to cart-orders-service
          ▼
┌─────────────────────┐
│  Cart-Orders Service│  (port 8083)
│  finalizePayment()  │  ← reduces batch quantities (FIFO)
│  clearCart()         │  ← empties the cart
└─────────────────────┘
```

---

## 📂 File Map

### Backend (Payment Service — port 8086)

| File | Purpose |
|------|---------|
| `payment-service/src/main/.../entity/Payment.java` | Payment database entity |
| `payment-service/src/main/.../entity/Transaction.java` | Transaction log entity |
| `payment-service/src/main/.../controller/PaymentController.java` | REST API endpoints |
| `payment-service/src/main/.../service/PaymentService.java` | Business logic |
| `payment-service/src/main/.../client/CartOrdersClient.java` | Feign client to cart-orders-service |
| `payment-service/src/main/.../repository/PaymentRepository.java` | JPA repository |
| `payment-service/src/main/.../repository/TransactionRepository.java` | JPA repository |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/api/paymentService.js` | API calls to payment endpoints |
| `frontend/src/features/payment/PaymentSelect.jsx` | Payment method selection page |
| `frontend/src/features/payment/CardPaymentNew.jsx` | Credit/Debit Card payment form |
| `frontend/src/features/payment/UPIPayment.jsx` | UPI payment form |
| `frontend/src/features/payment/NetBankingPayment.jsx` | Net Banking bank selection |
| `frontend/src/features/payment/Success.jsx` | Success page + PDF receipt |

---

## 🔧 Backend — Database Entities

### Payment Entity (`Payment.java`)

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                    // Auto-incremented primary key

    private Long orderId;               // Which order this payment is for
    private Long userId;                // Which user made the payment
    private BigDecimal amount;          // Total amount paid (e.g., 1234.56)

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;  // PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED

    private String paymentMethod;       // "CREDIT_CARD", "UPI", "NET_BANKING"
    private String transactionId;       // UUID string for tracking
    private LocalDateTime paymentDate;  // When payment was processed
    private LocalDateTime createdAt;    // Auto-set on insert
    private LocalDateTime updatedAt;    // Auto-set on update

    public enum PaymentStatus {
        PENDING,      // Payment record created but not processed yet
        PROCESSING,   // Payment is being processed (simulated)
        SUCCESS,      // Payment completed successfully
        FAILED,       // Payment failed (exception occurred)
        REFUNDED      // Payment was refunded
    }
}
```

**Key annotations explained:**
- `@Entity` + `@Table(name = "payments")` — Maps this class to the `payments` table in MySQL
- `@Enumerated(EnumType.STRING)` — Stores the enum as text ("SUCCESS") not as a number (2)
- `@PrePersist` — Runs `onCreate()` automatically when a new row is inserted (sets createdAt)
- `@PreUpdate` — Runs `onUpdate()` automatically when a row is updated (sets updatedAt)
- `BigDecimal` — Used for money (not `double`!) because it avoids floating-point errors (e.g., 0.1 + 0.2 ≠ 0.3 with doubles)

### Transaction Entity (`Transaction.java`)

```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long paymentId;             // Links to which Payment this belongs to
    
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;  // PAYMENT, REFUND, ADJUSTMENT
    
    private BigDecimal amount;          // Transaction amount
    private String description;         // Human-readable description
    private String transactionId;       // UUID for this specific transaction
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;   // PENDING, SUCCESS, FAILED
    
    private LocalDateTime createdAt;    // Auto-set on insert

    public enum TransactionType {
        PAYMENT,     // Normal payment transaction
        REFUND,      // Money returned to user
        ADJUSTMENT   // Manual correction (not used currently)
    }

    public enum TransactionStatus {
        PENDING, SUCCESS, FAILED
    }
}
```

**Why two tables (Payment + Transaction)?**
A single payment can have multiple transactions. For example:
1. First attempt fails → Transaction #1 (FAILED)
2. User retries and succeeds → Transaction #2 (SUCCESS)  
3. User requests refund → Transaction #3 (REFUND)

All three are linked to the same Payment record.

---

## 🔧 Backend — PaymentService (Business Logic)

### `processPayment()` — The Core Method

This is the most important method. Here's what it does step by step:

```java
@Transactional  // If anything fails, ALL database changes are rolled back
public Payment processPayment(Long orderId, Long userId, BigDecimal amount, String paymentMethod) {
    try {
        // ═══ STEP 1: Check for duplicate payment ═══
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        
        Payment payment;
        
        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            
            // If already succeeded, just return it (idempotent)
            if (payment.getPaymentStatus() == Payment.PaymentStatus.SUCCESS) {
                return payment;  // Don't charge twice!
            }
            
            // If failed/pending, UPDATE the existing record instead of creating new
            // This prevents "Duplicate entry" SQL errors
            payment.setPaymentStatus(Payment.PaymentStatus.PROCESSING);
            payment.setPaymentMethod(paymentMethod);
            payment.setAmount(amount);
            payment.setTransactionId(UUID.randomUUID().toString());
            payment.setPaymentDate(LocalDateTime.now());
        } else {
            // ═══ STEP 2: Create new payment record ═══
            payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(amount)
                    .paymentMethod(paymentMethod)
                    .paymentStatus(Payment.PaymentStatus.PROCESSING)
                    .transactionId(UUID.randomUUID().toString())
                    .paymentDate(LocalDateTime.now())
                    .build();
        }

        payment = paymentRepository.save(payment);

        // ═══ STEP 3: Simulate payment gateway ═══
        simulatePaymentGateway(payment);  // Just Thread.sleep(100ms)

        // ═══ STEP 4: Create transaction record ═══
        Transaction transaction = Transaction.builder()
                .paymentId(payment.getId())
                .transactionType(Transaction.TransactionType.PAYMENT)
                .amount(amount)
                .transactionId(UUID.randomUUID().toString())
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Payment processed for order " + orderId)
                .build();
        transactionRepository.save(transaction);

        // ═══ STEP 5: Mark payment as SUCCESS ═══
        payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        // ═══ STEP 6: Finalize order (FIFO batch reduction) ═══
        try {
            cartOrdersClient.finalizePayment(orderId, userId);
        } catch (Exception e) {
            log.warn("Failed to finalize payment for order {}: {}", orderId, e.getMessage());
            // Payment still succeeds — stock reduction failure is logged but not fatal
        }

        // ═══ STEP 7: Clear user's cart ═══
        try {
            cartOrdersClient.clearCart(userId);
        } catch (Exception e) {
            log.warn("Failed to clear cart for user {}: {}", userId, e.getMessage());
        }

        return payment;
    } catch (Exception e) {
        // ═══ FAILURE HANDLER ═══
        return handlePaymentFailure(orderId, userId, amount, paymentMethod, e);
    }
}
```

**Key design decisions explained:**

1. **Idempotency** — If the user clicks "Pay" twice rapidly, the second request finds the existing payment and returns it (no double charge).

2. **`@Transactional`** — This Spring annotation means: if any exception is thrown, ALL database changes made in this method are rolled back. Think of it as "all or nothing".

3. **Feign calls in try/catch** — Steps 6 and 7 (finalizePayment + clearCart) are wrapped in try/catch. If they fail, the payment still succeeds. Why? Because the user already paid — we don't want to tell them "payment failed" just because stock reduction had a glitch.

4. **`UUID.randomUUID().toString()`** — Generates a unique transaction ID like `"550e8400-e29b-41d4-a716-446655440000"`. Used for tracking.

### `simulatePaymentGateway()` — The Mock

```java
private void simulatePaymentGateway(Payment payment) {
    // In production, this would call Stripe/Razorpay/PayPal API
    try {
        Thread.sleep(100);  // Simulate 100ms network delay
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException("Payment processing interrupted");
    }
}
```

In a real application, this method would:
- Call Stripe's `/v1/charges` API with card token
- Wait for response
- Throw exception if payment is declined

### `refundPayment()` — Refund Flow

```java
@Transactional
public Payment refundPayment(Long paymentId) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new RuntimeException("Payment not found"));

    // Create a REFUND transaction
    Transaction transaction = Transaction.builder()
            .paymentId(paymentId)
            .transactionType(Transaction.TransactionType.REFUND)
            .amount(payment.getAmount())
            .transactionId(UUID.randomUUID().toString())
            .status(Transaction.TransactionStatus.SUCCESS)
            .description("Refund for payment " + payment.getId())
            .build();
    transactionRepository.save(transaction);

    // Change payment status to REFUNDED
    payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
    payment.setUpdatedAt(LocalDateTime.now());
    return paymentRepository.save(payment);
}
```

---

## 🔧 Backend — PaymentController (REST API)

### All Endpoints

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| `POST` | `/api/payment/process` | Process a payment | User (X-User-Id) |
| `GET` | `/api/payment/{paymentId}` | Get payment by ID | Any |
| `GET` | `/api/payment/order/{orderId}` | Get payment by order ID | Any |
| `GET` | `/api/payment/user/history` | Get user's payment history | User (X-User-Id) |
| `POST` | `/api/payment/{paymentId}/refund` | Refund a payment | Any |
| `GET` | `/api/payment/{paymentId}/transactions` | Get transaction log | Any |
| `GET` | `/api/payment/health` | Health check | Public |

### Process Payment Endpoint — Deep Dive

```java
@PostMapping("/process")
public ResponseEntity<Map<String, Object>> processPayment(
        @RequestHeader(value = "X-User-Id", required = false) Long userId,
        @RequestParam(required = false) Long orderId,
        @RequestParam(required = false) BigDecimal amount,
        @RequestParam(required = false) String paymentMethod,
        @RequestBody(required = false) Map<String, Object> requestBody) {
```

This endpoint is **flexible** — it accepts parameters from:
- **Request headers** (`X-User-Id` — set by API Gateway from JWT)
- **Query parameters** (`?orderId=5&amount=100`)
- **Request body** (JSON with `orderId`, `amount`, `paymentMethod`)

The body takes priority over query params. This design means the frontend can send data either way.

**Duplicate payment handling (HTTP 409):**
```java
if (errorMsg.contains("Duplicate entry") || errorMsg.contains("unique_order_payment")) {
    Map<String, Object> error = new HashMap<>();
    error.put("error", "Payment already exists for this order...");
    error.put("errorCode", "DUPLICATE_PAYMENT");
    return ResponseEntity.status(409).body(error);  // 409 = Conflict
}
```

---

## 🔧 Backend — Feign Client (Inter-Service Communication)

```java
@FeignClient(name = "cart-orders-service")  // Finds this service via Eureka
public interface CartOrdersClient {
    
    @GetMapping("/api/orders/{orderId}")
    OrderDTO getOrder(@PathVariable Long orderId);

    @PutMapping("/api/orders/{orderId}/status")
    void updateOrderStatus(@PathVariable Long orderId, @RequestParam String status);

    @DeleteMapping("/api/cart/clear")
    void clearCart(@RequestHeader("X-User-Id") Long userId);

    @PostMapping("/api/orders/{orderId}/finalize-payment")
    void finalizePayment(@PathVariable Long orderId, @RequestHeader("X-User-Id") Long userId);
}
```

**How Feign works:**
1. You write an **interface** (not a class) with method signatures
2. Spring automatically creates an implementation at runtime
3. `@FeignClient(name = "cart-orders-service")` tells Feign: "Find cart-orders-service in Eureka registry, get its IP/port, and call it"
4. When you call `cartOrdersClient.clearCart(userId)`, Feign sends: `DELETE http://cart-orders-service/api/cart/clear` with header `X-User-Id: 42`

---

## 🎨 Frontend — Payment API Service

```javascript
// frontend/src/api/paymentService.js
import client from "./client";  // Axios instance with baseURL http://localhost:8080

export const paymentService = {
  // Process payment for an order
  processPayment: async (orderId, amount, paymentMethod = "CREDIT_CARD", cardData = null) => {
    const payload = {
      orderId: orderId,         // ID of the order we created
      amount: amount,           // Total amount (subtotal + tax + delivery)
      paymentMethod: paymentMethod,  // "CREDIT_CARD", "UPI", "NET_BANKING"
      ...cardData               // Spread any additional data (card number, UPI ID, etc.)
    };
    
    const response = await client.post("/api/payment/process", payload);
    return response.data;
    // Returns: { paymentId, status, amount, transactionId, message }
  },

  // Get payment details by payment ID
  getPaymentStatus: async (paymentId) => {
    const response = await client.get(`/api/payment/${paymentId}`);
    return response.data;
  },

  // Get payment by order ID  
  getPaymentByOrderId: async (orderId) => {
    const response = await client.get(`/api/payment/order/${orderId}`);
    return response.data;
  },

  // Get all payments for logged-in user
  getPaymentHistory: async () => {
    const response = await client.get("/api/payment/user/history");
    return response.data;
  },

  // Refund a payment
  refundPayment: async (paymentId) => {
    const response = await client.post(`/api/payment/${paymentId}/refund`);
    return response.data;
  },
};
```

---

## 🎨 Frontend — Payment Select Page

**File:** `PaymentSelect.jsx`

This is the first page users see when they're ready to pay. It shows 4 payment method cards in a grid.

### How It Works

```
User arrives at /payment/select
        │
        ▼
 ┌──────────────────┐
 │  Sync cart from   │  ← useEffect: dispatch(fetchCart()) if cart is empty
 │  Redux/backend    │
 └────────┬─────────┘
          │
          ▼
 ┌──────────────────┐
 │  Calculate totals │  ← subtotal + 18% tax + delivery (₹40 or FREE if >₹500)
 └────────┬─────────┘
          │
          ▼
 ┌──────────────────┐
 │  Show 4 payment  │  ← Credit Card, Debit Card, UPI, Net Banking
 │  method cards     │
 └────────┬─────────┘
          │  User clicks one
          ▼
 ┌──────────────────┐
 │  navigate() to    │  ← /payment/card, /payment/debit, /payment/upi, /payment/netbanking
 │  specific page    │     Passes state: { selectedAddressId, cartItems, totals }
 └──────────────────┘
```

### Price Calculation Logic (Used Across All Payment Pages)

```javascript
// Every payment page calculates the same way:
const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.qty);
}, 0);

const tax = Math.round(subtotal * 0.18);           // 18% GST
const delivery = subtotal > 500 ? 0 : 40;          // FREE delivery over ₹500
const total = subtotal + tax + delivery;            // Final amount to charge
```

### Payment Methods Array

```javascript
const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCard,      // Lucide React icon component
      path: '/payment/card',  // Where to navigate
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      description: 'ATM/Visa/Mastercard Debit',
      icon: CreditCard,
      path: '/payment/debit',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
      path: '/payment/upi',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: Banknote,
      path: '/payment/netbanking',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
];
```

---

## 🎨 Frontend — Credit Card Payment (`CardPaymentNew.jsx`)

### The 4-Step Payment Flow

Every payment page (Card, UPI, Net Banking) follows the **same 4-step pattern**:

```
STEP 1: Create Order           → orderService.placeOrder(selectedAddressId)
STEP 2: Process Payment         → paymentService.processPayment(orderId, total, method)
STEP 3: Clear Cart              → dispatch(clearCart())
STEP 4: Navigate to Success     → navigate('/payment/success', { state: {...} })
```

### Card Validation

```javascript
// 1. All fields required
if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
    throw new Error('Please fill all card details');
}

// 2. Address must be selected
if (!selectedAddress) {
    throw new Error('Please select a delivery address');
}

// 3. Card number minimum 13 digits
if (cardNumber.replace(/\s/g, '').length < 13) {
    throw new Error('Invalid card number (minimum 13 digits required)');
}

// 4. CVV must be 3-4 digits
if (cvv.length < 3 || cvv.length > 4) {
    throw new Error('Invalid CVV (3-4 digits required)');
}

// 5. Card must not be expired
const currentYear = new Date().getFullYear() % 100;  // 2025 → 25
const currentMonth = new Date().getMonth() + 1;      // January = 1
if (parseInt(expiryYear) < currentYear ||
    (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
    throw new Error('Card has expired');
}
```

### Card Number Formatting

```javascript
// Auto-formats as user types: "1234567890123456" → "1234 5678 9012 3456"
const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
};

// Usage:
<input
    value={cardNumber}
    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
    maxLength="19"  // 16 digits + 3 spaces
/>
```

### Full Payment Handler

```javascript
const handleFinalPay = async (e) => {
    e.preventDefault();     // Prevent form submission (page reload)
    setError(null);         // Clear previous errors
    setLoading(true);       // Show loading spinner

    try {
        // ... validation code above ...

        // STEP 1: Create the order in cart-orders-service
        const orderResponse = await orderService.placeOrder(selectedAddress);
        const orderId = orderResponse.id;
        // This creates the order with status PENDING and allocates batches (FIFO)

        // STEP 2: Process payment in payment-service
        const paymentResponse = await paymentService.processPayment(
            orderId,            // Link payment to order
            total,              // Amount to charge
            'CREDIT_CARD',      // Payment method string
            {                   // Extra data (not actually used by backend)
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryMonth,
                expiryYear,
                cvv,
                cardholderName
            }
        );

        // STEP 3: Clear cart in Redux store
        dispatch(clearCart());

        // STEP 4: Navigate to success page
        navigate('/payment/success', {
            state: {
                paymentId: paymentResponse.paymentId,
                transactionId: paymentResponse.transactionId,
                amount: total,
                orderId: orderId,
                orderNumber: orderResponse.orderNumber,
                method: 'CREDIT_CARD',
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        // Show error message from backend or from our validation
        setError(err.response?.data?.error || err.message || 'Payment failed');
    } finally {
        setLoading(false);  // Hide loading spinner
    }
};
```

---

## 🎨 Frontend — UPI Payment (`UPIPayment.jsx`)

### UPI ID Validation

```javascript
const validateUPIId = (id) => {
    // Regex: alphanumeric + dots + hyphens, then @, then 3+ letters
    const upiRegex = /^[a-zA-Z0-9.-]*@[a-zA-Z]{3,}$/;
    return upiRegex.test(id);
};
// Valid:   "john@okhdfcbank", "user123@paytm", "my.name@ybl"
// Invalid: "john", "@bank", "john@", "john@ab"
```

### Payment Flow (Same 4 Steps)

```javascript
const handleUPIPayment = async (e) => {
    e.preventDefault();

    // Validate UPI ID format
    if (!validateUPIId(upiId)) {
        throw new Error('Invalid UPI ID format (e.g., yourname@okhdfcbank)');
    }

    // STEP 1: Create order
    const orderResponse = await orderService.placeOrder(selectedAddress);
    
    // STEP 2: Process payment
    const response = await paymentService.processPayment(
        orderResponse.id, total, 'UPI', { upiId, paymentMethod: 'UPI' }
    );
    
    // STEP 3: Clear cart
    dispatch(clearCart());
    
    // STEP 4: Navigate to success (includes upiId in state)
    navigate('/payment/success', { state: { ...data, method: 'UPI', upiId } });
};
```

---

## 🎨 Frontend — Net Banking Payment (`NetBankingPayment.jsx`)

### Bank Selection Grid

```javascript
const banks = [
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
    { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
    { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
    { id: 'axis', name: 'Axis Bank', icon: '🏦' },
    { id: 'boi', name: 'Bank of India', icon: '🏦' },
    { id: 'yes', name: 'YES Bank', icon: '🏦' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏦' },
    { id: 'idbi', name: 'IDBI Bank', icon: '🏦' },
];
```

Users click a bank card to select it. The selected bank gets a highlighted border:

```jsx
<button
    onClick={() => setSelectedBank(bank.id)}
    className={`p-4 rounded-lg border-2 transition-all ${
        selectedBank === bank.id
            ? 'border-orange-500 bg-orange-50'    // Selected state
            : 'border-gray-200 hover:border-orange-500'  // Default state
    }`}
>
```

### Payment Flow (Same 4 Steps)

```javascript
const handleNetBankingPayment = async (e) => {
    e.preventDefault();

    if (!selectedBank) throw new Error('Please select a bank');

    // STEP 1-4: Same pattern as Card and UPI
    const orderResponse = await orderService.placeOrder(selectedAddress);
    const response = await paymentService.processPayment(
        orderResponse.id, total, 'NET_BANKING', { bankCode: selectedBank }
    );
    dispatch(clearCart());
    navigate('/payment/success', { state: { ...data, method: 'NET_BANKING', bankCode: selectedBank } });
};
```

---

## 🎨 Frontend — Success Page + PDF Receipt (`Success.jsx`)

### What Users See

After successful payment, users land on `/payment/success` and see:

1. **Success animation** — Green checkmark with pulse animation
2. **Amount paid** — Large ₹ amount with date/time
3. **Transaction details** — Payment ID, Transaction ID, Order ID, Status
4. **Payment method** — Shows which method was used
5. **"What Happens Next"** — 3-step timeline (confirmation email → verification → shipping)
6. **3 action buttons:**
   - 📥 Download Receipt (generates PDF)
   - 📦 View Orders (navigates to /orders)
   - 🏠 Continue Shopping (navigates to /)

### PDF Receipt Generation (jsPDF)

The receipt is generated entirely in the browser using the **jsPDF** library — no backend call needed!

```javascript
import jsPDF from 'jspdf';

const handleDownloadReceipt = () => {
    const doc = new jsPDF();  // Create A4-size PDF
    const pageWidth = doc.internal.pageSize.getWidth();

    // ═══ HEADER (Green banner) ═══
    doc.setFillColor(16, 185, 129);                    // Emerald green
    doc.rect(0, 0, pageWidth, 35, 'F');                // Fill rectangle
    doc.setTextColor(255, 255, 255);                   // White text
    doc.setFontSize(26);
    doc.text('MEDICART', pageWidth / 2, 12, { align: 'center' });
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 28, { align: 'center' });

    // ═══ AMOUNT BOX ═══
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(15, 60, pageWidth - 30, 32, 4, 4, 'F');
    doc.setFontSize(28);
    doc.text('Rs ' + orderDetails.amount.toFixed(2), pageWidth / 2, 80, { align: 'center' });

    // ═══ TRANSACTION DETAILS ═══
    doc.text('Payment ID: ' + orderDetails.paymentId);
    doc.text('Transaction ID: ' + orderDetails.transactionId);
    doc.text('Order ID: ' + orderDetails.orderId);
    doc.text('Status: COMPLETED');

    // ═══ PAYMENT METHOD ═══
    let method = 'Card Payment';
    if (orderDetails.method === 'CREDIT_CARD') method = 'Credit Card';
    else if (orderDetails.method === 'UPI') method = 'UPI Payment';
    else if (orderDetails.method === 'NET_BANKING') method = 'Net Banking';

    // ═══ FOOTER ═══
    doc.text('Thank you for shopping with MediCart!');
    doc.text('Email: support@medicart.com | Phone: +91 98765 43210');

    // Save the PDF file
    const filename = 'MediCart_Receipt_' + orderDetails.paymentId + '.pdf';
    doc.save(filename);
    // Browser downloads the file automatically!
};
```

**How jsPDF works:**
- `new jsPDF()` creates a blank A4 PDF
- `doc.setFillColor(r, g, b)` sets the fill color
- `doc.rect(x, y, width, height, 'F')` draws a filled rectangle
- `doc.text('Hello', x, y)` writes text at position (x, y)
- `doc.roundedRect(...)` draws a rectangle with rounded corners
- `doc.save('filename.pdf')` triggers browser download

---

## 🔄 Complete End-to-End Payment Flow

Here's what happens when a user clicks "Pay ₹1,234" on the Card Payment page:

```
1. Frontend validates card details (number, expiry, CVV)
      │
2. Frontend calls orderService.placeOrder(addressId)
      │  POST /api/orders/place → cart-orders-service
      │  → Creates Order with status PENDING
      │  → Allocates batches using FIFO algorithm
      │  → Returns { id: 42, orderNumber: "ORD-1234567890" }
      │
3. Frontend calls paymentService.processPayment(42, 1234, 'CREDIT_CARD')
      │  POST /api/payment/process → payment-service
      │
4. PaymentService.processPayment() runs:
      │  a. Checks for existing payment for order 42 → not found
      │  b. Creates Payment record (status: PROCESSING)
      │  c. Calls simulatePaymentGateway() → Thread.sleep(100ms)
      │  d. Creates Transaction record (type: PAYMENT, status: SUCCESS)
      │  e. Updates Payment status to SUCCESS
      │  f. Calls cartOrdersClient.finalizePayment(42, userId)
      │     → OrderService reduces batch quantities (FIFO)
      │     → Updates order status from PENDING to CONFIRMED
      │  g. Calls cartOrdersClient.clearCart(userId)
      │     → Deletes all cart items for this user
      │  h. Returns Payment object
      │
5. Frontend receives success response
      │  dispatch(clearCart())  → clears Redux store
      │
6. Frontend navigates to /payment/success
      │  Passes: paymentId, transactionId, amount, orderId, method
      │
7. Success page renders with order details + PDF download button
```

---

## 📊 Database Schema

### `payments` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment |
| `order_id` | BIGINT | Foreign key to orders table |
| `user_id` | BIGINT | Foreign key to users table |
| `amount` | DECIMAL | Payment amount |
| `payment_status` | VARCHAR | PENDING/PROCESSING/SUCCESS/FAILED/REFUNDED |
| `payment_method` | VARCHAR | CREDIT_CARD/DEBIT_CARD/UPI/NET_BANKING |
| `transaction_id` | VARCHAR | UUID string |
| `payment_date` | DATETIME | When payment was processed |
| `created_at` | DATETIME | Auto-set on insert |
| `updated_at` | DATETIME | Auto-set on update |

### `transactions` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT (PK) | Auto-increment |
| `payment_id` | BIGINT | Links to payments table |
| `transaction_type` | VARCHAR | PAYMENT/REFUND/ADJUSTMENT |
| `amount` | DECIMAL | Transaction amount |
| `description` | VARCHAR | Human-readable text |
| `transaction_id` | VARCHAR | UUID string |
| `status` | VARCHAR | PENDING/SUCCESS/FAILED |
| `created_at` | DATETIME | Auto-set |

---

## 🧪 Testing the Payment Flow

### Test with cURL

```bash
# 1. Login first
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. Process payment (use the JWT token from login)
curl -X POST http://localhost:8080/api/payment/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"amount":500.00,"paymentMethod":"CREDIT_CARD"}'

# 3. Check payment status
curl http://localhost:8080/api/payment/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Get payment history
curl http://localhost:8080/api/payment/user/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Refund a payment
curl -X POST http://localhost:8080/api/payment/1/refund \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧠 Key Concepts for Beginners

### 1. Why "Create Order THEN Pay" (not the other way)?
Because if payment is processed first but order creation fails, the user gets charged with no order. By creating the order first (with PENDING status), even if payment fails, the order exists and can be retried.

### 2. What is `@Transactional`?
It wraps all database operations in a "transaction". If any operation fails, ALL changes are undone (rolled back). Example: If creating the Transaction record fails, the Payment record is also rolled back.

### 3. What is `BigDecimal`?
A Java class for precise decimal arithmetic. `double` has floating-point errors:
```java
System.out.println(0.1 + 0.2);  // Output: 0.30000000000000004 (WRONG!)
```
`BigDecimal` doesn't have this problem — critical for money calculations.

### 4. What is Idempotency?
Making the same request multiple times produces the same result. Our payment endpoint is idempotent — if you call it twice for the same order, the second call returns the existing payment instead of charging twice.

### 5. What is jsPDF?
A JavaScript library that generates PDF files entirely in the browser. No server needed. The PDF is constructed programmatically by drawing rectangles, text, and lines at specific coordinates.

---

## ⚡ Quick Reference

| Concept | Value |
|---------|-------|
| Service Port | 8086 |
| Database | payment_db |
| Base URL | `/api/payment` |
| Payment Methods | CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING |
| Payment Statuses | PENDING → PROCESSING → SUCCESS/FAILED/REFUNDED |
| Tax Rate | 18% (GST) |
| Delivery Charge | ₹40 (FREE if subtotal > ₹500) |
| PDF Library | jsPDF |
| Feign calls | finalizePayment(), clearCart() |
