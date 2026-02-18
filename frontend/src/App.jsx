import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeAuth, logout } from "./features/auth/authSlice.js";
import { isTokenExpired } from "./utils/jwtUtils.js";
import logger from "./utils/logger.js";

// Components that load instantly (layout shells, guards)
import ProtectedRoute from "./features/auth/ProtectedRoute";
import PageLoader from "./components/ui/PageLoader";
import NavigationProgress from "./components/ui/NavigationProgress";

// ── Lazy-loaded page components ──────────────────────────────
const HomePage          = lazy(() => import("./features/catalog/HomePage"));
const General           = lazy(() => import("./features/auth/layout/General"));
const Login             = lazy(() => import("./features/auth/pages/Login"));
const Register          = lazy(() => import("./features/auth/pages/Register"));
const ForgotPassword    = lazy(() => import("./features/auth/pages/ForgotPassword"));
const Changepassword    = lazy(() => import("./features/auth/pages/Changepassword"));
const OtpPage           = lazy(() => import("./features/auth/components/OtpPage"));
const ClientDashboard   = lazy(() => import("./features/auth/layout/ClientDashboard"));
const Accounts          = lazy(() => import("./features/auth/pages/Accounts"));
const Prescription      = lazy(() => import("./features/auth/pages/Prescription"));

const CartPage          = lazy(() => import("./components/cart/CartPage"));
const AddressPage       = lazy(() => import("./features/delivery/AddressPage"));
const CheckoutPage      = lazy(() => import("./features/payment/CheckoutPage"));
const PaymentSelect     = lazy(() => import("./features/payment/PaymentSelect"));
const CardPayment       = lazy(() => import("./features/payment/CardPaymentNew"));
const UPIPayment        = lazy(() => import("./features/payment/UPIPayment"));
const NetBankingPayment = lazy(() => import("./features/payment/NetBankingPayment"));
const Success           = lazy(() => import("./features/payment/Success"));
const MyOrdersPage      = lazy(() => import("./features/order/MyOrdersPage"));
const OrderDetailsPage  = lazy(() => import("./features/order/OrderDetailsPage"));

const AdminLoginPage    = lazy(() => import("./features/admin/AdminLoginPage"));
const AdminLayout       = lazy(() => import("./features/admin/AdminLayout"));
const AdminProductsPage = lazy(() => import("./features/admin/AdminProductsPage"));
const AdminBatchPage    = lazy(() => import("./features/admin/AdminBatchPage"));
const AdminOrdersPage   = lazy(() => import("./features/admin/AdminOrdersPage"));
const AdminUsersPage    = lazy(() => import("./features/admin/AdminUsersPage"));
const Dashboard         = lazy(() => import("./features/admin/analyticsSection/pages/Dashboard"));
const Reports           = lazy(() => import("./features/admin/analyticsSection/pages/Reports"));

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
    <>
      {/* Top progress bar on every route change */}
      <NavigationProgress />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<General />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="change-password" element={<Changepassword />} />
            <Route path="otp" element={<OtpPage />} />
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
      </Suspense>
    </>
  );
}