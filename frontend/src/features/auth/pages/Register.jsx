import React, { useState } from "react";
import Auth from "../components/Auth";
import authService from "../../../api/authService";
import client from "../../../api/client";
import { useNavigate, Navigate } from "react-router-dom";
import AlertModal from "../../../components/ui/AlertModal";
import ErrorBanner from "../../../components/ui/ErrorBanner";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });
  const [pendingUserData, setPendingUserData] = useState(null);

  // If user is already logged in, redirect away from register page
  const token = localStorage.getItem("accessToken");
  if (token && token !== "null" && token !== "undefined") {
    return <Navigate to="/" replace />;
  }

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
        setAlertModal({
          open: true,
          title: "📧 OTP Sent!",
          message: `Your OTP: ${otpResponse.data.demoOtp}\n\n(Email service is mocked - OTP shown here)\n\nPlease enter this code on the next screen.`,
          type: "success",
        });
        setPendingUserData(payload);
      } else {
        // No demo OTP, navigate directly
        navigate("/auth/otp", { state: { userData: payload } });
      }
      
      console.log("5. Proceeding to OTP Verification...");
      
    } catch (err) {
      console.error("Error:", err);
      console.error("Response data:", err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to register.";
      setError(errorMsg);
    }
};

  return (
    <div className="container my-auto pt-5">
      <ErrorBanner message={error} onClose={() => setError(null)} />
      <Auth type="Register" onSubmit={handleRegisterSubmit} />

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => {
          setAlertModal((s) => ({ ...s, open: false }));
          if (pendingUserData) {
            navigate("/auth/otp", { state: { userData: pendingUserData } });
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttonText="Continue"
      />
    </div>
  );
};

export default Register;