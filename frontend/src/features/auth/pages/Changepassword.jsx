import React, { useState, useEffect } from "react";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../../../api/client";

const Changepassword = () => {
  const [eye, setEye] = useState(false);
  const [data, setData] = useState({ password: "", cnfPassword: "" });
  const [errors, setErrors] = useState({ password: "", cnfPassword: "" });
  const [isValid, setIsValid] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverMsgType, setServerMsgType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // If no email in state, redirect back to forgot-password
  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password");
    }
  }, [email, navigate]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    const strongRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/;
    if (!strongRegex.test(pwd)) {
      return "Password must include uppercase, lowercase, number and special character.";
    }
    return "";
  };

  useEffect(() => {
    const pwdError = validatePassword(data.password);
    const cnfError =
      data.cnfPassword && data.password !== data.cnfPassword
        ? "Passwords do not match."
        : "";

    setErrors({ password: pwdError, cnfPassword: cnfError });
    setIsValid(
      !pwdError && !cnfError && data.password.length > 0 && data.cnfPassword.length > 0
    );
  }, [data.password, data.cnfPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      setServerMsg(null);
      await client.post("/auth/reset-password", {
        email,
        newPassword: data.password,
      });
      setServerMsgType("success");
      setServerMsg("Password changed successfully!");
      alert("✅ Password changed successfully!");
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (err) {
      setServerMsgType("danger");
      setServerMsg(err?.response?.data?.error || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container px-md-0 px-4 d-flex py-5 my-5">
      <div className="col-xl-4 col-md-5 col-12 mx-auto my-auto">
        <div className="row g-4 px-3 py-4 rounded bg-body-tertiary border shadow-sm">
          <div>
            <h3 className="text-center fw-semibold text-success">Change Password</h3>
            <p className="text-center mb-0 fs-sm">
              Set a new password for <strong>{email}</strong>
            </p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="position-relative d-flex align-items-center justify-content-end form-floating">
                <input
                  type={eye ? "text" : "password"}
                  className={`form-control ${
                    data.password && errors.password
                      ? "is-invalid"
                      : !errors.password && data.password
                      ? "is-valid"
                      : ""
                  }`}
                  id="floatingPassword"
                  placeholder="Password"
                  name="password"
                  value={data.password}
                  onChange={handleOnChange}
                />
                <label htmlFor="floatingPassword">New Password</label>
                <div
                  className="position-absolute px-2 m-1 bg-white text-secondary opacity-50"
                  onClick={() => setEye(!eye)}
                  style={{ right: 8, cursor: "pointer" }}
                >
                  {eye ? <RiEyeFill /> : <RiEyeCloseFill />}
                </div>
              </div>
              {data.password && errors.password ? (
                <div className="text-danger small">{errors.password}</div>
              ) : data.password ? (
                <div className="text-success small">Password looks good.</div>
              ) : null}

              <div className="position-relative d-flex align-items-center justify-content-end form-floating">
                <input
                  type={eye ? "text" : "password"}
                  className={`form-control ${
                    errors.cnfPassword
                      ? "is-invalid"
                      : !errors.cnfPassword && data.cnfPassword
                      ? "is-valid"
                      : ""
                  }`}
                  id="floatingCnfPassword"
                  placeholder="Confirm Password"
                  name="cnfPassword"
                  value={data.cnfPassword}
                  onChange={handleOnChange}
                />
                <label htmlFor="floatingCnfPassword">Confirm Password</label>
                <div
                  className="position-absolute px-2 m-1 bg-white text-secondary opacity-50"
                  onClick={() => setEye(!eye)}
                  style={{ right: 8, cursor: "pointer" }}
                >
                  {eye ? <RiEyeFill /> : <RiEyeCloseFill />}
                </div>
              </div>
              {errors.cnfPassword ? (
                <div className="text-danger small">{errors.cnfPassword}</div>
              ) : data.cnfPassword ? (
                <div className="text-success small">Passwords match.</div>
              ) : null}

              {serverMsg && (
                <div
                  className={`mt-2 alert ${
                    serverMsgType === "success"
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {serverMsg}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="btn btn-success w-100 mb-3"
                  disabled={!isValid || submitting}
                >
                  {submitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Changepassword;