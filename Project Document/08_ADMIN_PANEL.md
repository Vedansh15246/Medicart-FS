# 08 — Admin Panel

## 📌 What This Feature Does

The Admin Panel is a **protected area** of the application where administrators can:
1. **Manage Medicines** — Add, edit, delete medicines from the catalog
2. **Manage Batches** — Add stock batches with expiry dates and quantities
3. **View & Update Orders** — See all user orders and change their status
4. **Manage Users** — View registered users and delete accounts
5. **View Dashboard** — See analytics charts and statistics
6. **Generate Reports** — Create sales/inventory/compliance reports

Only users with `ROLE_ADMIN` can access the admin panel. Regular users (`ROLE_USER`) are redirected to the login page.

---

## 🏗️ Architecture Overview

```
Admin logs in at /admin/login
        │
        ▼
┌─────────────────────┐
│  AdminLoginPage.jsx │  → Calls /auth/login → Checks role = ROLE_ADMIN
│  Stores token in    │     Stores in localStorage
│  localStorage       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  AdminLayout.jsx    │  ← Auth guard: checks isAdminAuthenticated()
│  ┌─────────────────┐│     If not admin → redirect to /admin/login
│  │ Navbar          ││
│  │ Products|Batches││  ← Navigation links
│  │ Dashboard|Orders││
│  │ Users|Reports   ││
│  └─────────────────┘│
│  ┌─────────────────┐│
│  │ <Outlet />      ││  ← Renders child page based on URL
│  └─────────────────┘│
└─────────────────────┘
```

---

## 📂 File Map

### Frontend (Admin Feature)

| File | Purpose |
|------|---------|
| `features/admin/AdminLoginPage.jsx` | Admin login form |
| `features/admin/AdminLogin.css` | Login page styles |
| `features/admin/adminAuth.js` | Auth helper functions (check/logout) |
| `features/admin/AdminLayout.jsx` | Layout with navbar + auth guard |
| `features/admin/admin.css` | Shared admin styles |
| `features/admin/adminApi.js` | Admin API wrappers for medicines |
| `features/admin/AdminProductsPage.jsx` | Medicines CRUD page |
| `features/admin/ProductsTable.jsx` | Medicines table component |
| `features/admin/ProductEditorModal.jsx` | Add/Edit medicine modal |
| `features/admin/AdminBatchPage.jsx` | Batches management page |
| `features/admin/batchApi.js` | Batch API wrappers |
| `features/admin/BatchTable.jsx` | Batches table component |
| `features/admin/BatchEditorModal.jsx` | Add/Edit batch modal |
| `features/admin/AdminOrdersPage.jsx` | All orders management |
| `features/admin/OrdersTable.jsx` | Orders table component |
| `features/admin/OrderStatusModal.jsx` | Update order status modal |
| `features/admin/AdminUsersPage.jsx` | User directory page |
| `features/admin/UsersTable.jsx` | Users table component |
| `features/admin/batch.css` | Batch page styles |

### Backend (Multiple Services)

The admin panel doesn't have its own backend — it calls the same APIs that the customer app uses, but with admin-level permissions:

| Backend Service | Admin Uses It For |
|----------------|-------------------|
| Auth Service (8081) | Login, get all users, delete users |
| Admin-Catalogue (8082) | CRUD medicines, CRUD batches |
| Cart-Orders (8083) | Get all orders, update order status |
| Analytics (8085) | Dashboard data, reports |

---

## 🔑 Admin Authentication

### How Admin Login Works

```
1. Admin enters email + password at /admin/login
      │
2. Frontend calls POST /auth/login (same endpoint as regular users!)
      │  Response: { token, roles: ["ROLE_ADMIN"], userId }
      ▼
3. Frontend checks: Does roles include "ROLE_ADMIN"?
      │  If NO → Show error "Admin access required"
      │  If YES → Continue ▼
      ▼
4. Save to localStorage:
      │  accessToken = "eyJhbGci..."
      │  userRole = "ROLE_ADMIN"
      │  userId = "1"
      ▼
5. Navigate to /admin/dashboard
```

### AdminLoginPage.jsx — Key Code

```javascript
const handleLogin = async (e) => {
    e.preventDefault();

    const response = await client.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
    });

    const { token, roles, userId } = response.data;

    // Normalize roles to array (backend might send string or array)
    const roleList = Array.isArray(roles) ? roles : [roles];

    // THE KEY CHECK: Only allow ROLE_ADMIN
    if (!roleList.includes("ROLE_ADMIN")) {
        throw new Error("Admin access required");
    }

    // Clear any old data
    localStorage.clear();

    // Store credentials
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userRole", "ROLE_ADMIN");
    localStorage.setItem("userId", String(userId));

    navigate("/admin/dashboard", { replace: true });
};
```

### adminAuth.js — Auth Helper Functions

```javascript
// Check if current user is an authenticated admin
export const isAdminAuthenticated = () => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    
    // Both must exist AND role must be ROLE_ADMIN
    return token !== null && role === "ROLE_ADMIN";
};

// Clear admin session
export const logoutAdmin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminEmail");
};
```

**Important:** This is **client-side only** auth checking. The real security is in the API Gateway — it checks the JWT token and role for every request. The `isAdminAuthenticated()` function just controls what the UI shows.

---

## 🎨 AdminLayout — The Shell

**File:** `AdminLayout.jsx`

This is the **parent component** for all admin pages. It provides:
1. **Auth guard** — Redirects non-admins to login
2. **Navigation bar** — Links to all admin pages
3. **`<Outlet />`** — Where child pages render

### Auth Guard Pattern

```jsx
export default function AdminLayout() {
    const authenticated = isAdminAuthenticated();

    if (!authenticated) {
        // React Router's <Navigate> component for programmatic redirect
        return <Navigate to="/admin/login" replace />;
        // 'replace' means: replace current history entry (no back button)
    }

    return (
        <div className="admin-layout-wrapper">
            <header className="admin-navbar">...</header>
            <main className="admin-content">
                <Outlet />  {/* Child page renders here */}
            </main>
        </div>
    );
}
```

### Navigation with NavLink

```jsx
<NavLink to="/admin/products" className={({isActive}) => isActive ? "active" : ""}>
    Products
</NavLink>
```

`NavLink` is like `Link` but knows if it matches the current URL. When the URL is `/admin/products`, `isActive` is `true` and the link gets the `"active"` CSS class (usually highlighted).

### Routing Structure (from App.jsx)

```jsx
<Route path="/admin" element={<AdminLayout />}>
    <Route path="products" element={<AdminProductsPage />} />
    <Route path="batches" element={<AdminBatchPage />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="reports" element={<Reports />} />
    <Route path="orders" element={<AdminOrdersPage />} />
    <Route path="users" element={<AdminUsersPage />} />
</Route>
<Route path="/admin/login" element={<AdminLoginPage />} />
```

`AdminLayout` wraps all child routes. When you visit `/admin/products`:
- `AdminLayout` renders (navbar + auth check)
- `<Outlet />` renders `AdminProductsPage`

---

## 📦 Admin Products Page

**File:** `AdminProductsPage.jsx`

### TanStack Query (React Query)

```javascript
import { useQuery } from "@tanstack/react-query";

const {
    data: rawData,     // The fetched data
    isLoading,         // true while fetching
    refetch            // Function to manually re-fetch
} = useQuery({
    queryKey: ["admin-medicines"],      // Cache key (unique identifier)
    queryFn: fetchAdminMedicines       // Function that fetches data
});
```

**What is TanStack Query?**
- It's a library for fetching, caching, and updating data in React
- `queryKey` identifies the data — if two components use the same key, they share the cache
- `refetch()` forces a fresh fetch (used after create/edit/delete)
- `isLoading` is `true` during the first fetch

### Data Extraction

```javascript
// Backend might return a plain array OR a Spring Page object
// Spring Page: { content: [...], totalPages: 5, totalElements: 42 }
// Plain array: [...]
const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);
```

### Search/Filter

```javascript
const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
);
```

This is **client-side filtering** — all medicines are loaded, then filtered in the browser by name or SKU.

### Delete with Confirmation

```javascript
const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
        await deleteMedicine(product.id);  // DELETE /medicines/{id}
        refetch();  // Refresh the list
    }
};
```

### Admin API Wrapper

```javascript
// features/admin/adminApi.js
import catalogService from "../../api/catalogService";

export const fetchAdminMedicines = async () => {
    const res = await catalogService.getMedicines();   // GET /medicines
    return res;
};

export const createMedicine = async (data) => {
    const res = await catalogService.createMedicine(data);  // POST /medicines
    return res;
};

export const updateMedicine = async ({ id, data }) => {
    const res = await catalogService.updateMedicine(id, data);  // PUT /medicines/{id}
    return res;
};

export const deleteMedicine = async (id) => {
    await catalogService.deleteMedicine(id);  // DELETE /medicines/{id}
};
```

These wrappers call `catalogService` (which calls the Admin-Catalogue Service on port 8082 via API Gateway).

---

## 📦 Admin Batch Page

**File:** `AdminBatchPage.jsx`

Batches represent **physical stock** of medicines with expiry dates and quantities.

### Dual Query Pattern

```javascript
// Fetch both batches and medicines
const { data: batches = [], refetch } = useQuery({
    queryKey: ["batches"],
    queryFn: fetchBatches,
});

const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: fetchMedicines,
});
```

Medicines are fetched too because each batch belongs to a medicine — the table needs medicine names.

### Delete with Error Handling

```javascript
const handleDeleteBatch = async (id) => {
    try {
        await deleteBatch(id);
        refetch();
    } catch (error) {
        setAlertModal({
            open: true,
            title: "Error",
            message: "Failed to delete batch",
            type: "error"
        });
    }
};
```

### AlertModal

A reusable modal component for showing success/error/info messages:

```jsx
<AlertModal
    isOpen={alertModal.open}
    onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
    title={alertModal.title}
    message={alertModal.message}
    type={alertModal.type}  // "error", "success", "info"
/>
```

---

## 📦 Admin Orders Page

**File:** `AdminOrdersPage.jsx`

### Fetching ALL Orders

```javascript
const fetchOrders = async () => {
    // getAllOrders() calls GET /api/orders?admin=true
    // This returns orders from ALL users (not just the logged-in user)
    const res = await orderService.getAllOrders();
    setOrders(res);
};
```

The `admin=true` query parameter tells the backend: "Return all orders, not just mine."

### Order Status Modal

Admins can update order status (e.g., PENDING → CONFIRMED → SHIPPED → DELIVERED):

```jsx
const handleEdit = (order) => {
    setSelectedOrder(order);   // Store which order to edit
    setIsModalOpen(true);      // Show the modal
};

{isModalOpen && (
    <OrderStatusModal
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchOrders}  // Refresh list after status change
    />
)}
```

---

## 📦 Admin Users Page

**File:** `AdminUsersPage.jsx`

### Fetching Users

```javascript
const fetchUsers = () => {
    authService.getAllUsers()
        .then(res => setUsers(Array.isArray(res) ? res : res.data || []))
        .catch(err => console.error("Could not load users", err))
        .finally(() => setLoading(false));
};
```

This calls `GET /auth/users` on the Auth Service to get all registered users.

### Delete User

```javascript
const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        try {
            await authService.deleteUser(userId);
            // Optimistic update: remove from UI immediately
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setAlertModal({
                open: true,
                title: "Delete Failed",
                message: "Failed to delete user: " + (err.response?.data || err.message),
                type: "error"
            });
        }
    }
};
```

**"Optimistic update"** — Instead of fetching the entire user list again, we just remove the deleted user from the local state. This makes the UI feel faster.

---

## 🔒 Backend Security for Admin Routes

### API Gateway — Admin Route Protection

The API Gateway's `JwtAuthenticationFilter` checks if certain routes require admin access:

```java
// In JwtAuthenticationFilter.java (API Gateway)
private boolean isAdminOnly(ServerHttpRequest request) {
    String path = request.getURI().getPath();
    String method = request.getMethod().name();

    // POST/PUT/DELETE on /medicines require ROLE_ADMIN
    if (path.startsWith("/medicines") &&
        (method.equals("POST") || method.equals("PUT") || method.equals("DELETE"))) {
        return true;
    }
    return false;
}
```

If a route is admin-only, the gateway checks the JWT's `scope` claim:
```java
if (isAdminOnly(request)) {
    String role = claims.get("scope", String.class);
    if (!"ROLE_ADMIN".equals(role)) {
        // Return 403 Forbidden
        return onError(exchange, "Admin access required", HttpStatus.FORBIDDEN);
    }
}
```

### What Happens When a Regular User Tries Admin Actions

```
Regular user (ROLE_USER) sends: POST /medicines (try to add medicine)
        │
        ▼
API Gateway: isAdminOnly() returns true
        │
        ▼
API Gateway: Checks JWT scope → "ROLE_USER"
        │
        ▼
Returns 403 Forbidden: "Admin access required"
        │
        ▼
Request NEVER reaches the backend service
```

---

## 🔄 Admin CRUD Flow (Example: Adding a Medicine)

```
1. Admin clicks "+ Add Medicine" on AdminProductsPage
      │  setEditingProduct({})  ← empty object means "new"
      ▼
2. ProductEditorModal opens with empty form
      │  Admin fills: name, category, price, SKU, description
      ▼
3. Admin clicks "Save"
      │  createMedicine(data)
      │  POST /medicines → API Gateway
      ▼
4. API Gateway validates JWT token
      │  Checks: Is this POST /medicines? → Yes → isAdminOnly
      │  Checks: JWT scope = "ROLE_ADMIN"? → Yes → Forward request
      ▼
5. Admin-Catalogue Service receives request
      │  MedicineController.createMedicine(dto)
      │  MedicineService saves to database
      ▼
6. Response sent back through Gateway to Frontend
      │  ProductEditorModal calls onSaved()
      │  onSaved = refetch() → TanStack Query re-fetches medicine list
      ▼
7. AdminProductsPage re-renders with the new medicine in the table
```

---

## 📊 Admin Routes Summary

| Page | URL | What It Shows |
|------|-----|---------------|
| Login | `/admin/login` | Email + Password form |
| Dashboard | `/admin/dashboard` | Charts, statistics, analytics |
| Products | `/admin/products` | Medicine CRUD table |
| Batches | `/admin/batches` | Batch inventory table |
| Orders | `/admin/orders` | All user orders + status management |
| Users | `/admin/users` | User directory + delete |
| Reports | `/admin/reports` | Generate/view reports |

---

## 🧠 Key Concepts for Beginners

### 1. What is `<Outlet />`?
A React Router component that renders the "child route" inside a parent layout. Think of it as a placeholder:

```
AdminLayout (always rendered for /admin/*)
├── Navbar
└── <Outlet />  ← This changes based on URL:
    ├── /admin/products → AdminProductsPage
    ├── /admin/orders → AdminOrdersPage
    └── /admin/users → AdminUsersPage
```

### 2. What is `<Navigate />`?
A React Router component that immediately redirects:
```jsx
if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
}
```
This is the **declarative** way to redirect (vs `navigate()` which is **imperative**).

### 3. What is `replace` in navigation?
```jsx
navigate("/admin/login", { replace: true });
```
Without `replace`: User can click browser's Back button to go back.  
With `replace`: The current page is **replaced** in history — Back button goes to the page before.

This prevents: Admin logs out → clicks Back → sees admin page again (which would show an empty/broken page).

### 4. What is localStorage?
A browser API for storing key-value pairs that persist even after closing the browser:
```javascript
localStorage.setItem("accessToken", "eyJhbGci...");   // Save
localStorage.getItem("accessToken");                     // Read → "eyJhbGci..."
localStorage.removeItem("accessToken");                  // Delete
localStorage.clear();                                    // Delete everything
```

**Security note:** Storing JWT tokens in localStorage is common for learning projects but has XSS risks. Production apps often use httpOnly cookies instead.

### 5. What is TanStack Query (React Query)?
A data-fetching library that handles:
- **Caching** — Doesn't re-fetch if data was recently loaded
- **Loading states** — `isLoading` is automatically managed
- **Refetching** — `refetch()` to get fresh data
- **Stale data** — Shows cached data while fetching fresh data in background

Without it, you'd need:
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    setLoading(true);
    fetch('/api/medicines')
        .then(res => res.json())
        .then(data => setData(data))
        .catch(err => setError(err))
        .finally(() => setLoading(false));
}, []);
```

With TanStack Query:
```javascript
const { data, isLoading, error } = useQuery({
    queryKey: ["medicines"],
    queryFn: fetchMedicines
});
```

Much cleaner!

---

## ⚡ Quick Reference

| Concept | Value |
|---------|-------|
| Admin Login URL | `/admin/login` |
| Admin Dashboard URL | `/admin/dashboard` |
| Auth Check Function | `isAdminAuthenticated()` |
| Required Role | `ROLE_ADMIN` |
| Token Storage | `localStorage.accessToken` |
| Role Storage | `localStorage.userRole` |
| Data Fetching Library | TanStack Query (`@tanstack/react-query`) |
| Gateway Admin Check | `isAdminOnly()` in `JwtAuthenticationFilter.java` |
| Admin-Only Routes | POST/PUT/DELETE on `/medicines` |
