import React, { useState } from "react";
import Auth from "../components/Auth";
import authService from "../../../api/authService";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

 const handleRegisterSubmit = async (_e, payload) => {
    console.log("1. Registration started for:", payload.email);
    setError(null);
    try {
      // Call auth service to send OTP
      const response = await authService.register(payload);
      console.log("2. OTP Sent Successfully:", response);
      
      navigate("/auth/otp", { state: { userData: payload } });
      console.log("3. Navigating to OTP Page...");
      
    } catch (err) {
      console.error("4. Error caught:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Check console.");
    }
};

  return (
    <div className="container my-auto pt-5">
      {error && <div className="alert alert-danger mx-auto col-md-8">{error}</div>}
      <Auth type="Register" onSubmit={handleRegisterSubmit} />
    </div>
  );
};

export default Register;