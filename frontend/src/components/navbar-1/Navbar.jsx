import { FaShoppingCart, FaUserCircle, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import "./navbar.css";
import { fetchCart } from "../../components/cart/cartSlice";
export default function Navbar({ searchValue, onSearch }) {
  // ✅ Get cart items from Redux
  const items = useSelector((state) => state.cart.items);

  // ✅ Calculate total quantity
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="navbar">
      {/* BRAND LOGO */}
      <div className="brand">
        <span className="brand-main">Medi</span>
        <span className="brand-accent">Cart</span>
        <div className="brand-underline" />
      </div>



      {/* ACTIONS */}
      <div className="navbar-actions">
        <div className="cart-wrapper">
          <FaShoppingCart size={20} />

        {/* 🔴 Show badge ONLY if items exist */}
          {totalQty > 0 && (
            <span className="cart-count">{totalQty}</span>
          )}
        </div>
         
        <FaUserCircle size={26} className="profile-icon" />
        
      </div>
    </header>
  );
}
