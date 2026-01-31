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
      const response = await client.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, roles } = response.data;

      // backend returns ROLE_ADMIN as a string or array
      if (token && String(roles).includes("ROLE_ADMIN")) {
        // Clear old sessions
        localStorage.clear();

        // Save new credentials
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userRole", "ROLE_ADMIN");

        console.log("Login successful, moving to dashboard...");
        
        // Use replace: true to prevent back-button loops
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("Unauthorized: Admin access required.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
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

        {error && <div className="error-alert" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

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