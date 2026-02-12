import React, { useEffect, useState } from "react";
import { IoCaretBackCircle } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import client from "../../../api/client";
import AlertModal from "../../../components/ui/AlertModal";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState(null);
  const [infoType, setInfoType] = useState("info");
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email) ? "" : "Invalid email address";
  };

  useEffect(() => {
    if (email) {
      setEmailError(validateEmail(email));
    } else {
      setEmailError("");
    }
  }, [email]);

  // Step 1: Submit email → check if registered → show OTP in alert
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (emailError || !email) return;
    try {
      setSubmitting(true);
      setInfo(null);
      const res = await client.post("/auth/forgot-password", { email });
      setOtpSent(true);
      setInfoType("success");
      setInfo("Email verified! OTP has been generated.");
      // Show OTP in alert for demo purposes
      if (res.data.demoOtp) {
        setAlertModal({
          open: true,
          title: "📧 Your OTP",
          message: `${res.data.demoOtp}\n\nNote: In production, this would be sent via email.`,
          type: "success",
        });
      }
    } catch (err) {
      setInfoType("danger");
      setInfo(err?.response?.data?.error || "No account found with this email.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP → redirect to change-password
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    try {
      setSubmitting(true);
      setInfo(null);
      await client.post("/auth/forgot-password/verify-otp", { email, otp });
      setInfoType("success");
      setInfo("OTP verified! Redirecting to change password...");
      // Redirect to change-password page with email in state
      setTimeout(() => {
        navigate("/auth/change-password", { state: { email } });
      }, 1000);
    } catch (err) {
      setInfoType("danger");
      setInfo(err?.response?.data?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-auto mx-auto pb-md-0 pb-5">
      <div className="row justify-content-center align-items-center px-md-0 px-3">
        <div className="col-xl-5 col-md-6 col-12">
          <img src="/forgot-password.svg" className="img-fluid" alt="Forgot Password" />
        </div>
        <div className="col-xl-5 col-md-6 col-12 offset-xl-1 mt-md-0 mt-4">
          <div className="row g-4 px-3 py-4 rounded bg-body-tertiary border shadow-sm">
            <div>
              <h3 className="text-center fw-semibold text-success">Forgot Password</h3>
              <p className="text-center mb-0 fs-sm">
                {!otpSent
                  ? "Enter your registered email address."
                  : "Enter the OTP sent to your email."}
              </p>
            </div>

            {/* Step 1: Email input */}
            {!otpSent && (
              <form onSubmit={handleSendOtp}>
                <div className="row g-3">
                  <div className="form-floating col-12">
                    <input
                      type="email"
                      className={`form-control ${email && emailError ? "is-invalid" : ""}`}
                      id="floatingEmail"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="floatingEmail">Email Address</label>
                    {email && emailError && (
                      <div className="invalid-feedback d-block">{emailError}</div>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-3"
                      disabled={!!emailError || !email || submitting}
                    >
                      {submitting ? "Checking..." : "Send OTP"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: OTP input */}
            {otpSent && (
              <form onSubmit={handleVerifyOtp}>
                <div className="row g-3">
                  <div className="form-floating col-12">
                    <input
                      type="text"
                      className="form-control"
                      id="floatingOtp"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                    <label htmlFor="floatingOtp">Enter OTP</label>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-3"
                      disabled={otp.length < 6 || submitting}
                    >
                      {submitting ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link text-secondary btn-sm"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setInfo(null);
                      }}
                    >
                      ← Change email
                    </button>
                  </div>
                </div>
              </form>
            )}

            {info && (
              <div className="mt-2">
                <div
                  className={`alert ${
                    infoType === "success"
                      ? "alert-success"
                      : infoType === "danger"
                      ? "alert-danger"
                      : "alert-info"
                  } mb-0`}
                >
                  {info}
                </div>
              </div>
            )}

            <div>
              <Link
                to={"/auth/login"}
                className="fs-sm d-flex align-items-center justify-content-center gap-1"
              >
                <IoCaretBackCircle /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default ForgotPassword;