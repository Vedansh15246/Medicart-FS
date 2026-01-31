import Auth from "../components/Auth";
import authService from "../../../api/authService";
import { useState } from "react";

const Login = () => {
  const [error, setError] = useState(null);

const handleLoginSubmit = async (_e, payload) => {
  setError(null);
  try {
    // Use authService to login
    const res = await authService.login(payload.email, payload.password);

    // Save token and role to localStorage
    localStorage.setItem("accessToken", res.token);
    localStorage.setItem("userRole", res.roles.includes("ADMIN") ? "ADMIN" : "USER");

    // Update client headers with token
    const client = require("../../../api/client").default;
    client.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

    // Redirect based on role
    const redirectTo = res.roles.includes("ADMIN") ? "/admin/dashboard" : "/";
    window.location.href = redirectTo;
  } catch (err) {
    setError(err.response?.data?.message || "Invalid email or password.");
  }
};
  return (
    <>
      <div className="container my-auto">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <Auth type="Login" onSubmit={handleLoginSubmit} />
      </div>
    </>
  );
};

export default Login;