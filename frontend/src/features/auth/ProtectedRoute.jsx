import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");

  // If no token, redirect to login page
  if (!token || token === "null") {
    return <Navigate to="/auth/login" replace />;
  }

  // If token exists, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;