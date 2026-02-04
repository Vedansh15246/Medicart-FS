import { useSelector } from "react-redux";
import "./cartSummary.css";
import { Link } from "react-router-dom";

export default function CartSummary() {
  const items = useSelector((state) => state.cart.items);

  if (items.length === 0) return null;

  const totalQty = items.reduce((a, b) => a + b.qty, 0);
  const totalPrice = items.reduce(
    (a, b) => a + b.qty * b.product.price,
    0
  ).toFixed(2);

  return (
    <div className="cart-summary">
      <span>{totalQty} items</span>
      <span>₹ {totalPrice}</span>
     <Link to ="/cart"> <button>View Cart</button> </Link>
    </div>
  );
}
