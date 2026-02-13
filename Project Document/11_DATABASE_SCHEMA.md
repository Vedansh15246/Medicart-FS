# 11 — Database Schema & Data Model

## 📌 What This Document Covers

This document explains every **database**, **table**, and **column** used in the MediCart project. The project uses **MySQL 8.0** with **5 separate databases** — one per microservice. Hibernate (JPA) automatically creates and updates tables using `ddl-auto=update`.

---

## 🏗️ Database Architecture

```
MySQL Server (localhost:3306, root/root)
│
├── auth_service_db          ← Auth Service (port 8081)
│   ├── roles
│   └── users
│
├── admin_catalogue_db       ← Admin-Catalogue Service (port 8082)
│   ├── medicines
│   └── batches
│
├── cart_orders_db           ← Cart-Orders Service (port 8083)
│   ├── cart_items
│   ├── orders
│   ├── order_items
│   └── addresses
│
├── payment_db               ← Payment Service (port 8086)
│   ├── payments
│   └── transactions
│
└── analytics_db             ← Analytics Service (port 8085)
    └── (no tables — uses mock data)
```

**Why separate databases?**
Each microservice owns its own data. This is a core microservice principle called **Database per Service**. Services can't directly query each other's tables — they must use REST APIs (Feign clients) instead.

---

## 🔑 Key Concepts for Beginners

### What is JPA / Hibernate?
**JPA** (Java Persistence API) is a Java standard for mapping Java objects to database tables. **Hibernate** is the most popular implementation of JPA. You write Java classes (entities), and Hibernate automatically creates SQL tables from them.

### What is `ddl-auto=update`?
```properties
spring.jpa.hibernate.ddl-auto=update
```
This tells Hibernate: "On startup, check my entity classes. If the table doesn't exist, create it. If I added a new column, add it to the table. But NEVER delete existing data." All 5 services use this setting.

| Value | What it does |
|-------|-------------|
| `create` | Drop all tables, recreate on every startup (DESTROYS DATA) |
| `create-drop` | Create on startup, drop on shutdown |
| `update` | Add new tables/columns, never delete ✅ (Our setting) |
| `validate` | Only check that tables match entities, don't change anything |
| `none` | Do nothing |

### What are JPA Annotations?
Annotations like `@Entity`, `@Table`, `@Column` tell Hibernate how to map your Java class to a database table:

```java
@Entity                          // "This class represents a database table"
@Table(name = "users")           // "The table is called 'users'"
public class User {
    @Id                          // "This is the primary key"
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // "Auto-increment"
    private Long id;
    
    @Column(unique = true, nullable = false)  // "UNIQUE NOT NULL"
    private String email;
    
    @ManyToOne                   // "Foreign key relationship"
    @JoinColumn(name = "role_id") // "The FK column is called 'role_id'"
    private Role role;
}
```

---

## 📊 Database 1: `auth_service_db` (Auth Service)

### Table: `roles`

Stores user roles (USER or ADMIN).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique role ID |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Role name: "ROLE_USER" or "ROLE_ADMIN" |
| `description` | TEXT | nullable | Human-readable description |

**Entity class:** `Role.java`
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;                    // "ROLE_USER" or "ROLE_ADMIN"

    @Column(columnDefinition = "TEXT")
    private String description;             // "Regular user" or "Administrator"
}
```

**Sample data:**
| id | name | description |
|----|------|-------------|
| 1 | ROLE_USER | Regular user |
| 2 | ROLE_ADMIN | Administrator |

---

### Table: `users`

Stores all registered users (customers and admins).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `full_name` | VARCHAR(255) | NOT NULL | User's full name |
| `phone` | VARCHAR(255) | NOT NULL | Phone number |
| `is_active` | BIT(1) | NOT NULL, DEFAULT true | Account active status |
| `role_id` | BIGINT | FK → roles(id) | User's role |
| `created_at` | DATETIME | NOT NULL | Auto-set on insert |
| `updated_at` | DATETIME | nullable | Auto-set on update |

**Entity class:** `User.java`
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;           // BCrypt encoded: "$2a$10$..."

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;   // Can disable accounts

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;                 // FK → roles table

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;   // Set by @PrePersist

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;   // Set by @PreUpdate
}
```

**Relationship:**
```
roles (1) ←──────── (N) users
  One role has many users.
  Each user has exactly one role.
```

**Lifecycle callbacks:**
```java
@PrePersist    // Runs BEFORE inserting a new row
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate     // Runs BEFORE updating an existing row
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```

---

## 📊 Database 2: `admin_catalogue_db` (Admin-Catalogue Service)

### Table: `medicines`

Stores the product catalog — all medicines available for sale.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique medicine ID |
| `name` | VARCHAR(255) | NOT NULL | Medicine name ("Paracetamol") |
| `category` | VARCHAR(255) | NOT NULL | Category ("Pain Relief") |
| `price` | DOUBLE | NOT NULL | Base price |
| `sku` | VARCHAR(255) | UNIQUE, NOT NULL | Stock Keeping Unit code |
| `requires_rx` | BIT(1) | NOT NULL, DEFAULT false | Prescription required? |
| `description` | TEXT | nullable | Medicine description |
| `total_quantity` | INT | NOT NULL, DEFAULT 0 | Sum of all batch quantities |
| `in_stock` | BIT(1) | NOT NULL, DEFAULT true | Available for purchase? |
| `created_at` | DATETIME | NOT NULL | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Entity class:** `Medicine.java`
```java
@Entity
@Table(name = "medicines")
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(unique = true, nullable = false)
    private String sku;             // e.g., "MED-001", unique identifier

    @Column(nullable = false)
    @Builder.Default
    private Boolean requiresRx = false;   // Prescription needed?

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalQuantity = 0;    // Calculated from batches

    @Column(nullable = false)
    @Builder.Default
    private Boolean inStock = true;
}
```

---

### Table: `batches`

Each medicine can have multiple batches (from different suppliers, with different expiry dates).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique batch ID |
| `medicine_id` | BIGINT | FK → medicines(id), NOT NULL | Which medicine |
| `batch_number` | VARCHAR(255) | NOT NULL | Batch code ("BATCH-001") |
| `expiry_date` | DATE | NOT NULL | When the batch expires |
| `quantity_available` | INT | NOT NULL, DEFAULT 0 | Stock remaining |
| `quantity_total` | INT | NOT NULL, DEFAULT 0 | Original stock amount |
| `selling_price` | DOUBLE | NOT NULL, DEFAULT 0.0 | Price for this batch |
| `version` | BIGINT | nullable | Optimistic locking version |
| `created_at` | DATETIME | NOT NULL | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Entity class:** `Batch.java`
```java
@Entity
@Table(name = "batches")
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;             // FK → medicines table

    @Column(name = "batch_number", nullable = false)
    @Builder.Default
    private String batchNo = "";

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(name = "quantity_available", nullable = false)
    @Builder.Default
    private Integer qtyAvailable = 0;      // Decreases when purchased

    @Column(name = "quantity_total", nullable = false)
    @Builder.Default
    private Integer qtyTotal = 0;          // Original amount

    @Column(name = "selling_price", nullable = false)
    @Builder.Default
    private Double sellingPrice = 0.0;

    @Version
    private Long version;                  // Optimistic locking
}
```

**Relationship:**
```
medicines (1) ←──────── (N) batches
  One medicine has many batches.
  Each batch belongs to one medicine.
```

**What is `@Version` (Optimistic Locking)?**
```
Two users try to buy the last item at the same time:

User A reads: batch.qtyAvailable = 1, version = 5
User B reads: batch.qtyAvailable = 1, version = 5

User A saves: SET qtyAvailable = 0 WHERE version = 5  → ✅ Success, version → 6
User B saves: SET qtyAvailable = 0 WHERE version = 5  → ❌ Fails! Version is now 6

This prevents "overselling" — two people buying the same last item.
```

---

## 📊 Database 3: `cart_orders_db` (Cart-Orders Service)

### Table: `cart_items`

Stores items currently in users' shopping carts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique cart item ID |
| `user_id` | BIGINT | NOT NULL, UNIQUE(user_id + medicine_id) | Which user |
| `medicine_id` | BIGINT | NOT NULL, UNIQUE(user_id + medicine_id) | Which medicine |
| `quantity` | INT | NOT NULL | How many |
| `price` | DOUBLE | NOT NULL | Total price (quantity × unit_price) |
| `unit_price` | DOUBLE | NOT NULL, DEFAULT 0.0 | Price per unit |
| `in_stock` | BIT(1) | NOT NULL, DEFAULT true | Still available? |
| `created_at` | DATETIME | NOT NULL | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Entity class:** `CartItem.java`
```java
@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "medicine_id"})
})
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;          // Not an FK — user is in a different database!

    @Column(nullable = false)
    private Long medicineId;      // Not an FK — medicine is in a different database!

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double price;         // Total = quantity × unitPrice

    @Column(name = "unit_price", nullable = false)
    @Builder.Default
    private Double unitPrice = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean inStock = true;
}
```

**Important: No foreign keys to other databases!**
```
In a monolithic app, you'd have:
  FK: cart_items.user_id → users.id
  FK: cart_items.medicine_id → medicines.id

In microservices, these are in DIFFERENT databases!
So we just store the IDs as plain numbers.
The service uses Feign clients to fetch the actual data from other services.
```

**Unique Constraint:**
```sql
UNIQUE(user_id, medicine_id)
-- A user can only have ONE cart entry per medicine.
-- Adding the same medicine again increases quantity instead.
```

---

### Table: `orders`

Stores placed orders (after checkout).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique order ID |
| `user_id` | BIGINT | NOT NULL | Which user placed the order |
| `order_number` | VARCHAR(50) | UNIQUE, NOT NULL | e.g., "ORD-42-1718394872345" |
| `order_date` | DATETIME | NOT NULL | When the order was placed |
| `total_amount` | DOUBLE | NOT NULL | Total price of all items |
| `status` | VARCHAR(255) | NOT NULL, DEFAULT "PENDING" | Order status |
| `address_id` | BIGINT | NOT NULL | FK → addresses(id) |
| `delivery_date` | DATETIME | nullable | Estimated/actual delivery |
| `created_at` | DATETIME | NOT NULL | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Order Status Flow:**
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
    │
    └──→ CANCELLED
```

**Entity class:** `Order.java`
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(nullable = false)
    private Long addressId;           // FK → addresses table (same DB)

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;    // Order has many order items

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;
}
```

**Auto-generated order number:**
```java
@PrePersist
protected void onCreate() {
    if (orderNumber == null) {
        orderNumber = "ORD-" + userId + "-" + System.currentTimeMillis();
        // Example: "ORD-42-1718394872345"
    }
}
```

---

### Table: `order_items`

Each order has multiple items (the medicines purchased).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique order item ID |
| `order_id` | BIGINT | FK → orders(id), NOT NULL | Which order |
| `medicine_id` | BIGINT | NOT NULL | Which medicine was bought |
| `quantity` | INT | NOT NULL | How many units |
| `price_at_purchase` | DOUBLE | NOT NULL | Price when bought (snapshot) |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price per unit |
| `subtotal` | DECIMAL(10,2) | NOT NULL | quantity × unitPrice |
| `batch_id` | BIGINT | NOT NULL | Which batch was used |
| `created_at` | DATETIME | NOT NULL | Auto-set |

**Entity class:** `OrderItem.java`
```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;              // FK → orders table

    @Column(nullable = false)
    private Long medicineId;          // Not FK — different database

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double priceAtPurchase;   // Snapshot! Price may change later

    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double unitPrice;

    @Column(nullable = false, columnDefinition = "DECIMAL(10,2)")
    private Double subtotal;          // quantity × unitPrice

    @Column(nullable = false)
    private Long batchId;             // Which batch was sold
}
```

**Why snapshot the price?**
```
Medicine price today: ₹100
User buys 2 → priceAtPurchase = ₹100
Tomorrow medicine price changes to ₹150
User's order still shows ₹100 (the price they actually paid)
```

**Relationship:**
```
orders (1) ←──────── (N) order_items
  One order has many items.
  Each item belongs to one order.
  
CascadeType.ALL means:
  Delete an order → all its items are also deleted
  Save an order with items → all items are saved too
```

---

### Table: `addresses`

Stores user delivery addresses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique address ID |
| `user_id` | BIGINT | NOT NULL | Which user |
| `name` | VARCHAR(255) | NOT NULL, DEFAULT "" | Recipient name |
| `street_address` | VARCHAR(255) | NOT NULL | Street/house |
| `address_line1` | VARCHAR(255) | NOT NULL, DEFAULT "" | Additional line 1 |
| `address_line2` | VARCHAR(255) | nullable | Additional line 2 |
| `city` | VARCHAR(255) | NOT NULL | City |
| `state` | VARCHAR(255) | NOT NULL | State/Province |
| `postal_code` | VARCHAR(255) | NOT NULL | ZIP/Postal code |
| `country` | VARCHAR(255) | NOT NULL, DEFAULT "USA" | Country |
| `phone` | VARCHAR(255) | NOT NULL | Contact phone |
| `is_default` | BIT(1) | NOT NULL, DEFAULT false | Is default address? |
| `created_at` | DATETIME | NOT NULL | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Entity class:** `Address.java`
```java
@Entity
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    @Builder.Default
    private String name = "";         // Recipient name

    @Column(name = "street_address", nullable = false)
    private String streetAddress;

    @Column(name = "address_line1", nullable = false)
    @Builder.Default
    private String addressLine1 = "";

    @Column(name = "address_line2")
    private String addressLine2;      // Optional

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    @Column(nullable = false)
    @Builder.Default
    private String country = "USA";

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;   // Only one per user
}
```

---

## 📊 Database 4: `payment_db` (Payment Service)

### Table: `payments`

Stores payment records for each order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique payment ID |
| `order_id` | BIGINT | NOT NULL | Which order this payment is for |
| `user_id` | BIGINT | NOT NULL | Who paid |
| `amount` | DECIMAL(19,2) | NOT NULL | Payment amount |
| `payment_status` | VARCHAR(255) | nullable | PENDING/PROCESSING/SUCCESS/FAILED/REFUNDED |
| `payment_method` | VARCHAR(255) | nullable | CARD/UPI/NET_BANKING/COD |
| `transaction_id` | VARCHAR(255) | nullable | Gateway transaction reference |
| `payment_date` | DATETIME | nullable | When payment was completed |
| `created_at` | DATETIME | nullable | Auto-set |
| `updated_at` | DATETIME | nullable | Auto-set |

**Entity class:** `Payment.java`
```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;         // BigDecimal for money (precise)

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)       // Store enum as text, not number
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method")
    private String paymentMethod;      // "CARD", "UPI", "NET_BANKING", "COD"

    @Column(name = "transaction_id")
    private String transactionId;      // "TXN-1718394872345"

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    // Enum for status
    public enum PaymentStatus {
        PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED
    }
}
```

**Payment Status Flow:**
```
PENDING → PROCESSING → SUCCESS
                  │
                  └──→ FAILED
                  
SUCCESS → REFUNDED (future feature)
```

---

### Table: `transactions`

Stores individual transaction records (each payment attempt).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Unique transaction ID |
| `payment_id` | BIGINT | NOT NULL | Which payment this belongs to |
| `transaction_type` | VARCHAR(255) | nullable | PAYMENT/REFUND/ADJUSTMENT |
| `amount` | DECIMAL(19,2) | nullable | Transaction amount |
| `description` | VARCHAR(255) | nullable | Human-readable description |
| `transaction_id` | VARCHAR(255) | nullable | External reference |
| `status` | VARCHAR(255) | nullable | PENDING/SUCCESS/FAILED |
| `created_at` | DATETIME | nullable | Auto-set |

**Entity class:** `Transaction.java`
```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "transaction_type")
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "description")
    private String description;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    public enum TransactionType {
        PAYMENT, REFUND, ADJUSTMENT
    }

    public enum TransactionStatus {
        PENDING, SUCCESS, FAILED
    }
}
```

---

## 📊 Database 5: `analytics_db` (Analytics Service)

The analytics service has **no entity classes and no tables**. It currently uses mock data (hardcoded responses in the controller). In a production app, you'd store analytics events here.

---

## 🔗 Cross-Service Relationships

Because each service has its own database, we can't use SQL foreign keys across databases. Instead, we store IDs and use Feign clients to fetch related data.

```
auth_service_db          admin_catalogue_db         cart_orders_db           payment_db
┌──────────┐             ┌──────────┐               ┌──────────┐           ┌──────────┐
│  users   │             │ medicines│               │cart_items │           │ payments │
│  id ─────┼──────────── │  id ─────┼────────────── │ userId   │           │ orderId──┼───┐
│  email   │  stored as  │  name    │  stored as    │ medicineId│           │ userId   │   │
│  role_id │  plain Long │  sku     │  plain Long   │ quantity │           │ amount   │   │
└──────────┘             │  price   │               └──────────┘           └──────────┘   │
                         └──────────┘               ┌──────────┐                           │
                         ┌──────────┐               │ orders   │ ◄─────────────────────────┘
                         │ batches  │               │ id       │
                         │ id ──────┼─── stored as  │ userId   │
                         │ medicineId│   plain Long  │orderNumber│
                         │ expiryDate│              │ addressId │──→ addresses (same DB)
                         └──────────┘               └──────────┘
                                                    ┌──────────┐
                                                    │order_items│
                                                    │ orderId──┼──→ orders (same DB, real FK)
                                                    │ medicineId│
                                                    │ batchId  │
                                                    └──────────┘
```

**Real foreign keys (same database):**
- `users.role_id` → `roles.id` (auth_service_db)
- `batches.medicine_id` → `medicines.id` (admin_catalogue_db)
- `order_items.order_id` → `orders.id` (cart_orders_db)
- `orders.address_id` → `addresses.id` (cart_orders_db)

**Cross-service references (just IDs, no FK):**
- `cart_items.userId` → user in auth_service_db
- `cart_items.medicineId` → medicine in admin_catalogue_db
- `order_items.medicineId` → medicine in admin_catalogue_db
- `order_items.batchId` → batch in admin_catalogue_db
- `orders.userId` → user in auth_service_db
- `payments.orderId` → order in cart_orders_db
- `payments.userId` → user in auth_service_db

---

## 🛠️ Database Setup

### 1. Create All Databases

```sql
CREATE DATABASE IF NOT EXISTS auth_service_db;
CREATE DATABASE IF NOT EXISTS admin_catalogue_db;
CREATE DATABASE IF NOT EXISTS cart_orders_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS analytics_db;
```

### 2. Seed the Roles

The `roles` table must be populated before any user can register:

```sql
USE auth_service_db;

INSERT INTO roles (id, name, description) VALUES 
  (1, 'ROLE_USER', 'Regular user'),
  (2, 'ROLE_ADMIN', 'Administrator');
```

### 3. Start All Services

Hibernate (`ddl-auto=update`) creates all tables automatically on first startup. Just start the services and the tables appear!

### 4. Connection Properties

Each service connects via:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/<database_name>?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

---

## 📊 Entity Summary Table

| Entity | Table | Database | Columns | Key Relationships |
|--------|-------|----------|---------|-------------------|
| Role | roles | auth_service_db | id, name, description | Has many Users |
| User | users | auth_service_db | id, email, password, fullName, phone, isActive, role_id | Belongs to Role |
| Medicine | medicines | admin_catalogue_db | id, name, category, price, sku, requiresRx, description, totalQuantity, inStock | Has many Batches |
| Batch | batches | admin_catalogue_db | id, medicine_id, batchNo, expiryDate, qtyAvailable, qtyTotal, sellingPrice, version | Belongs to Medicine |
| CartItem | cart_items | cart_orders_db | id, userId, medicineId, quantity, price, unitPrice, inStock | References User + Medicine (cross-service) |
| Order | orders | cart_orders_db | id, userId, orderNumber, orderDate, totalAmount, status, addressId, deliveryDate | Has many OrderItems, references Address |
| OrderItem | order_items | cart_orders_db | id, order_id, medicineId, quantity, priceAtPurchase, unitPrice, subtotal, batchId | Belongs to Order |
| Address | addresses | cart_orders_db | id, userId, name, streetAddress, city, state, postalCode, country, phone, isDefault | Referenced by Orders |
| Payment | payments | payment_db | id, orderId, userId, amount, paymentStatus, paymentMethod, transactionId, paymentDate | References Order (cross-service) |
| Transaction | transactions | payment_db | id, paymentId, transactionType, amount, description, transactionId, status | Belongs to Payment |

---

## 🧠 Key Takeaways

1. **Database per Service** — Each microservice owns its data. No shared databases.
2. **Hibernate creates tables** — `ddl-auto=update` means you never write CREATE TABLE SQL.
3. **Entities = Tables** — Each `@Entity` class maps to exactly one database table.
4. **Same-DB relations use `@ManyToOne`/`@OneToMany`** — Real JPA relationships with foreign keys.
5. **Cross-DB relations store IDs** — Just plain `Long` values, resolved via Feign clients at runtime.
6. **`@Version` for concurrency** — Prevents two users from buying the same last item.
7. **`@Enumerated(EnumType.STRING)`** — Stores enums as readable text ("SUCCESS") not numbers (2).
8. **`BigDecimal` for money** — Payment amounts use `BigDecimal` for precision (no floating-point errors).
9. **Price snapshots** — `priceAtPurchase` in OrderItem preserves the price at time of purchase.
10. **`@PrePersist` / `@PreUpdate`** — Automatically set `createdAt` and `updatedAt` timestamps.
