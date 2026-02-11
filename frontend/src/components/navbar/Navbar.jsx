import { FaShoppingCart, FaUserCircle, FaSearch } from "react-icons/fa";
import { useSelector,useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"; // ✅ import useLocation
import { fetchCart } from "../../components/cart/cartSlice";
function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}
import "./navbar.css";

export default function Navbar({ searchValue, onSearch }) {


  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  // ✅ ADD THIS EFFECT: Fetch cart on load if logged in AND userId is available
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      dispatch(fetchCart());
    }
  }, [dispatch]);



  // ✅ State for profile menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // ✅ Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Get current route
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="navbar">
      {/* BRAND LOGO */}
      <div className="brand">
        <Link to="/">
          <div className="brand-text">
            <span className="brand-main">Medi</span>
            <span className="brand-accent">Cart</span>
          </div>
        </Link>
        <div className="brand-underline" />
      </div>

      {/* SEARCH - only show on home page */}
      {isHomePage && (
        <div className="navbar-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search medicines, tablets, syrups, injections"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* ACTIONS */}
      <div className="navbar-actions">
        <div className="cart-wrapper">
          <Link to="/cart"><FaShoppingCart size={20} /></Link>
          {totalQty > 0 && <span className="cart-count">{totalQty}</span>}
        </div>

        {/* USER PROFILE */}
        <div className="profile-wrapper" ref={menuRef}>
          <FaUserCircle
            size={26}
            className="profile-icon"
            onClick={() => setShowMenu(!showMenu)}
          />
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="profile-menu">
              <ul>
                <Link to="/orders"><li>Orders</li></Link>
                <Link to="/dashboard_client"><li>Account</li></Link>
              </ul>
            </div>
          )}
        </div>
        
        {/* Hide Login/Register if logged in; show Logout if logged in */}
        {!isLoggedIn() ? (
          <div className="d-flex gap-3">
            <NavLink to="/auth/login" className={`btn btn-outline-success`}> Login </NavLink>
            <NavLink to="/auth/register" className={`btn btn-outline-success`}> Register </NavLink>
          </div>
        ) : (
          <button
            className="btn btn-outline-success logout-btn-green"
            onClick={() => {
              localStorage.removeItem('accessToken');
              navigate('/');
              window.location.reload();
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
