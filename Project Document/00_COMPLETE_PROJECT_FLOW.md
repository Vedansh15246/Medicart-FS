# 🏥 MediCart — Complete Project Overview

## Welcome!

This document is the **master guide** for the entire MediCart project. If you're a complete beginner, start here. This will give you a bird's-eye view of every piece of the project before you dive into individual READMEs.

---

## 📌 What is MediCart?

MediCart is an **online pharmacy e-commerce platform** where:

- **Customers** can browse medicines, add them to cart, place orders, pay online, and track deliveries.
- **Admins** can manage the medicine catalog, view all orders, manage users, and see analytics dashboards.

Think of it like **Amazon, but specifically for medicines**.

---

## 🏗️ Architecture — How the Project is Structured

MediCart uses a **Microservices Architecture**. Instead of one giant application, it's broken into small, independent services that talk to each other.

### The Two Big Parts

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│               Runs on http://localhost:5173                      │
│                                                                  │
│   What the user sees and interacts with in their browser         │
│   Built with: React + Vite + Redux + TailwindCSS                │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTP Requests (API calls)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Port 8080)                       │
│                                                                  │
│   The single entry point. All frontend requests go here first.   │
│   It checks JWT tokens and routes requests to the right service. │
└─────────────────────────┬────────────────────────────────────────┘
                          │ Routes to...
          ┌───────────────┼───────────────┬──────────────┐
          ▼               ▼               ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Auth    │   │  Admin   │   │  Cart &  │   │ Payment  │
    │ Service  │   │ Catalog  │   │  Orders  │   │ Service  │
    │  :8081   │   │ Service  │   │ Service  │   │  :8086   │
    │          │   │  :8082   │   │  :8083   │   │          │
    └──────────┘   └──────────┘   └──────────┘   └──────────┘
          │               │               │              │
          ▼               ▼               ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │auth_     │   │admin_    │   │cart_     │   │payment_  │
    │service_db│   │catalogue_│   │orders_db│   │db        │
    │          │   │db        │   │          │   │          │
    └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                       
    ┌──────────────────────────────────────────────────────────┐
    │  Eureka Server (Port 8761) — Service Discovery           │
    │  All services register here so they can find each other  │
    └──────────────────────────────────────────────────────────┘
    
    ┌──────────────────────────────────────────────────────────┐
    │  Analytics Service (Port 8085) — Dashboard & Reports     │
    └──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library for building user interfaces |
| **Vite** | Super-fast build tool (replaces Webpack) |
| **Redux Toolkit** | State management (cart, auth, search) |
| **TanStack Query** | Server data fetching and caching |
| **React Router v6** | Page navigation and routing |
| **Tailwind CSS** | Utility-first CSS framework |
| **Axios** | HTTP client for API calls |
| **Recharts** | Charts library for analytics dashboard |
| **jsPDF** | PDF receipt generation |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Java 21** | Programming language |
| **Spring Boot 3.4.2** | Framework for building microservices |
| **Spring Cloud Gateway** | API Gateway for routing |
| **Spring Cloud Netflix Eureka** | Service discovery |
| **Spring Data JPA** | Database access (ORM) |
| **Spring Security** | Authentication & authorization |
| **OpenFeign** | Inter-service HTTP communication |
| **MySQL 8.0** | Relational database |
| **jjwt (JSON Web Token)** | Token-based authentication |
| **Lombok** | Reduces Java boilerplate code |
| **Maven** | Build tool and dependency management |

---

## 🔄 Complete User Flow — What Happens When a User Uses MediCart

### Flow 1: Registration & Login

```
User opens http://localhost:5173
    → Sees HomePage with medicine listings
    → Clicks "Sign Up" 
    → Fills in: Full Name, Email, Phone, Password
    → Frontend sends POST /auth/register to API Gateway (port 8080)
    → Gateway forwards to Auth Service (port 8081)
    → Auth Service:
        1. Checks if email already exists
        2. Hashes password with BCrypt
        3. Saves user to `auth_service_db.users` table
        4. Generates JWT token with userId, email, role
    → Returns JWT token to frontend
    → Frontend saves token in localStorage
    → User is now logged in!
```

### Flow 2: Browsing Medicines

```
User visits HomePage
    → Frontend calls GET /medicines via API Gateway
    → Gateway routes to Admin-Catalogue Service (port 8082)
    → Service queries `admin_catalogue_db.medicines` table
    → Returns list of medicines with stock status
    → Frontend displays medicine cards in a grid
    → User can:
        - Search by name (filters client-side)
        - Filter by category (All, Pain Relief, Antibiotics, etc.)
        - Click a medicine to see details in a modal
```

### Flow 3: Adding to Cart

```
User clicks "Add to Cart" on a medicine
    → Frontend dispatches Redux `addToCart` action
    → Calls POST /api/cart/add?medicineId=5&quantity=1
    → Gateway forwards to Cart-Orders Service (port 8083)
    → Cart Service:
        1. Checks if item already in cart (UPSERT)
        2. If yes, increments quantity
        3. If no, creates new cart item
        4. Enriches with medicine details from Admin-Catalogue (Feign client)
    → Returns enriched cart item
    → Frontend updates Redux cart state
```

### Flow 4: Checkout & Payment

```
User clicks "Proceed to Checkout" from Cart
    → Goes to Address Page (/address)
    → Selects/adds a delivery address
    → Clicks "Continue to Payment"
    → Goes to Checkout Page (/payment)
        - Sees order summary: items, subtotal, 18% GST, delivery charges
        - Delivery is FREE if subtotal > ₹500
    → Clicks "Select Payment Method"
    → Goes to Payment Select page (/payment/select)
        - Chooses: Credit Card / Debit Card / UPI / Net Banking
    → Fills payment details (e.g., card number, UPI ID)
    → On submit:
        STEP 1: Creates Order → POST /api/orders/place (with addressId)
                Cart-Orders Service uses FIFO batch allocation
        STEP 2: Processes Payment → POST /api/payment/process
                Payment Service records payment and transaction
        STEP 3: Finalizes → Payment Service calls Cart-Orders to:
                - Update order status to "CONFIRMED"
                - Reduce batch quantities (stock deduction)
                - Clear cart
        STEP 4: Navigates to Success page with receipt
    → User can download PDF receipt
```

### Flow 5: Order Tracking

```
User goes to My Orders page (/orders)
    → Frontend calls GET /api/orders (with X-User-Id header)
    → Sees all past orders with status badges:
        - PENDING (yellow)
        - CONFIRMED (blue)
        - SHIPPED (purple)
        - DELIVERED (green)
        - CANCELLED (red)
    → Clicks an order to see full details
        - Items, quantities, prices
        - Expected delivery date
        - Order number
```

### Flow 6: Admin Panel

```
Admin goes to /admin/login
    → Logs in with admin@medicart.com / admin123
    → Redirected to /admin/products
    → Admin Dashboard has these sections:
        - Products: Add/edit/delete medicines
        - Batches: Manage stock batches with expiry dates
        - Dashboard: Revenue charts, order stats, top products
        - Reports: Generate sales/inventory/compliance reports
        - Orders: View all user orders, update status, set delivery dates
        - Users: View all registered users, delete users
```

---

## 📁 Project Folder Structure

```
Project work/
├── frontend/                  ← React frontend app
│   ├── src/
│   │   ├── api/               ← API service files (Axios calls)
│   │   ├── components/        ← Reusable UI components
│   │   ├── features/          ← Feature-specific pages
│   │   │   ├── auth/          ← Login, Register, OTP pages
│   │   │   ├── catalog/       ← Home page, medicine listing
│   │   │   ├── admin/         ← Admin panel pages
│   │   │   ├── order/         ← My Orders, Order Details
│   │   │   ├── payment/       ← Checkout, Payment pages
│   │   │   └── delivery/      ← Address management
│   │   ├── store/             ← Redux store configuration
│   │   └── styles/            ← Global CSS files
│   └── package.json
│
├── microservices/             ← Spring Boot backend
│   ├── eureka-server/         ← Service discovery (port 8761)
│   ├── api-gateway/           ← API Gateway (port 8080)
│   ├── auth-service/          ← Authentication (port 8081)
│   ├── admin-catalogue-service/ ← Medicines & Batches (port 8082)
│   ├── cart-orders-service/   ← Cart, Orders, Addresses (port 8083)
│   ├── analytics-service/     ← Dashboard & Reports (port 8085)
│   ├── payment-service/       ← Payments (port 8086)
│   ├── common/                ← Shared DTOs used by all services
│   └── pom.xml               ← Parent Maven POM
│
├── Project Document/          ← This documentation folder
└── SECURITY_README.md         ← Security architecture overview
```

---

## 🔗 How Services Talk to Each Other

### Frontend → Backend
All frontend API calls go through the **API Gateway** on port 8080. The frontend NEVER talks directly to individual microservices.

```javascript
// Frontend Axios client (client.js)
const client = axios.create({
  baseURL: "http://localhost:8080",  // Always gateway
});
```

### Backend → Backend (Inter-Service Communication)
Microservices talk to each other using **OpenFeign** clients. They find each other through **Eureka** service discovery.

```
Cart-Orders Service → needs medicine info → MedicineClient (Feign) → Admin-Catalogue Service
Cart-Orders Service → needs user info → AuthClient (Feign) → Auth Service
Payment Service → needs to update order → CartOrdersClient (Feign) → Cart-Orders Service
```

### JWT Token Flow
```
1. User logs in → Auth Service creates JWT with {userId, email, scope: "ROLE_USER"}
2. Frontend saves JWT in localStorage
3. Every API call → Axios interceptor adds "Authorization: Bearer <token>" header
4. Request hits API Gateway → JwtAuthenticationFilter:
   - Parses JWT
   - Extracts userId, email, role
   - Adds X-User-Id, X-User-Email, X-User-Role headers
   - Forwards to downstream service
5. Downstream service reads X-User-Id header to know which user made the request
```

---

## 📚 Individual Documentation Files

| File | What You'll Learn |
|---|---|
| [01_PROJECT_SETUP.md](./01_PROJECT_SETUP.md) | How to install and run the entire project |
| [02_AUTHENTICATION.md](./02_AUTHENTICATION.md) | Login, Register, JWT tokens, OTP, Forgot Password |
| [03_CATALOG_MEDICINES.md](./03_CATALOG_MEDICINES.md) | Medicine listing, search, categories, stock status |
| [04_CART.md](./04_CART.md) | Cart operations: add, update, remove, clear |
| [05_ORDERS.md](./05_ORDERS.md) | Order placement, FIFO stock allocation, order history |
| [06_PAYMENT.md](./06_PAYMENT.md) | Payment processing: Card, UPI, Net Banking |
| [07_ADDRESS_DELIVERY.md](./07_ADDRESS_DELIVERY.md) | Address CRUD operations |
| [08_ADMIN_PANEL.md](./08_ADMIN_PANEL.md) | Admin features: products, batches, orders, users |
| [09_ANALYTICS.md](./09_ANALYTICS.md) | Dashboard charts, reports generation |
| [10_API_GATEWAY_EUREKA.md](./10_API_GATEWAY_EUREKA.md) | API Gateway routing, Eureka service discovery |
| [11_DATABASE_SCHEMA.md](./11_DATABASE_SCHEMA.md) | All database tables and relationships |

---

## 🎯 Key Concepts for Beginners

### What is a Microservice?
Instead of one big application (monolith), we split it into small services. Each service:
- Has its own code
- Has its own database
- Runs on its own port
- Can be updated independently

### What is an API Gateway?
A single door to all your services. Instead of the frontend knowing about 6 different ports, it only knows port 8080 (the gateway). The gateway routes requests to the right service.

### What is Eureka?
A "phone book" for services. When a service starts, it registers with Eureka saying "I'm Auth Service and I'm at port 8081." When the gateway needs to talk to Auth Service, it asks Eureka: "Where is auth-service?" and gets the address back.

### What is JWT?
JSON Web Token — a secure way to prove "I am logged in." After login, the server gives you a token (long encoded string). You send this token with every request, and the server can verify your identity without checking the database each time.

### What is Redux?
A centralized state management library. Instead of passing data between components through props, Redux stores data in a central "store" that any component can access.

### What is Feign Client?
A way for one Spring Boot service to call another. You write a Java interface, annotate it, and Spring creates the HTTP client for you automatically.

---

*Read the individual docs for deep dives into each feature! Start with [01_PROJECT_SETUP.md](./01_PROJECT_SETUP.md) to get the project running.*
