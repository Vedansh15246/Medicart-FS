import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DebitCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartData = location.state; 

  // State for the expiry date to manage formatting
  const [expiry, setExpiry] = useState('');

  const handlePayment = (e) => {
    e.preventDefault();
    // Proceed to generate invoice for the completed order [cite: 57]
    navigate('/success', { state: cartData });
  };

  // Prevent non-numeric characters from being typed 
  const onlyNumbers = (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Format the input as MM/YY automatically
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numbers
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <span style={{ fontSize: '20px' }}>←</span> Back to Payment Options
      </button>
      
      <div className="card shadow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Enter Debit Card details</h3>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Amount: <b>₹ {cartData?.amount || "0.00"}</b> [cite: 62]
          </div>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#555' }}>
              Card Number (16 Digits)
            </label>
            <input 
              className="input-box" 
              type="text" 
              inputMode="numeric"
              placeholder="0000 0000 0000 0000" 
              onKeyPress={onlyNumbers}
              required 
              pattern="\d{16}"
              maxLength="16"
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#555' }}>
                Expiry (MM/YY)
              </label>
              <input 
                className="input-box" 
                type="text" 
                placeholder="MM/YY" 
                value={expiry}
                onChange={handleExpiryChange}
                onKeyPress={onlyNumbers}
                required 
                maxLength="5"
                pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                title="Please enter a valid expiry date (MM/YY)"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#555' }}>
                CVV (3 Digits)
              </label>
              <input 
                className="input-box" 
                type="password" 
                placeholder="***" 
                onKeyPress={onlyNumbers}
                required 
                pattern="\d{3}"
                maxLength="3"
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ background: '#00a651' }}>
            PAY SECURELY ₹ {cartData?.amount || "0.00"} [cite: 62]
          </button>
        </form>
        
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '15px' }}>
          🔒 Your payment is secured with encrypted pharmacy order data. 
        </p>
      </div>
    </div>
  );
}