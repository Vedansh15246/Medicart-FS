import { FaCartPlus, FaTimes, FaPlus, FaMinus, FaPrescriptionBottleAlt } from "react-icons/fa";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, incrementQty, decrementQty } from "../../components/cart/cartSlice";
import AlertModal from "../ui/AlertModal";
import "./medicineModal.css";

export default function MedicineModal({ product, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });

  const cartItem = useSelector((state) =>
    state.cart.items.find((i) => i.product.id === product?.id)
  );

  // Auth Guard for Cart Actions
  const handleAction = (callback) => {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "null" || token === "undefined") {
      setAlertModal({ open: true, title: "Login Required", message: "Please login first to manage your cart!", type: "warning" });
      return;
    }
    callback();
  };

  if (!product) return null;

  const availableStock = product.totalQuantity || 0;
  const isLimitReached = cartItem ? cartItem.qty >= availableStock : false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><FaTimes /></button>

        {(product.requiresRx || product.requires_rx) && (
          <div className="prescription-banner">
            <FaPrescriptionBottleAlt />
            <span>Prescription Required</span>
          </div>
        )}

        <div className="modal-content">
          <h2>{product.name}</h2>
          <p className="category">{product.category}</p>
          <p className="price">₹ {product.price}</p>

          <div className="details">
            <h4 style={{ marginBottom: "8px", color: "#555" }}>Description</h4>
            {/* Displaying description directly from Database */}
            <p>{product.description || "No detailed medical description provided for this product."}</p>
          </div>

          <div className="stock-count">Available Units: {availableStock}</div>

          <div className="modal-actions">
            {product.inStock && availableStock > 0 ? (
              cartItem ? (
                <div className="modal-qty">
                  <button className="qty-btn" onClick={() => handleAction(() => dispatch(decrementQty(product.id)))}>
                    <FaMinus />
                  </button>
                  <span className="qty-count">{cartItem.qty}</span>
                  <button 
                    className="qty-btn" 
                    disabled={isLimitReached} 
                    onClick={() => handleAction(() => dispatch(incrementQty(product.id)))}
                  >
                    <FaPlus />
                  </button>
                </div>
              ) : (
                <button className="add-cart-btn" onClick={() => handleAction(() => dispatch(addToCart(product)))}>
                  <FaCartPlus /> <span>Add to Cart</span>
                </button>
              )
            ) : (
              <div className="out-of-stock-msg">
                {product.stockStatus === "EXPIRED" ? "Product Expired" : "Currently Out of Stock"}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => {
          setAlertModal((s) => ({ ...s, open: false }));
          onClose();
          navigate("auth/login");
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}