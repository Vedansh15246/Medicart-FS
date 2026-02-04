import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingPaymentAPI from '../api/billingPaymentAPI';

export default function Billing() {
  const navigate = useNavigate();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get order data from session/props (passed from main frontend)
  const [cartData, setCartData] = useState(() => {
    const savedData = sessionStorage.getItem('checkoutData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    // Default data if no checkout data
    return {
      orderId: null,
      items: "Paracetamol 500mg, Amoxicillin 250mg",
      subtotal: "250.00",
      tax: "45.00",
      delivery: "0.00",
      total: "295.00"
    };
  });

  // Load payment history on component mount
  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        setLoading(true);
        const history = await billingPaymentAPI.getPaymentHistory();
        setPaymentHistory(history || []);
      } catch (err) {
        console.error('Error loading payment history:', err);
        setError('Unable to load payment history. Please try again.');
        // Continue anyway - don't block the page
      } finally {
        setLoading(false);
      }
    };

    loadPaymentHistory();
  }, []);

  const handleProceedToPay = () => {
    if (!cartData.orderId) {
      alert('Error: Order ID is missing. Please go back to checkout.');
      return;
    }
    navigate('/payment', { state: cartData });
  };

  return (
    <div className="container">
      {/* Payment History Section */}
      <div className="card">
        <h2>Billing & Invoices</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Loading payment history...
          </div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#d9534f', backgroundColor: '#f2dede', borderRadius: '4px' }}>
            {error}
          </div>
        ) : paymentHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No payment history yet
          </div>
        ) : (
          <table className="billing-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id}>
                  <td><b>#{payment.id}</b></td>
                  <td>#{payment.orderId}</td>
                  <td>₹ {payment.amount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-${payment.paymentStatus?.toLowerCase() || 'pending'}`}>
                      {payment.paymentStatus || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Current Order Summary */}
      {cartData.orderId && (
        <div className="card">
          <h3>Current Order Summary</h3>
          <div className="summary-row">
            <span>Order ID</span>
            <span><b>#{cartData.orderId}</b></span>
          </div>
          <div className="summary-row">
            <span>Items</span>
            <span>{cartData.items}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹ {cartData.subtotal}</span>
          </div>
          {cartData.tax && (
            <div className="summary-row">
              <span>Tax (18% GST)</span>
              <span>₹ {cartData.tax}</span>
            </div>
          )}
          {cartData.delivery !== undefined && (
            <div className="summary-row">
              <span>Delivery</span>
              <span>{cartData.delivery === '0.00' ? 'Free' : `₹ ${cartData.delivery}`}</span>
            </div>
          )}
          <div className="summary-row total-payable">
            <span>Total Payable</span>
            <span>₹ {cartData.total}</span>
          </div>
          <button className="primary-btn" onClick={handleProceedToPay}>
            PROCEED TO PAY ₹ {cartData.total}
          </button>
        </div>
      )}
    </div>
  );
}