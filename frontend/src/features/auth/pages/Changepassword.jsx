import React, { useState, useEffect } from "react";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../../../api/client";

const Changepassword = () => {
  const [eye, setEye] = useState(false);
  const [data, setData] = useState({ password: "", cnfPassword: "" });
  const [errors, setErrors] = useState({ password: "", cnfPassword: "" });
  const [isValid, setIsValid] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((s) => ({ ...s, [name]: value }));
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    // strong: lowercase, uppercase, number, special char
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
    setIsValid(!pwdError && !cnfError && data.password.length > 0 && data.cnfPassword.length > 0);
  }, [data.password, data.cnfPassword]);

  const [token, setToken] = useState("")
  const [serverMsg, setServerMsg] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [serverMsgType, setServerMsgType] = useState('info')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const t = params.get('token') || params.get('resetToken')
    if (t) setToken(t)
  }, [location.search])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    // call backend reset-password
    (async () => {
      try {
        setSubmitting(true)
        const payload = { token, newPassword: data.password }
        const res = await client.post('/api/auth/reset-password', payload)
        setServerMsgType('success')
        setServerMsg(res?.data?.message || 'Password changed successfully')
        // navigate to login after short delay
        setTimeout(() => navigate('/auth/login'), 1500)
      } catch (err) {
        setServerMsgType('danger')
        setServerMsg(err?.response?.data?.message || 'Failed to reset password')
      } finally {
        setSubmitting(false)
      }
    })()
  };

  return (
    <div className="container px-md-0 px-4 d-flex py-5 my-5">
      <div className="col-xl-4 col-md-5 col-12 mx-auto my-auto">
        <div className="row g-4 px-3 py-4 rounded bg-body-tertiary border shadow-sm">
          <div>
            <h3 className="text-center fw-semibold text-success">Change Password</h3>
            <p className="text-center mb-0 fs-sm"> Enter your password and confirm it. </p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className={`position-relative d-flex align-items-center justify-content-end form-floating`}>
                <input
                  type={eye === true ? "text" : "password"}
                  className={`form-control ${data.password && errors.password ? "is-invalid" : errors.password === "" && data.password ? "is-valid" : ""}`}
                  id="floatingPassword"
                  placeholder="Password"
                  name="password"
                  value={data.password}
                  onChange={handleOnChange}
                />
                <label htmlFor="floatingPassword"> New Password </label>
                <div className="position-absolute px-2 m-1 bg-white text-secondary opacity-50" onClick={() => setEye(!eye)} style={{ right: 8 }}>
                  {eye ? <RiEyeFill /> : <RiEyeCloseFill />}
                </div>
              </div>
              {data.password && errors.password ? (
                <div className="text-danger small">{errors.password}</div>
              ) : data.password ? (
                <div className="text-success small">Password looks good.</div>
              ) : null}

              <div className={`position-relative d-flex align-items-center justify-content-end form-floating`}>
                <input
                  type={eye === true ? "text" : "password"}
                  className={`form-control ${errors.cnfPassword ? "is-invalid" : errors.cnfPassword === "" && data.cnfPassword ? "is-valid" : ""}`}
                  id="floatingCnfPassword"
                  placeholder="Password"
                  name="cnfPassword"
                  value={data.cnfPassword}
                  onChange={handleOnChange}
                />
                <label htmlFor="floatingCnfPassword"> Confirm Password </label>
                <div className="position-absolute px-2 m-1 bg-white text-secondary opacity-50" onClick={() => setEye(!eye)} style={{ right: 8 }}>
                  {eye ? <RiEyeFill /> : <RiEyeCloseFill />}
                </div>
              </div>
              {/* token input (if token not present in URL) */}
              {!token && (
                <div className="form-floating mt-2">
                  <input type="text" className="form-control" id="floatingToken" placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
                  <label htmlFor="floatingToken">Reset Token (from email)</label>
                </div>
              )}

              {serverMsg && <div className={`mt-3 alert ${serverMsgType === 'success' ? 'alert-success' : serverMsgType === 'danger' ? 'alert-danger' : 'alert-info'}`}>{serverMsg}</div>}
              {errors.cnfPassword ? (
                <div className="text-danger small">{errors.cnfPassword}</div>
              ) : data.cnfPassword ? (
                <div className="text-success small">Passwords match.</div>
              ) : null}

              <div>
                <button type="submit" className="btn btn-success w-100 mb-3" disabled={!isValid}>
                  Change Password
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