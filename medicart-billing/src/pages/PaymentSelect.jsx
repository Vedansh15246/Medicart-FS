import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PaymentSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartData = location.state; // Receives data from Billing page

  const methods = [
    { name: 'Credit Card', icon: '💳', path: '/card' },
    { name: 'Debit Card', icon: '💳', path: '/debit' },
    { name: 'UPI', icon: '📱', path: '/upi' },
    { name: 'Net Banking', icon: '🏦', path: '/netbanking' }
  ];

  return (
    <div className="container">
      <div className="card">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Payment Options</h2>
        <div className="payment-grid">
          {methods.map((m) => (
            <div key={m.name} className="pay-card" onClick={() => navigate(m.path, { state: cartData })}>
              <div className="pay-card-icon">{m.icon}</div>
              <b>{m.name}</b>
              <p>Secure {m.name} Payment</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Payable Amount</h3>
        <div className="total-row">₹ {cartData?.amount || "0.00"}</div>
      </div>
    </div>
  );
}