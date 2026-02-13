# 📦 MediCart — Orders System

## What This Document Covers

How orders work from placement to delivery:
- FIFO batch allocation algorithm
- Order placement flow
- Order history & details
- Admin order management (status updates, delivery dates)
- Order-to-Payment finalization

---

## 📁 Files Involved

### Backend (Cart-Orders Service — Port 8083)
```
cart-orders-service/
├── entity/
│   ├── Order.java              ← Order database entity
│   └── OrderItem.java          ← Items within an order
├── controller/
│   └── OrderController.java    ← Order REST endpoints
├── service/
│   └── OrderService.java       ← Order business logic + FIFO allocation
└── client/
    ├── MedicineClient.java     ← Gets batch info from Catalogue Service
    └── AuthClient.java         ← Gets user info for admin order view
```

### Frontend
```
frontend/src/
├── api/
│   └── orderService.js         ← API calls for orders
├── features/order/
│   ├── MyOrdersPage.jsx        ← User's order history
│   └── OrderDetailsPage.jsx    ← Single order details
├── features/admin/
│   ├── AdminOrdersPage.jsx     ← Admin view of ALL orders
│   ├── OrdersTable.jsx         ← Table component for orders
│   └── OrderStatusModal.jsx    ← Modal to update order status
```

---

## 🗄️ Database Entities

### Order Entity (`orders` table)

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;              // Who placed the order
    private String orderNumber;       // Unique: "ORD-{userId}-{timestamp}"
    private LocalDateTime orderDate;  // When the order was placed
    private Double totalAmount;       // Total price
    private String status;            // PENDING → CONFIRMED → SHIPPED → DELIVERED
    private Long addressId;           // Delivery address reference
    private LocalDateTime deliveryDate;  // Expected delivery

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;    // Items in this order
}
```

### OrderItem Entity (`order_items` table)

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;              // Which order this belongs to

    private Long medicineId;          // Which medicine
    private Integer quantity;         // How many
    private Double priceAtPurchase;   // Price at time of purchase
    private Double unitPrice;         // Per-unit price
    private Double subtotal;          // quantity × unitPrice
    private Long batchId;             // Which batch the stock came from
}
```

**Why `batchId`?**
Each order item records which specific batch the stock was allocated from. This is essential for:
- Stock tracking
- Batch recall (if a batch is recalled, you know which orders are affected)
- FIFO compliance

---

## 🔄 Order Placement — The Complete Flow

### Step 1: User clicks "Place Order" on the payment page

```jsx
// CardPaymentNew.jsx
const orderResponse = await orderService.placeOrder(selectedAddress);
const orderId = orderResponse.id;
```

### Step 2: Frontend API call

```javascript
// orderService.js
export const orderService = {
    placeOrder: async (addressId) => {
        const res = await client.post("/api/orders/place", { addressId });
        return res.data;
    },
};
```

### Step 3: OrderController receives the request

```java
@PostMapping("/place")
public ResponseEntity<?> placeOrder(
        @RequestHeader("X-User-Id") String userIdStr,
        @RequestBody Map<String, Object> requestBody) {
    
    Long userId = Long.parseLong(userIdStr);
    Long addressId = Long.parseLong(requestBody.get("addressId").toString());
    
    OrderDTO order = orderService.placeOrder(userId, addressId);
    return ResponseEntity.ok(order);
}
```

### Step 4: FIFO Stock Allocation Algorithm ⭐

This is the most important part of the order system:

```java
// OrderService.java
public OrderDTO placeOrder(Long userId, Long addressId) {
    // 1. Get user's cart
    List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
    if (cartItems.isEmpty()) {
        throw new RuntimeException("Cart is empty");
    }

    // 2. Create order shell
    Order order = Order.builder()
        .userId(userId)
        .addressId(addressId)
        .status("PENDING")
        .build();

    List<OrderItem> orderItems = new ArrayList<>();
    Double totalAmount = 0.0;

    // 3. Process each cart item with FIFO allocation
    for (CartItem cartItem : cartItems) {
        int remainingQuantity = cartItem.getQuantity();

        // Get batches sorted by expiry date (earliest first)
        List<BatchDTO> batches = medicineClient
            .getAvailableBatches(cartItem.getMedicineId());

        if (batches == null || batches.isEmpty()) {
            throw new RuntimeException(
                "Medicine " + cartItem.getMedicineId() + " is out of stock"
            );
        }

        // Allocate from batches in FIFO order
        for (BatchDTO batch : batches) {
            if (remainingQuantity <= 0) break;

            // Take as much as possible from this batch
            int allocatedQty = Math.min(remainingQuantity, batch.getQtyAvailable());
            Double itemSubtotal = cartItem.getPrice() * allocatedQty;

            // Create order item linked to this specific batch
            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .medicineId(cartItem.getMedicineId())
                .quantity(allocatedQty)
                .priceAtPurchase(cartItem.getPrice())
                .unitPrice(cartItem.getPrice())
                .subtotal(itemSubtotal)
                .batchId(batch.getId())     // ← Links to specific batch
                .build();

            orderItems.add(orderItem);
            totalAmount += itemSubtotal;
            remainingQuantity -= allocatedQty;
        }

        // All quantity must be fulfilled
        if (remainingQuantity > 0) {
            throw new RuntimeException("Insufficient stock for medicine " 
                + cartItem.getMedicineId());
        }
    }

    // 4. Save order
    order.setTotalAmount(totalAmount);
    order.setItems(orderItems);
    order = orderRepository.save(order);

    return convertToDTO(order);
}
```

### FIFO Example:

```
Cart: Paracetamol × 80 units

Available Batches (sorted by expiry):
├── Batch A: 30 units, expires 2025-03-01 (earliest → use first)
├── Batch B: 50 units, expires 2025-06-15
└── Batch C: 100 units, expires 2025-12-31

Allocation:
├── OrderItem 1: 30 units from Batch A (Batch A now has 0 left)
├── OrderItem 2: 50 units from Batch B (Batch B now has 0 left)
└── Total: 80 units allocated ✅

Note: Batch C was not needed because A + B = 80
```

---

## 💳 Payment Finalization

After payment succeeds, the Payment Service calls back to finalize the order:

```java
// OrderService.java
public void finalizePayment(Long orderId, Long userId) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));

    // 1. Update status to CONFIRMED
    order.setStatus("CONFIRMED");
    orderRepository.save(order);

    // 2. ACTUALLY reduce batch quantities now
    for (OrderItem item : order.getItems()) {
        medicineClient.reduceBatchQuantity(
            item.getBatchId(),      // Which batch
            item.getQuantity()      // How many to deduct
        );
    }
}
```

**Why defer stock deduction to after payment?**
- If payment fails, stock isn't wasted
- Only confirmed orders affect inventory

---

## 📋 Order History (User Side)

### MyOrdersPage

```jsx
// MyOrdersPage.jsx
export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        orderService.getMyOrders().then(setOrders);
    }, []);
    
    return (
        <div>
            <h1>My Orders</h1>
            {orders.map(order => (
                <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                    <span>Order #{order.id}</span>
                    <span>₹{order.totalAmount}</span>
                    <StatusBadge status={order.status} />
                    <span>{formatDate(order.orderDate)}</span>
                </div>
            ))}
        </div>
    );
}
```

### OrderDetailsPage

```jsx
// OrderDetailsPage.jsx
export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    
    useEffect(() => {
        orderService.getOrderById(orderId).then(setOrder);
    }, [orderId]);
    
    // Shows:
    // - Order number, date, status badge
    // - Expected delivery date
    // - List of items with name, quantity, price
    // - Total amount
}
```

### Status Badges

```
PENDING     → 🟡 Yellow badge
CONFIRMED   → 🔵 Blue badge
SHIPPED     → 🟣 Purple badge
DELIVERED   → 🟢 Green badge
CANCELLED   → 🔴 Red badge
```

---

## 👨‍💼 Admin Order Management

### AdminOrdersPage

```jsx
// AdminOrdersPage.jsx
export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        // Fetches ALL orders (admin endpoint)
        orderService.getAllOrders().then(setOrders);
    }, []);
    
    return (
        <div>
            <OrdersTable orders={orders} onEdit={handleEdit} />
            <OrderStatusModal 
                order={selectedOrder}
                onSaved={fetchOrders}  // Refresh after update
            />
        </div>
    );
}
```

### Admin can:
1. **View all orders** from all users (enriched with user name/email)
2. **Update order status** (PENDING → CONFIRMED → SHIPPED → DELIVERED)
3. **Set delivery dates** 
4. **Cancel orders**

### Backend — Admin Orders Endpoint

```java
@GetMapping
public ResponseEntity<List<OrderDTO>> getOrders(
        @RequestHeader("X-User-Id") Long userId,
        @RequestParam(value = "admin", required = false) Boolean admin) {
    
    if (Boolean.TRUE.equals(admin)) {
        // Admin: fetch ALL orders enriched with user info
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    // Regular user: fetch only their orders
    List<OrderDTO> orders = orderService.getUserOrders(userId);
    return ResponseEntity.ok(orders);
}
```

### User Info Enrichment

When admin views orders, each order shows the user's name and email:

```java
public List<OrderDTO> getAllOrders() {
    List<Order> allOrders = orderRepository.findAll();
    
    return allOrders.stream().map(order -> {
        OrderDTO dto = convertToDTO(order);
        
        // Call Auth Service to get user details
        try {
            UserDTO user = authClient.getUserById(order.getUserId());
            dto.setUser(user);
        } catch (Exception e) {
            dto.setUser(UserDTO.builder()
                .fullName("Unknown User")
                .email("N/A")
                .build());
        }
        
        return dto;
    }).collect(Collectors.toList());
}
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/place` | User | Place order from cart |
| GET | `/api/orders` | User | Get user's orders |
| GET | `/api/orders?admin=true` | Admin | Get ALL orders |
| GET | `/api/orders/{id}` | User | Get order details |
| PUT | `/api/orders/{id}/status` | Admin | Update order status |
| PUT | `/api/orders/{id}` | Admin | Update status + delivery date |
| POST | `/api/orders/{id}/finalize-payment` | System | Called after payment success |

---

## 📊 Order Status Lifecycle

```
┌──────────┐     ┌───────────┐     ┌──────────┐     ┌───────────┐
│ PENDING  │ ──→ │ CONFIRMED │ ──→ │ SHIPPED  │ ──→ │ DELIVERED │
└──────────┘     └───────────┘     └──────────┘     └───────────┘
      │                                                    
      └──→ ┌───────────┐                                  
           │ CANCELLED │                                  
           └───────────┘                                  

PENDING    → Order created, awaiting payment
CONFIRMED  → Payment successful, stock deducted
SHIPPED    → Order dispatched to delivery
DELIVERED  → Order received by customer
CANCELLED  → Order cancelled (by admin)
```

---

*Next: Read [06_PAYMENT.md](./06_PAYMENT.md) to learn about payment processing.*
