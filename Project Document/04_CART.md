# 🛒 MediCart — Shopping Cart System

## What This Document Covers

How the cart works end-to-end:
- Adding/removing items from cart
- Quantity increment/decrement
- Redux state management with async thunks
- Backend cart service with database persistence
- Inter-service communication (Cart → Catalogue for medicine details)

---

## 📁 Files Involved

### Backend (Cart-Orders Service — Port 8083)
```
cart-orders-service/
├── entity/
│   └── CartItem.java           ← Cart item database entity
├── controller/
│   └── CartController.java     ← Cart REST endpoints
├── service/
│   └── CartService.java        ← Cart business logic
├── repository/
│   └── CartItemRepository.java ← Database queries
└── client/
    └── MedicineClient.java     ← Feign client to get medicine details
```

### Frontend
```
frontend/src/
├── api/
│   └── orderService.js         ← Contains cartService API calls
├── components/cart/
│   ├── CartPage.jsx            ← Cart page UI
│   └── cartSlice.js            ← Redux slice with async thunks
```

---

## 🗄️ CartItem Entity

```java
@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "medicine_id"})
})
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;          // Which user owns this cart item
    private Long medicineId;      // Which medicine
    private Integer quantity;     // How many
    private Double price;         // Price at time of adding
    private Double unitPrice;     // Unit price
    private Boolean inStock;      // Is it still in stock?
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Important:** The `@UniqueConstraint` on `(user_id, medicine_id)` means a user can't have two separate cart entries for the same medicine. If they add the same medicine again, the quantity is incremented instead.

---

## 🔄 Cart Flow — Adding an Item

### Step 1: User clicks "Add to Cart" on a medicine card

```jsx
// HomePage.jsx
const handleAddToCart = (medicine) => {
    dispatch(addToCart({ medicineId: medicine.id, quantity: 1 }));
};
```

### Step 2: Redux dispatches `addToCart` async thunk

```javascript
// cartSlice.js
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ medicineId, quantity }) => {
        // Calls POST /api/cart/add?medicineId=5&quantity=1
        const data = await cartService.addToCart(medicineId, quantity);
        return data;  // Returns the enriched cart item
    }
);
```

**What is `createAsyncThunk`?**

It's a Redux Toolkit helper that:
1. Dispatches `cart/addToCart/pending` → sets loading state
2. Runs the async function (API call)
3. On success: dispatches `cart/addToCart/fulfilled` → updates cart state
4. On error: dispatches `cart/addToCart/rejected` → shows error

### Step 3: Frontend API call

```javascript
// orderService.js → cartService
export const cartService = {
    addToCart: async (medicineId, quantity) => {
        const res = await client.post(
            `/api/cart/add?medicineId=${medicineId}&quantity=${quantity}`
        );
        return res.data;
    },
    
    getCart: async () => {
        const res = await client.get("/api/cart");
        return res.data;
    },
    
    updateCartItem: async (itemId, quantity) => {
        const res = await client.put(
            `/api/cart/update/${itemId}?quantity=${quantity}`
        );
        return res.data;
    },
};
```

### Step 4: API Gateway routes to Cart-Orders Service

```properties
# application.properties (API Gateway)
spring.cloud.gateway.routes[3].id=cart-service
spring.cloud.gateway.routes[3].uri=lb://cart-orders-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/cart/**
```

### Step 5: CartController handles the request

```java
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @RequestHeader("X-User-Id") Long userId,  // From JWT via Gateway
            @RequestParam Long medicineId,
            @RequestParam Integer quantity) {

        // First, get medicine details from Admin-Catalogue Service
        MedicineDTO medicineDTO = medicineClient.getMedicineById(medicineId);
        
        if (medicineDTO == null) {
            return ResponseEntity.badRequest().build();
        }

        CartItemDTO cartItem = cartService.addToCart(
            userId, medicineId, quantity, medicineDTO
        );
        return ResponseEntity.ok(cartItem);
    }
}
```

### Step 6: CartService — UPSERT Logic

```java
// CartService.java
public CartItemDTO addToCart(Long userId, Long medicineId, 
                             Integer quantity, MedicineDTO medicineDTO) {
    // Check if this medicine is already in user's cart
    CartItem cartItem = cartItemRepository
        .findByUserIdAndMedicineId(userId, medicineId)
        .orElse(null);

    if (cartItem != null) {
        // Already in cart → just increment quantity
        cartItem.setQuantity(cartItem.getQuantity() + quantity);
    } else {
        // New item → create new cart entry
        cartItem = CartItem.builder()
            .userId(userId)
            .medicineId(medicineId)
            .quantity(quantity)
            .price(medicineDTO.getPrice())
            .inStock(medicineDTO.getInStock())
            .build();
    }

    cartItem = cartItemRepository.save(cartItem);
    return convertToDTO(cartItem, medicineDTO);
}
```

### Step 7: Inter-Service Communication (Feign Client)

```java
// MedicineClient.java
@FeignClient(name = "admin-catalogue-service")
public interface MedicineClient {
    @GetMapping("/medicines/{id}")
    MedicineDTO getMedicineById(@PathVariable("id") Long medicineId);
}
```

**How Feign Works:**
1. `@FeignClient(name = "admin-catalogue-service")` — tells Feign to look up this service in Eureka
2. Eureka returns the URL: `http://192.168.x.x:8082`
3. Feign makes a GET request to `http://192.168.x.x:8082/medicines/5`
4. Response is automatically converted from JSON to `MedicineDTO` Java object

---

## 📱 Frontend — Cart Page UI

```jsx
// CartPage.jsx (simplified)
export default function CartPage() {
    const dispatch = useDispatch();
    const { items, status } = useSelector(state => state.cart);
    
    // Fetch cart from backend on page load
    useEffect(() => {
        dispatch(fetchCart());
    }, []);
    
    // Calculate totals
    const subtotal = items.reduce((acc, item) => 
        acc + (item.product?.price || 0) * item.qty, 0
    );
    
    return (
        <div>
            {items.map(item => (
                <div key={item.id}>
                    <span>{item.product?.name}</span>
                    <span>₹{item.product?.price}</span>
                    
                    {/* Quantity Controls */}
                    <button onClick={() => dispatch(decrementQty(item.id))}>
                        −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => dispatch(incrementQty(item.id))}>
                        +
                    </button>
                    
                    <span>₹{(item.product?.price * item.qty).toFixed(2)}</span>
                </div>
            ))}
            
            {/* Order Summary */}
            <div>
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <button onClick={() => navigate("/address")}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}
```

---

## 🔄 Redux Cart Slice — All Thunks

```javascript
// cartSlice.js

// 1. FETCH CART — Get all cart items from backend
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async () => {
        const data = await cartService.getCart();
        // Map backend format to frontend format
        return data.map(item => ({
            id: item.id,
            product: item.medicine,       // Full medicine object
            qty: item.quantity,
        }));
    }
);

// 2. ADD TO CART
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ medicineId, quantity }) => {
        const data = await cartService.addToCart(medicineId, quantity);
        return {
            id: data.id,
            product: data.medicine,
            qty: data.quantity,
        };
    }
);

// 3. INCREMENT QUANTITY (+1)
export const incrementQty = createAsyncThunk(
    "cart/incrementQty",
    async (itemId, { getState }) => {
        const item = getState().cart.items.find(i => i.id === itemId);
        const newQty = item.qty + 1;
        const data = await cartService.updateCartItem(itemId, newQty);
        return { id: data.id, product: data.medicine, qty: data.quantity };
    }
);

// 4. DECREMENT QUANTITY (-1) — removes if qty reaches 0
export const decrementQty = createAsyncThunk(
    "cart/decrementQty",
    async (itemId, { getState }) => {
        const item = getState().cart.items.find(i => i.id === itemId);
        const newQty = item.qty - 1;
        
        if (newQty <= 0) {
            await cartService.removeFromCart(itemId);
            return { id: itemId, removed: true };
        }
        
        const data = await cartService.updateCartItem(itemId, newQty);
        return { id: data.id, product: data.medicine, qty: data.quantity };
    }
);

// Redux slice
const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        status: "idle",    // "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {
        clearCart: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = "succeeded";
            })
            // Add to cart
            .addCase(addToCart.fulfilled, (state, action) => {
                const existing = state.items.find(
                    i => i.id === action.payload.id
                );
                if (existing) {
                    existing.qty = action.payload.qty;
                } else {
                    state.items.push(action.payload);
                }
            })
            // Increment/Decrement
            .addCase(incrementQty.fulfilled, (state, action) => {
                const item = state.items.find(i => i.id === action.payload.id);
                if (item) item.qty = action.payload.qty;
            })
            .addCase(decrementQty.fulfilled, (state, action) => {
                if (action.payload.removed) {
                    state.items = state.items.filter(
                        i => i.id !== action.payload.id
                    );
                } else {
                    const item = state.items.find(
                        i => i.id === action.payload.id
                    );
                    if (item) item.qty = action.payload.qty;
                }
            });
    },
});
```

---

## 🔗 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cart/add?medicineId=5&quantity=1` | Add item to cart (upsert) |
| GET | `/api/cart` | Get user's cart items |
| PUT | `/api/cart/update/{itemId}?quantity=3` | Update item quantity |
| DELETE | `/api/cart/remove/{itemId}` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |
| GET | `/api/cart/total` | Get cart total price |

> **Note:** All cart endpoints require authentication. The `X-User-Id` header (injected by the API Gateway from the JWT token) identifies which user's cart to operate on.

---

## 🔑 Key Design Decisions

### 1. Server-Side Cart (Not Client-Side)
Cart is stored in the **database**, not just in browser memory. This means:
- Cart persists across page refreshes
- Cart persists across devices (same account)
- Cart data is secure (can't be tampered with)

### 2. UPSERT Pattern
Adding the same medicine twice doesn't create a duplicate — it increments the quantity. This is handled by the `findByUserIdAndMedicineId` check.

### 3. Medicine Enrichment
The cart only stores `medicineId` and `quantity` in the database. When fetching the cart, the service calls Admin-Catalogue Service (via Feign) to get the full medicine details (name, price, description).

### 4. Cart Cleared After Payment (Not After Order)
The cart is NOT cleared when an order is placed. It's cleared **after successful payment**. This way, if payment fails, the user's cart is still intact.

---

*Next: Read [05_ORDERS.md](./05_ORDERS.md) to learn about order placement.*
