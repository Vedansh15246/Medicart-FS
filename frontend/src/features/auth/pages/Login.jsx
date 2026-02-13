import Auth from "../components/Auth";
import authService from "../../../api/authService";
import client from "../../../api/client";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import ErrorBanner from "../../../components/ui/ErrorBanner";

const Login = () => {
  const [error, setError] = useState(null);

  // If user is already logged in, redirect away from login page
  const token = localStorage.getItem("accessToken");
  if (token && token !== "null" && token !== "undefined") {
    const role = localStorage.getItem("userRole");
    return <Navigate to={role === "ADMIN" || role === "ROLE_ADMIN" ? "/admin/dashboard" : "/"} replace />;
  }

const handleLoginSubmit = async (_e, payload) => {
  setError(null);
  try {
    // Use authService to login
    const res = await authService.login(payload.email, payload.password);
    console.log("✅ Login response received:", res);

    // Save token and role to localStorage
    if (!res.token) {
      console.error("❌ No token in response:", res);
      setError("Login failed: No token received");
      return;
    }

    localStorage.setItem("accessToken", res.token);
    localStorage.setItem("userRole", res.roles?.includes("ADMIN") ? "ADMIN" : "USER");
    // Store userId returned by backend so services that rely on X-User-Id can use it
    if (res.userId) localStorage.setItem("userId", String(res.userId));

    // Update client headers with token
    client.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;
    if (res.userId) client.defaults.headers.common["X-User-Id"] = String(res.userId);

    // Redirect based on role (safe check if roles missing)
    const isAdmin = res.roles && Array.isArray(res.roles) && res.roles.includes("ADMIN");
    const redirectTo = isAdmin ? "/admin/dashboard" : "/";
    console.log("🔄 Redirecting to:", redirectTo);
    window.location.href = redirectTo;
  } catch (err) {
    console.error("❌ Login error:", err);
    const msg = err.response?.data?.error || err.response?.data?.message || "Invalid email or password.";
    setError(msg);
  }
};
  return (
    <>
      <ErrorBanner message={error} onClose={() => setError(null)} />
      <div className="container my-auto">
        <Auth type="Login" onSubmit={handleLoginSubmit} />
      </div>
    </>
  );
};

export default Login;