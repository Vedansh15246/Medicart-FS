import React, { useState } from "react";
import Auth from "../components/Auth";
import authService from "../../../api/authService";
import client from "../../../api/client";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

 const handleRegisterSubmit = async (_e, payload) => {
    console.log("1. Registration started for:", payload.email);
    console.log("   Payload:", payload);
    setError(null);
    try {
      // Step 1: First send OTP to email (mocked)
      console.log("2. Sending OTP to email...");
      const otpResponse = await client.post("/auth/otp/send", { email: payload.email });
      console.log("3. OTP Response:", otpResponse.data);
      
      // Step 2: Show OTP in alert (mocked email service)
      if (otpResponse.data.demoOtp) {
        console.log("4. Demo OTP:", otpResponse.data.demoOtp);
        alert(`📧 OTP Sent!\n\nYour OTP: ${otpResponse.data.demoOtp}\n\n(Email service is mocked - OTP shown here)\n\nPlease enter this code on the next screen.`);
      }
      
      // Step 3: Navigate to OTP verification page
      navigate("/auth/otp", { state: { userData: payload } });
      console.log("5. Navigating to OTP Verification Page...");
      
    } catch (err) {
      console.error("Error:", err);
      console.error("Response data:", err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to register.";
      setError(errorMsg);
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