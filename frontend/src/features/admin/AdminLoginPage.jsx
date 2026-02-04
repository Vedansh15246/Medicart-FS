import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import "./AdminLogin.css";

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await client.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, roles, userId } = response.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      // Normalize roles to array
      const roleList = Array.isArray(roles) ? roles : [roles];

      if (!roleList.includes("ROLE_ADMIN")) {
        throw new Error("Admin access required");
      }

      // Clear old data
      localStorage.clear();

      // Store credentials
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", "ROLE_ADMIN");
      if (userId) {
        localStorage.setItem("userId", String(userId));
      }

      console.log("✅ Admin login successful");
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      console.error("❌ Admin Login Error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid admin credentials"
      );
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-box">
        <div className="login-header">
          <h1>MediCart</h1>
          <p>Administration Portal</p>
        </div>

        {error && (
          <div className="error-alert" style={{ color: "red", marginBottom: "15px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@medicart.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
