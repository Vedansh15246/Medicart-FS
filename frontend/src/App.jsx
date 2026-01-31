import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./features/catalog/HomePage";
import AdminLayout from "./features/admin/AdminLayout";
import AdminProductsPage from "./features/admin/AdminProductsPage";
import AdminBatchPage from "./features/admin/AdminBatchPage";
import AdminLoginPage from "./features/admin/AdminLoginPage";
import MediCartModule4 from "./features/payment/MediCartModule4";
import AddressPage from "./features/delivery/AddressPage";
import MyOrdersPage from "./features/order/MyOrdersPage";
import OrderDetailsPage from "./features/order/OrderDetailsPage";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Changepassword from "./features/auth/pages/Changepassword";
import Prescription from "./features/auth/pages/Prescription";
import Accounts from "./features/auth/pages/Accounts";
import General from "./features/auth/layout/General";
import ClientDashboard from "./features/auth/layout/ClientDashboard";
import Dashboard from "./features/admin/analyticsSecction/Dashboard.jsx";
import Reports from "./features/admin/analyticsSecction/Reports.jsx";
import CartPage from "./components/cart/CartPage.jsx";
import ProtectedRoute from "./features/auth/ProtectedRoute"; // The Gatekeeper
import AdminOrdersPage from "./features/admin/AdminOrdersPage.jsx";
import AdminUsersPage from "./features/admin/AdminUsersPage.jsx";
import OtpPage from "./features/auth/components/OtpPage.jsx";
export default function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<General />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="change-password" element={<Changepassword />} />
        <Route path="otp" element={<OtpPage/>} />
      </Route>

      {/* 2. PROTECTED CUSTOMER ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/address" element={<AddressPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/payment" element={<MediCartModule4 />} />
        
        <Route path="dashboard_client" element={<ClientDashboard />}>
          <Route index element={<Navigate to="prescription" />} />
          <Route path="account" element={<Accounts />} />
          <Route path="prescription" element={<Prescription />} />
        </Route>
      </Route>

      {/* 3. ADMIN ROUTES */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="products" />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="batches" element={<AdminBatchPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* 4. FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}