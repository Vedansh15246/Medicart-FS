import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../../components/navbar/Navbar';
import { fetchCart, incrementQty, decrementQty } from './cartSlice';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 1. Get items and status from Redux store
  const { items, status } = useSelector((state) => state.cart);
  const token = localStorage.getItem("accessToken");

  // 2. Fetch the cart only if token exists
  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    } else {
      // If no token, we might want to redirect to login
      // navigate("/login"); 
    }
  }, [dispatch, token]);

  // 3. Calculate Totals with Optional Chaining for safety
  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.qty, 
    0
  );

  // --- RENDER LOGIC ---

  // A. Handle Not Logged In
  if (!token) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.empty}>
          <h1 style={styles.title}>Access Denied</h1>
          <p>Please login to view your cart items.</p>
          <button 
             onClick={() => navigate("/login")}
             className="bg-green-600 text-white px-6 py-2 rounded mt-4"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // B. Handle Loading state
  if (status === "loading" && items.length === 0) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>Syncing your cart...</h2>
        </div>
      </div>
    );
  }

  // C. Handle Empty Cart
  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.topBar}>
          <h1 style={styles.title}>Your Cart</h1>
          <div style={styles.empty}>
            <p>Your cart is currently empty.</p>
            <button 
               onClick={() => navigate("/")}
               className="text-green-700 border border-green-700 px-4 py-2 rounded mt-4"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // D. Main Cart UI
  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={{...styles.topBar, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 style={styles.title}>Your Cart</h1>
        <button
          onClick={() => navigate("/")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            color: '#6b7280',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#2fbf5d';
            e.target.style.color = '#2fbf5d';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.color = '#6b7280';
          }}
        >
          ← Back to Medicines
        </button>
      </div>

      <div style={styles.layout}>
        {/* LEFT SIDE: ITEMS */}
        <div style={styles.left}>
          <h2 style={styles.sectionTitle}>Cart Items ({items.length})</h2>
          <div style={styles.list}>
            {items.map((item) => (
              <div key={item.product?.id || Math.random()} style={styles.card}>
                <div style={styles.itemInfo}>
                  <strong>{item.product?.name || "Medicine Name Not Available"}</strong>
                  <span>₹{item.product?.price || 0}</span>
                  {item.product?.sku && <small style={{color: '#888'}}>SKU: {item.product.sku}</small>}
                </div>
                
                <div style={styles.itemActions}>
                  <div style={styles.qtyControls}>
                    <button 
                      style={styles.qtyBtn} 
                      onClick={() => dispatch(decrementQty(item.product?.id))}
                    >
                      -
                    </button>
                    <span style={styles.qtyValue}>{item.qty}</span>
                    <button 
                      style={styles.qtyBtn} 
                      onClick={() => dispatch(incrementQty(item.product?.id))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: SUMMARY */}
        <div style={styles.right}>
          <h2 style={styles.sectionTitle}>Summary</h2>
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{color: '#2fbf5d'}}>FREE</span>
            </div>
            <div style={{ ...styles.summaryRow, fontWeight: 700, borderTop: '1px solid #eee', paddingTop: 10, marginTop: 10 }}>
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div style={styles.footer}>
            <button
              style={styles.primary}
              onClick={() => navigate("/address")}
            >
              Proceed to Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: 'system-ui, sans-serif', background: '#f9fafb', minHeight: '100vh' },
  topBar: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 24, marginBottom: 24 },
  title: { color: '#111827', fontSize: '24px', fontWeight: 600, margin: 0 },
  layout: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px' },
  left: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  right: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 20, height: 'fit-content', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '1.3rem', marginBottom: 16, fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: 4 },
  itemActions: { display: 'flex', gap: 10, alignItems: 'center' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #ddd', borderRadius: 6, padding: '2px 8px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#2fbf5d', fontWeight: 'bold' },
  qtyValue: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  summary: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  footer: { display: 'flex', justifyContent: 'center' },
  primary: { background: '#2fbf5d', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%' },
  empty: { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: 10, width: '100%', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }
};