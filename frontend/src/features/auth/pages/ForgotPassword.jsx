import React, { useEffect, useState } from "react";
import { IoCaretBackCircle } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import client from "../../../api/client";

const ForgotPassword = () => {
  // Validation functions
  const [error, setError] = useState();
  const [email, setEmail] = useState("");
  const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email) ? "" : "Invalid email address";
  };

  useEffect(() => {
    const emailErr = validateEmail(email);
    setError(emailErr);
  }, [email])

  const [info, setInfo] = useState(null)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [infoType, setInfoType] = useState('info')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (error) return
    try {
      setSubmitting(true)
      const res = await client.post('/api/auth/forgot-password', { email })
      setInfoType('success')
      setInfo(res?.data?.message || 'If an account exists, a reset link was sent to your email.')
    } catch (err) {
      setInfoType('danger')
      setInfo(err?.response?.data?.message || 'Failed to request reset link')
    } finally {
      setSubmitting(false)
    }
  }

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
              <p className="text-center mb-0 fs-sm">Enter your email address to reset your password.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="form-floating col-12">
                  <input type="email" className={`${email && error ? "is-invalid" : ""} form-control`} id="floatingEmail" placeholder="name@example.com" onChange={(e) => setEmail(e.target.value)} />
                  <label htmlFor="floatingEmail">Email Address</label>
                  {email && error && <div className="invalid-feedback d-block">{error}</div>}
                </div>
                <div>
                  <button type="submit" className="btn btn-success w-100 mb-3" disabled={!!error || !email || submitting}>
                    {submitting ? 'Sending...' : 'Generate Link'}
                  </button>
                </div>
              </div>
            </form>
            {info && (
              <div className="mt-3">
                <div className={`alert ${infoType === 'success' ? 'alert-success' : infoType === 'danger' ? 'alert-danger' : 'alert-info'}`}>{info}</div>
                <p className="small">After you receive the reset email, click the link to open the Change Password page. If you have the token, you can open the Change Password page and paste it there.</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => navigate('/auth/change-password')}>Open Change Password</button>
                </div>
              </div>
            )}
            <div>
              <Link to={"/login"} className="fs-sm d-flex align-items-center justify-content-center gap-1"> <IoCaretBackCircle /> Back to Login </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;