import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import HomePage from "./features/catalog/Homepage";
import AdminLayout from "./features/admin/AdminLayout";
import AdminProductsPage from "./features/admin/AdminProductsPage";
import AdminBatchPage from "./features/admin/AdminBatchPage";
import AdminLoginPage from "./features/admin/AdminLoginPage";
import AddressPage from "./features/delivery/AddressPage";
import CheckoutPage from "./features/payment/CheckoutPage";
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
import Dashboard from "./features/admin/analyticsSection/pages/Dashboard.jsx";
import Reports from "./features/admin/analyticsSection/pages/Reports.jsx";
import CartPage from "./components/cart/CartPage.jsx";
import ProtectedRoute from "./features/auth/ProtectedRoute"; // The Gatekeeper
import AdminOrdersPage from "./features/admin/AdminOrdersPage.jsx";
import AdminUsersPage from "./features/admin/AdminUsersPage.jsx";
import OtpPage from "./features/auth/components/OtpPage.jsx";
import PaymentSelect from "./features/payment/PaymentSelect.jsx";
import CardPayment from "./features/payment/CardPaymentNew.jsx";
import UPIPayment from "./features/payment/UPIPayment.jsx";
import NetBankingPayment from "./features/payment/NetBankingPayment.jsx";
import Success from "./features/payment/Success.jsx";
import { initializeAuth, logout } from "./features/auth/authSlice.js";
import { isTokenExpired } from "./utils/jwtUtils.js";
import logger from "./utils/logger.js";

export default function App() {
  const dispatch = useDispatch();

  // Initialize auth from localStorage on app start and check token expiration
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (token && token !== "null" && token !== "undefined") {
      // Check if token is expired
      if (isTokenExpired(token)) {
        logger.warn("⏰ Token expired on app load - logging out user");
        
        // Clear all auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        
        // Dispatch logout action
        dispatch(logout());
        
        // Optional: Show a message to user
        console.log("Your session has expired. Please login again.");
      } else {
        // Token is valid, initialize auth state
        dispatch(initializeAuth());
        logger.info("✅ Valid token found - user authenticated");
      }
    } else {
      logger.info("ℹ️ No token found - user not authenticated");
    }

    // Set up periodic token validation (check every 60 seconds)
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem("accessToken");
      
      if (currentToken && currentToken !== "null" && currentToken !== "undefined") {
        if (isTokenExpired(currentToken)) {
          logger.warn("⏰ Token expired during session - auto-logout");
          
          // Clear all auth data
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          
          // Dispatch logout action
          dispatch(logout());
          
          // Reload to redirect to login
          window.location.href = "/auth/login";
        }
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(tokenCheckInterval);
  }, [dispatch]);

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
        <Route path="/payment" element={<CheckoutPage />} />
        <Route path="/payment/select" element={<PaymentSelect />} />
        <Route path="/payment/card" element={<CardPayment />} />
        <Route path="/payment/debit" element={<CardPayment />} />
        <Route path="/payment/upi" element={<UPIPayment />} />
        <Route path="/payment/netbanking" element={<NetBankingPayment />} />
        <Route path="/payment/success" element={<Success />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        
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