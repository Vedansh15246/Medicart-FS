import React, { useState } from 'react';
import '../index.css';

export default function PaymentPage() {
  const [step, setStep] = useState('select'); // 'select', 'card', 'upi', 'success'
  const [method, setMethod] = useState('');

  // 1. Selection Screen
  if (step === 'select') {
    return (
      <div className="main-container">
        <div className="card">
          <h2>Payment Options</h2>
          <div className="payment-grid">
            <div className="pay-opt-box" onClick={() => {setMethod('Credit Card'); setStep('card')}}>
              <b>💳 Credit Card</b>
              <p style={{fontSize:'10px', color:'#666'}}>All Credit Cards are accepted</p>
            </div>
            <div className="pay-opt-box" onClick={() => {setMethod('UPI'); setStep('upi')}}>
              <b>📱 UPI</b>
              <p style={{fontSize:'10px', color:'#666'}}>Google Pay / PhonePe / UPI</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="summary-header">Total Amount</div>
          <div className="summary-row" style={{fontSize:'24px', fontWeight:'bold'}}>₹ 270.00</div>
          <button className="proceed-btn" style={{background:'#666'}} onClick={() => window.history.back()}>BACK</button>
        </div>
      </div>
    );
  }

  // 2. Card Entry Screen (Credit/Debit Card)
  if (step === 'card') {
    return (
      <div className="main-container">
        <div className="card">
          <h2>Enter {method} Details</h2>
          <div className="form-group" style={{marginTop:'20px'}}>
            <label>Card Number</label>
            <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="16" />
          </div>
          <div className="inline-inputs">
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM/YY" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="password" placeholder="***" maxLength="3" />
            </div>
          </div>
          <button className="proceed-btn" onClick={() => setStep('success')}>PAY ₹ 270.00</button>
        </div>
      </div>
    );
  }

  // 3. UPI Screen (Dummy QR Code)
  if (step === 'upi') {
    return (
      <div className="main-container" style={{gridTemplateColumns: '1fr'}}>
        <div className="card" style={{textAlign:'center', maxWidth:'400px', margin:'0 auto'}}>
          <h2>Scan to Pay</h2>
          <div className="qr-container">
            <div className="qr-placeholder">
              {/* Replace the text below with an <img> tag later */}
              <span style={{fontSize:'10px'}}>DUMMY QR CODE</span>
            </div>
            <p style={{fontSize:'12px', color:'#666'}}>Scan this QR using any UPI App</p>
          </div>
          <button className="proceed-btn" onClick={() => setStep('success')}>I HAVE PAID</button>
        </div>
      </div>
    );
  }

  // 4. Success Screen [cite: 63, 64]
  return (
    <div className="main-container" style={{gridTemplateColumns: '1fr'}}>
      <div className="card" style={{textAlign:'center', padding:'50px'}}>
        <div style={{fontSize:'50px', color:'#00a651'}}>✔️</div>
        <h2 style={{color:'#00a651'}}>Payment Done!</h2>
        <p>Your order for <b>MediCart</b> has been placed successfully.</p>
        <p style={{fontSize:'14px', color:'#666', marginTop:'10px'}}>Invoice ID: INV-SUCCESS-001</p>
        <button className="proceed-btn" style={{maxWidth:'200px', margin:'20px auto'}} onClick={() => window.location.reload()}>DONE</button>
      </div>
    </div>
  );
}