import { MEDICINE_ICONS } from "./medicineIcons";
import { FaInfoCircle, FaCartPlus, FaPlus, FaMinus, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 1. Add this
import { addToCart, incrementQty, decrementQty } from "../../components/cart/cartSlice";
import logger from "../../utils/logger";
import "./product-card.css";

export default function ProductCard({ product, onViewMore }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Initialize navigate

  // LOG PRODUCT DATA RECEIVED
  if (product) {
    logger.debug("📦 ProductCard received product", {
      id: product.id,
      name: product.name,
      price: product.price,
      stockStatus: product.stockStatus,
      inStock: product.inStock,
      totalQuantity: product.totalQuantity,
      batches: product.batches ? product.batches.length : 0,
      category: product.category
    });
  }

  const cartItem = useSelector((state) =>
    state.cart.items.find((i) => i.product.id === product.id)
  );

  const categoryKey = product.category?.trim();
  const Icon = MEDICINE_ICONS[categoryKey] || MEDICINE_ICONS.Tablet;

  // Stock status determination logic
  // The API returns: stockStatus (IN_STOCK/OUT_OF_STOCK/EXPIRED), totalQuantity, inStock flag
  // Priority: 1) Check stockStatus field from backend, 2) Fallback to quantity checks
  const isStockStatusInStock = product.stockStatus === "IN_STOCK";
  const hasQuantity = product.totalQuantity > 0;
  const canBuy = isStockStatusInStock || hasQuantity;
  
  const isLimitReached = cartItem ? cartItem.qty >= (product.totalQuantity || 0) : false;

  logger.debug("📊 ProductCard stock determination", {
    productId: product.id,
    productName: product.name,
    stockStatusFromAPI: product.stockStatus,
    totalQuantity: product.totalQuantity,
    inStockFlag: product.inStock,
    isStockStatusInStock,
    hasQuantity,
    canBuy,
    decision: canBuy ? "✅ SHOW BUY BUTTON" : "❌ SHOW OUT OF STOCK"
  });

  // 3. Auth Check Wrapper
  const handleProtectedAction = (actionFn) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("auth/login");
      return;
    }
    actionFn();
  };

  return (
    <div className="card">
      <div className="card-header-1">
        <div className="icon-wrap">
          <Icon size={42} />
        </div>
      </div>

      <div className="card-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="price">₹ {product.price}</p>
        
        {canBuy && (
          <div className="stock-info">
             <FaCheckCircle className="stock-icon" />
             <span>{product.totalQuantity} units left</span>
          </div>
        )}
      </div>

      <div className="card-footer-1">
        {canBuy ? (
          cartItem ? (
            <div className="qty-controls">
              {/* Wrapped Actions */}
              <button onClick={() => handleProtectedAction(() => dispatch(decrementQty(product.id)))}>
                <FaMinus />
              </button>
              <span className="qty-number">{cartItem.qty}</span>
              <button 
                onClick={() => handleProtectedAction(() => dispatch(incrementQty(product.id)))}
                disabled={isLimitReached}
                className={isLimitReached ? "disabled-btn" : ""}
              >
                <FaPlus />
              </button>
            </div>
          ) : (
            <div className="card-actions">
              <button
                className="btn-cart"
                // Wrapped Action
                onClick={() => handleProtectedAction(() => dispatch(addToCart(product)))}
              >
                <FaCartPlus size={14} />
                <span>Buy Now</span>
              </button>

              <button
                className="btn-outline"
                onClick={() => onViewMore(product)}
              >
                <FaInfoCircle size={14} />
                <span>Details</span>
              </button>
            </div>
          )
        ) : (
          <div className="status-label-container">
            <span className="label-oos">OUT OF STOCK</span>
          </div>
        )}
      </div>
    </div>
  );
}