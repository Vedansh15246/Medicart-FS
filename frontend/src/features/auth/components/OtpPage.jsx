import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../../../api/client";
import { FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";

const OTPPage = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5-minute timer
    const [canResend, setCanResend] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const userData = location.state?.userData;

    // Feature: Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (!userData) {
            navigate("/auth/register");
        }
    }, [userData, navigate]);

    const handleResend = async () => {
        if (!canResend) return;
        try {
            setCanResend(false);
            setTimer(30); // Reset timer
            setError(null);
            await client.post("/api/auth/send-otp", { email: userData.email });
        } catch (err) {
            setError("Failed to resend OTP. Please try again.");
            setCanResend(true);
        }
    };

const handleVerify = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    console.log("📝 Verifying OTP with data:", {
      email: userData?.email,
      isRegistration: !!userData?.fullName,
      isLogin: !!userData?.password
    });

    // Send OTP verification request - IMPORTANT: Don't use client interceptor here
    // because we don't have a token yet
    const res = await client.post("/api/auth/verify-otp", { 
      email: userData?.email,
      otp: otp,
      fullName: userData?.fullName,
      phone: userData?.phone,
      password: userData?.password
    });

    console.log("🎉 OTP verification response:", res.data);

    // Check if response contains token (Login or Registration scenario)
    if (res.data.token) {
      const token = res.data.token;
      const roles = res.data.roles || "USER";
      
      console.log("✅ Authentication successful! Token received");
      setSuccess("✅ Successfully authenticated! Redirecting...");

      // 1. Save token and role to localStorage IMMEDIATELY
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", roles.includes("ADMIN") ? "ADMIN" : "USER");

      // 2. Update client headers IMMEDIATELY so next requests use the token
      client.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("🔐 Token stored. Headers updated. Redirecting...");

      // 3. Wait a bit to show success message, then redirect
      setTimeout(() => {
        const redirectTo = roles.includes("ADMIN") ? "/admin/dashboard" : "/";
        console.log("🚀 Redirecting to:", redirectTo);
        window.location.href = redirectTo;
      }, 500);
    } else {
      // Registration successful without token (shouldn't happen)
      console.log("📝 Registration successful!");
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 500);
    }
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    
    // Better error message
    let errorMessage = "Invalid OTP. Please try again.";
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.status === 401) {
      errorMessage = "Unauthorized. Please check your credentials and try again.";
    } else if (err.response?.status === 400) {
      errorMessage = "Bad request. Please fill in all required fields.";
    } else if (err.response?.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px"
        }}>
            <div style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                padding: "40px",
                maxWidth: "450px",
                width: "100%",
                animation: "slideUp 0.5s ease-out"
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        color: "white",
                        fontSize: "40px"
                    }}>
                        📧
                    </div>
                    <h2 style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        margin: "0 0 10px 0"
                    }}>
                        Verify Your Email
                    </h2>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        margin: "0"
                    }}>
                        Enter the 6-digit code sent to<br/>
                        <span style={{ fontWeight: "600", color: "#333" }}>
                            {userData?.email}
                        </span>
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div style={{
                        background: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        padding: "12px 15px",
                        marginBottom: "20px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start"
                    }}>
                        <FiAlertCircle style={{ color: "#d32f2f", marginTop: "2px", flexShrink: 0 }} />
                        <p style={{ fontSize: "14px", color: "#d32f2f", margin: "0" }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div style={{
                        background: "#efe",
                        border: "1px solid #cfc",
                        borderRadius: "8px",
                        padding: "12px 15px",
                        marginBottom: "20px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start"
                    }}>
                        <FiCheckCircle style={{ color: "#2e7d32", marginTop: "2px", flexShrink: 0 }} />
                        <p style={{ fontSize: "14px", color: "#2e7d32", margin: "0" }}>
                            {success}
                        </p>
                    </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerify} style={{ marginBottom: "20px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="form-control"
                            placeholder="000000"
                            maxLength="6"
                            value={otp}
                            disabled={loading}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            style={{
                                fontSize: "32px",
                                letterSpacing: "12px",
                                textAlign: "center",
                                fontWeight: "700",
                                padding: "16px",
                                border: error ? "2px solid #d32f2f" : "2px solid #e0e0e0",
                                borderRadius: "8px",
                                transition: "border-color 0.3s",
                                fontFamily: "monospace"
                            }}
                            autoFocus
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{
                            width: "100%",
                            padding: "14px",
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "white",
                            background: otp.length < 6 || loading
                                ? "#ccc"
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            borderRadius: "8px",
                            cursor: otp.length < 6 || loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                        }}
                        disabled={loading || otp.length < 6}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "3px solid rgba(255,255,255,0.3)",
                                    borderTop: "3px solid white",
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite"
                                }}></div>
                                Verifying...
                            </>
                        ) : (
                            <>✓ Verify OTP</>
                        )}
                    </button>
                </form>

                {/* Resend Section */}
                <div style={{ textAlign: "center", borderTop: "1px solid #e0e0e0", paddingTop: "20px" }}>
                    <p style={{ fontSize: "13px", color: "#666", margin: "0 0 10px 0" }}>
                        Didn't receive the code?
                    </p>
                    <button 
                        onClick={handleResend}
                        disabled={!canResend}
                        style={{
                            background: "none",
                            border: "none",
                            color: canResend ? "#667eea" : "#999",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: canResend ? "pointer" : "not-allowed",
                            padding: "0",
                            textDecoration: "none"
                        }}
                    >
                        {canResend ? (
                            "🔄 Resend Code"
                        ) : (
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                                <FiClock size={16} />
                                Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </span>
                        )}
                    </button>
                </div>

                {/* Footer Info */}
                <div style={{
                    marginTop: "20px",
                    padding: "12px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#666",
                    textAlign: "center"
                }}>
                    ⏱️ This code will expire in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OTPPage;