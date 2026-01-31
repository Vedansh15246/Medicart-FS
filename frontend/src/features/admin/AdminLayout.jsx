import { Outlet, NavLink, Navigate, useNavigate, Link } from "react-router-dom";
import { isAdminAuthenticated, logoutAdmin } from "./adminAuth";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  // IMPORTANT: This check must match what is saved in AdminLoginPage
  // Check if user is logged in AND has ROLE_ADMIN
  const authenticated = isAdminAuthenticated();

  if (!authenticated) {
    // If not authenticated, send them back to login
    // Using Navigate with 'replace' is standard for auth guards
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    // Redirect and prevent going back
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-layout-wrapper">
      <header className="admin-navbar">
        <div className="nav-container">
          <Link to="/"> 
            <h2 className="admin-logo">MediCart</h2>
          </Link>
          
          <nav className="nav-links">
            <NavLink to="/admin/products" className={({isActive}) => isActive ? "active" : ""}>
              Products
            </NavLink>
            <NavLink to="/admin/batches" className={({isActive}) => isActive ? "active" : ""}>
              Batches
            </NavLink>
            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/reports" className={({isActive}) => isActive ? "active" : ""}>
              Reports
            </NavLink>
            <NavLink to="/admin/orders" className={({isActive}) => isActive ? "active" : ""}>
  Orders
</NavLink>
<NavLink to="/admin/users" className={({isActive}) => isActive ? "active" : ""}>
    Users
</NavLink>
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-content">
        {/* This renders the actual page (Dashboard, Products, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}