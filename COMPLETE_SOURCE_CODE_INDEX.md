# MediCart Complete Source Code Index

**Document Generated**: January 31, 2026  
**Total Files Documented**: 150+  
**Main Documentation**: See `COMPLETE_SOURCE_CODE_SUMMARY.md`

---

## Quick Navigation Index

### Frontend Files (React/Vite)

**Entry Point**
- [frontend/src/main.jsx](frontend/src/main.jsx) - React DOM render with Redux & React Query setup

**Main App & Routing**
- [frontend/src/App.jsx](frontend/src/App.jsx) - Route definitions for all pages
- [frontend/src/App.css](frontend/src/App.css) - App layout styles

**Styles & Design System**
- [frontend/src/index.css](frontend/src/index.css) - Global styles and CSS imports
- [frontend/src/styles/vars.css](frontend/src/styles/vars.css) - CSS variables and design tokens
- [frontend/src/styles/main.css](frontend/src/styles/main.css) - Base element styles
- [frontend/src/styles/global.css](frontend/src/styles/global.css) - Custom scrollbar styling

**Redux Store**
- [frontend/src/store/store.js](frontend/src/store/store.js) - Redux store configuration

**API Services & Clients**
- [frontend/src/api/client.js](frontend/src/api/client.js) - Axios HTTP client with JWT interceptor
- [frontend/src/api/authService.js](frontend/src/api/authService.js) - Authentication API methods
- [frontend/src/api/catalogService.js](frontend/src/api/catalogService.js) - Medicines & batches API
- [frontend/src/api/orderService.js](frontend/src/api/orderService.js) - Orders, cart, addresses API
- [frontend/src/api/paymentService.js](frontend/src/api/paymentService.js) - Payment processing API
- [frontend/src/api/analyticsService.js](frontend/src/api/analyticsService.js) - Analytics & reports API

### Catalog & Homepage

- [frontend/src/features/catalog/Homepage.jsx](frontend/src/features/catalog/Homepage.jsx) - Main medicine listing page
- [frontend/src/features/catalog/ProductCard.jsx](frontend/src/features/catalog/productCard.jsx) - Individual medicine card component
- [frontend/src/features/catalog/productSlice.jsx](frontend/src/features/catalog/productSlice.jsx) - Redux state for products
- [frontend/src/features/catalog/catalogApi.js](frontend/src/features/catalog/catalogApi.js) - Catalog API integration
- [frontend/src/features/catalog/MedicineIcons.js](frontend/src/features/catalog/MedicineIcons.js) - Category icon mappings
- [frontend/src/features/catalog/normalizeMedicineName.jsx](frontend/src/features/catalog/normalizeMedicineName.jsx) - Name normalization utility
- [frontend/src/features/catalog/home.css](frontend/src/features/catalog/home.css) - Homepage styles
- [frontend/src/features/catalog/product-card.css](frontend/src/features/catalog/product-card.css) - Card component styles

### Authentication

**Protected Routes**
- [frontend/src/features/auth/ProtectedRoute.jsx](frontend/src/features/auth/ProtectedRoute.jsx) - Route guard for authenticated users

**Auth Pages**
- [frontend/src/features/auth/pages/Login.jsx](frontend/src/features/auth/pages/Login.jsx) - User login page
- [frontend/src/features/auth/pages/Register.jsx](frontend/src/features/auth/pages/Register.jsx) - User registration page
- [frontend/src/features/auth/pages/ForgotPassword.jsx](frontend/src/features/auth/pages/ForgotPassword.jsx) - Forgot password form
- [frontend/src/features/auth/pages/Changepassword.jsx](frontend/src/features/auth/pages/Changepassword.jsx) - Change password form
- [frontend/src/features/auth/components/Auth.jsx](frontend/src/features/auth/components/Auth.jsx) - Reusable auth form component
- [frontend/src/features/auth/components/OtpPage.jsx](frontend/src/features/auth/components/OtpPage.jsx) - OTP verification page

**Auth Layouts**
- [frontend/src/features/auth/layout/General.jsx](frontend/src/features/auth/layout/General.jsx) - Auth page wrapper with navbar
- [frontend/src/features/auth/layout/ClientDashboard.jsx](frontend/src/features/auth/layout/ClientDashboard.jsx) - User dashboard layout

**Client Pages**
- [frontend/src/features/auth/pages/Accounts.jsx](frontend/src/features/auth/pages/Accounts.jsx) - User profile management
- [frontend/src/features/auth/pages/Prescription.jsx](frontend/src/features/auth/pages/Prescription.jsx) - Prescription upload & history

### Delivery & Addresses

- [frontend/src/features/delivery/AddressPage.jsx](frontend/src/features/delivery/AddressPage.jsx) - Address management page
- [frontend/src/features/delivery/AddressForm.jsx](frontend/src/features/delivery/AddressForm.jsx) - Add/edit address form
- [frontend/src/features/delivery/AddressList.jsx](frontend/src/features/delivery/AddressList.jsx) - Display saved addresses

### Shopping Cart

- [frontend/src/components/cart/CartPage.jsx](frontend/src/components/cart/CartPage.jsx) - Shopping cart view
- [frontend/src/components/cart/cartSlice.js](frontend/src/components/cart/cartSlice.js) - Redux store for cart
- [frontend/src/components/cart/cartSummary.jsx](frontend/src/components/cart/cartSummary.jsx) - Cart summary component
- [frontend/src/components/cart/cartSummary.css](frontend/src/components/cart/cartSummary.css) - Cart styles

### Orders

- [frontend/src/features/order/MyOrdersPage.jsx](frontend/src/features/order/MyOrdersPage.jsx) - User's order history
- [frontend/src/features/order/OrderDetailsPage.jsx](frontend/src/features/order/OrderDetailsPage.jsx) - Order detail view

### Payment & Checkout

- [frontend/src/features/payment/MediCartModule4.jsx](frontend/src/features/payment/MediCartModule4.jsx) - Payment module wrapper
- [frontend/src/features/payment/CheckoutPage.jsx](frontend/src/features/payment/CheckoutPage.jsx) - Checkout & order confirmation
- [frontend/src/features/payment/PaymentsPage.jsx](frontend/src/features/payment/PaymentsPage.jsx) - Payment history
- [frontend/src/features/payment/InvoicePage.jsx](frontend/src/features/payment/InvoicePage.jsx) - Invoice display
- [frontend/src/features/payment/PaymentSelect.jsx](frontend/src/features/payment/PaymentSelect.jsx) - Payment method selection
- [frontend/src/features/payment/CardPayment.jsx](frontend/src/features/payment/CardPayment.jsx) - Credit/debit card form
- [frontend/src/features/payment/DebitCard.jsx](frontend/src/features/payment/DebitCard.jsx) - Debit card payment
- [frontend/src/features/payment/Theme.css](frontend/src/features/payment/Theme.css) - Payment module styles
- [frontend/src/features/payment/PaymentsPage.css](frontend/src/features/payment/PaymentsPage.css) - Payment page styles
- [frontend/src/features/payment/CheckoutPage.css](frontend/src/features/payment/CheckoutPage.css) - Checkout styles
- [frontend/src/features/payment/InvoicePage.css](frontend/src/features/payment/InvoicePage.css) - Invoice styles

### Admin Panel

**Admin Authentication & Layout**
- [frontend/src/features/admin/AdminLoginPage.jsx](frontend/src/features/admin/AdminLoginPage.jsx) - Admin login form
- [frontend/src/features/admin/AdminLayout.jsx](frontend/src/features/admin/AdminLayout.jsx) - Admin dashboard layout
- [frontend/src/features/admin/adminAuth.js](frontend/src/features/admin/adminAuth.js) - Admin auth helper functions

**Admin Pages**
- [frontend/src/features/admin/AdminProductsPage.jsx](frontend/src/features/admin/AdminProductsPage.jsx) - Medicine management
- [frontend/src/features/admin/AdminBatchPage.jsx](frontend/src/features/admin/AdminBatchPage.jsx) - Batch & inventory management
- [frontend/src/features/admin/AdminOrdersPage.jsx](frontend/src/features/admin/AdminOrdersPage.jsx) - View all orders
- [frontend/src/features/admin/AdminUsersPage.jsx](frontend/src/features/admin/AdminUsersPage.jsx) - User management

**Admin Components & Tables**
- [frontend/src/features/admin/ProductsTable.jsx](frontend/src/features/admin/ProductsTable.jsx) - Medicines data table
- [frontend/src/features/admin/ProductEditorModal.jsx](frontend/src/features/admin/ProductEditorModal.jsx) - Add/edit medicine modal
- [frontend/src/features/admin/BatchTable.jsx](frontend/src/features/admin/BatchTable.jsx) - Batches data table
- [frontend/src/features/admin/BatchEditorModal.jsx](frontend/src/features/admin/BatchEditorModal.jsx) - Add/edit batch modal
- [frontend/src/features/admin/OrdersTable.jsx](frontend/src/features/admin/OrdersTable.jsx) - Orders data table
- [frontend/src/features/admin/OrderStatusModal.jsx](frontend/src/features/admin/OrderStatusModal.jsx) - Update order status modal
- [frontend/src/features/admin/UsersTable.jsx](frontend/src/features/admin/UsersTable.jsx) - Users data table

**Admin Analytics**
- [frontend/src/features/admin/analyticsSecction/Dashboard.jsx](frontend/src/features/admin/analyticsSecction/Dashboard.jsx) - Analytics dashboard
- [frontend/src/features/admin/analyticsSecction/Reports.jsx](frontend/src/features/admin/analyticsSecction/Reports.jsx) - Reports page
- [frontend/src/features/admin/analyticsSecction/StatCard.jsx](frontend/src/features/admin/analyticsSecction/StatCard.jsx) - Statistics card component

**Admin API & Styles**
- [frontend/src/features/admin/adminApi.js](frontend/src/features/admin/adminApi.js) - Admin API integration
- [frontend/src/features/admin/batchApi.js](frontend/src/features/admin/batchApi.js) - Batch API integration
- [frontend/src/features/admin/admin.css](frontend/src/features/admin/admin.css) - Admin panel styles
- [frontend/src/features/admin/AdminLogin.css](frontend/src/features/admin/AdminLogin.css) - Login form styles
- [frontend/src/features/admin/batch.css](frontend/src/features/admin/batch.css) - Batch page styles
- [frontend/src/features/admin/ProductsTable.css](frontend/src/features/admin/ProductsTable.css) - Table styles

### Shared Components

**Navigation**
- [frontend/src/components/navbar/Navbar.jsx](frontend/src/components/navbar/Navbar.jsx) - Main navbar component
- [frontend/src/components/navbar/navbar.css](frontend/src/components/navbar/navbar.css)
- [frontend/src/components/navbar-1/Navbar.jsx](frontend/src/components/navbar-1/Navbar.jsx) - Alternative navbar
- [frontend/src/components/navbar-1/navbar.css](frontend/src/components/navbar-1/navbar.css)

**Layout**
- [frontend/src/components/layout/Header.jsx](frontend/src/components/layout/Header.jsx) - Header component
- [frontend/src/components/layout/Footer.jsx](frontend/src/components/layout/Footer.jsx) - Footer component
- [frontend/src/components/layout/AdminSidebar.jsx](frontend/src/components/layout/AdminSidebar.jsx) - Admin sidebar

**Modals & UI**
- [frontend/src/components/modal/MedicineModal.jsx](frontend/src/components/modal/MedicineModal.jsx) - Medicine details popup
- [frontend/src/components/modal/medicineModal.css](frontend/src/components/modal/medicineModal.css)
- [frontend/src/components/ui/Loader.jsx](frontend/src/components/ui/Loader.jsx) - Loading spinner

---

## Java Microservices Files

### Common Module

**DTOs (Data Transfer Objects)**
- `microservices/common/src/main/java/com/medicart/common/dto/LoginRequest.java`
- `microservices/common/src/main/java/com/medicart/common/dto/LoginResponse.java`
- `microservices/common/src/main/java/com/medicart/common/dto/RegisterRequest.java`
- `microservices/common/src/main/java/com/medicart/common/dto/UserDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/MedicineDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/BatchDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/CartItemDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/OrderDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/OrderItemDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/AddressDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/PaymentDTO.java`
- `microservices/common/src/main/java/com/medicart/common/dto/ReportDTO.java`

### Eureka Server (Port 8761)

- `microservices/eureka-server/src/main/java/com/medicart/eureka/EurekaServerApplication.java`

### API Gateway (Port 8080)

- `microservices/api-gateway/src/main/java/com/medicart/gateway/ApiGatewayApplication.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/GatewayConfig.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/SecurityConfig.java`
- `microservices/api-gateway/src/main/java/com/medicart/gateway/config/WebSecurityConfig.java`

### Auth Service (Port 8081)

**Main Class & Configuration**
- `microservices/auth-service/src/main/java/com/medicart/auth/AuthServiceApplication.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/SecurityConfig.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/WebSecurityConfig.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/JwtConfigProperties.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/config/DataInitializer.java`

**Controllers**
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/AuthController.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/UserController.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/controller/OtpController.java`

**Services**
- `microservices/auth-service/src/main/java/com/medicart/auth/service/AuthService.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/service/JwtService.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/service/OtpService.java`

**Entities**
- `microservices/auth-service/src/main/java/com/medicart/auth/entity/User.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/entity/Role.java`

**Repositories**
- `microservices/auth-service/src/main/java/com/medicart/auth/repository/UserRepository.java`
- `microservices/auth-service/src/main/java/com/medicart/auth/repository/RoleRepository.java`

### Admin Catalogue Service (Port 8082)

**Main Class & Configuration**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/AdminCatalogueServiceApplication.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/config/WebSecurityConfig.java`

**Controllers**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/MedicineController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/BatchController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/PrescriptionController.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/controller/SeedController.java`

**Services**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/service/MedicineService.java`

**Entities**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/entity/Medicine.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/entity/Batch.java`

**Repositories**
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/repository/MedicineRepository.java`
- `microservices/admin-catalogue-service/src/main/java/com/medicart/admin/repository/BatchRepository.java`

### Cart-Orders Service (Port 8083)

**Main Class & Configuration**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/CartOrdersServiceApplication.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/config/WebSecurityConfig.java`

**Controllers**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/CartController.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/OrderController.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/controller/AddressController.java`

**Services**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/CartService.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/OrderService.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/service/AddressService.java`

**Feign Clients**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/MedicineClient.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/client/AuthClient.java`

**Entities**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/CartItem.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/Order.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/OrderItem.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/entity/Address.java`

**Repositories**
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/CartItemRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/OrderRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/OrderItemRepository.java`
- `microservices/cart-orders-service/src/main/java/com/medicart/cartorders/repository/AddressRepository.java`

### Payment Service (Port 8086)

**Main Class & Configuration**
- `microservices/payment-service/src/main/java/com/medicart/payment/PaymentServiceApplication.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/config/WebSecurityConfig.java`

**Controllers**
- `microservices/payment-service/src/main/java/com/medicart/payment/controller/PaymentController.java`

**Services**
- `microservices/payment-service/src/main/java/com/medicart/payment/service/PaymentService.java`

**Feign Clients**
- `microservices/payment-service/src/main/java/com/medicart/payment/client/CartOrdersClient.java`

**Entities**
- `microservices/payment-service/src/main/java/com/medicart/payment/entity/Payment.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/entity/Transaction.java`

**Repositories**
- `microservices/payment-service/src/main/java/com/medicart/payment/repository/PaymentRepository.java`
- `microservices/payment-service/src/main/java/com/medicart/payment/repository/TransactionRepository.java`

### Analytics Service (Port 8085)

**Main Class & Configuration**
- `microservices/analytics-service/src/main/java/com/medicart/analytics/AnalyticsServiceApplication.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/config/WebSecurityConfig.java`

**Controllers**
- `microservices/analytics-service/src/main/java/com/medicart/analytics/controller/AnalyticsController.java`
- `microservices/analytics-service/src/main/java/com/medicart/analytics/controller/ReportController.java`

---

## Database & SQL Files

- [microservices/db-setup.sql](microservices/db-setup.sql) - Complete database schema for all 5 microservices
- [microservices/UPDATE_ADMIN_PASSWORD.sql](microservices/UPDATE_ADMIN_PASSWORD.sql) - Admin password update script
- [microservices/MIGRATION_FIX_ADDRESS_TABLE.sql](microservices/MIGRATION_FIX_ADDRESS_TABLE.sql) - Database migration for address table

---

## Billing Module

- [medicart-billing/src/App.jsx](medicart-billing/src/App.jsx)
- [medicart-billing/src/api/billingPaymentAPI.js](medicart-billing/src/api/billingPaymentAPI.js)
- [medicart-billing/src/pages/Billing.jsx](medicart-billing/src/pages/Billing.jsx)
- [medicart-billing/src/pages/BillingPage.jsx](medicart-billing/src/pages/BillingPage.jsx)
- [medicart-billing/src/pages/PaymentPage.jsx](medicart-billing/src/pages/PaymentPage.jsx)
- [medicart-billing/src/pages/CheckoutPage.jsx](medicart-billing/src/pages/CheckoutPage.jsx)
- [medicart-billing/src/pages/PaymentSelect.jsx](medicart-billing/src/pages/PaymentSelect.jsx)
- [medicart-billing/src/pages/CardPayment.jsx](medicart-billing/src/pages/CardPayment.jsx)
- [medicart-billing/src/pages/NetBanking.jsx](medicart-billing/src/pages/NetBanking.jsx)
- [medicart-billing/src/pages/DebitCard.jsx](medicart-billing/src/pages/DebitCard.jsx)
- [medicart-billing/src/pages/Success.jsx](medicart-billing/src/pages/Success.jsx)
- [medicart-billing/src/components/CartSummary.jsx](medicart-billing/src/components/CartSummary.jsx)
- [medicart-billing/src/components/PaymentOptions.jsx](medicart-billing/src/components/PaymentOptions.jsx)
- [medicart-billing/src/components/ProgressBar.jsx](medicart-billing/src/components/ProgressBar.jsx)
- [medicart-billing/src/data/mockInvoices.js](medicart-billing/src/data/mockInvoices.js)

---

## Documentation Files

**Root Level**
- [COMPLETE_SOURCE_CODE_SUMMARY.md](COMPLETE_SOURCE_CODE_SUMMARY.md) - **MAIN DOCUMENTATION** - Comprehensive system overview
- [COMPLETE_SOURCE_CODE_INDEX.md](COMPLETE_SOURCE_CODE_INDEX.md) - This file - Quick reference index

**Architecture & Setup**
- [microservices/MICROSERVICES_README.md](microservices/MICROSERVICES_README.md) - Microservices architecture guide
- [microservices/MICROSERVICES_COMPLETE_SETUP.md](microservices/MICROSERVICES_COMPLETE_SETUP.md) - Complete setup instructions
- [microservices/MICROSERVICES_AUDIT_REPORT.md](microservices/MICROSERVICES_AUDIT_REPORT.md) - Architecture audit findings
- [microservices/COMPLETION_STATUS.md](microservices/COMPLETION_STATUS.md) - Project completion status
- [microservices/FINAL_COMPLETION_SUMMARY.md](microservices/FINAL_COMPLETION_SUMMARY.md) - Final completion report
- [microservices/VERIFICATION_REPORT.md](microservices/VERIFICATION_REPORT.md) - System verification results

---

## File Organization

```
Total Files: 150+

Frontend:
- React Components: 50+
- CSS Files: 15+
- API Services: 5
- Configuration: 2

Microservices:
- Java Files: 50+
- Configuration: 20+
- Entity/DTO Classes: 30+
- Controller Classes: 15+
- Service Classes: 10+

Database:
- SQL Scripts: 3
- Database Schema: 5 databases

Documentation:
- Markdown Files: 15+
```

---

## How to Use This Index

1. **For Frontend Code**: Navigate to `frontend/src/`
2. **For Backend Code**: Navigate to `microservices/*/src/main/java/com/medicart/`
3. **For Database Schema**: See `microservices/db-setup.sql`
4. **For Setup Instructions**: See `microservices/MICROSERVICES_COMPLETE_SETUP.md`
5. **For Main Documentation**: See `COMPLETE_SOURCE_CODE_SUMMARY.md`

---

**Last Updated**: January 31, 2026  
**Status**: Complete Source Code Documentation  
**Version**: 1.0.0

