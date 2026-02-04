import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import billingPaymentAPI from '../api/billingPaymentAPI';

export default function CardPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartData = location.state;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFinalPay = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!cartData?.orderId) {
        throw new Error('Order ID is missing');
      }

      if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
        throw new Error('Please fill all card details');
      }

      // Validate card number (basic check)
      if (cardNumber.replace(/\s/g, '').length < 13) {
        throw new Error('Invalid card number');
      }

      // Validate CVV
      if (cvv.length < 3 || cvv.length > 4) {
        throw new Error('Invalid CVV');
      }

      // Process payment via backend
      const paymentResponse = await billingPaymentAPI.processPayment(
        cartData.orderId,
        parseFloat(cartData.total || cartData.amount),
        'CREDIT_CARD'
      );

      if (paymentResponse.status === 'SUCCESS' || paymentResponse.paymentStatus === 'SUCCESS') {
        // Navigate to success page
        navigate('/success', {
          state: {
            ...cartData,
            paymentId: paymentResponse.paymentId || paymentResponse.id,
            transactionId: paymentResponse.transactionId,
            paymentStatus: 'SUCCESS'
          }
        });
      } else {
        throw new Error(paymentResponse.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    // Add spaces every 4 digits
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="card" style={{maxWidth: '400px', margin: '50px auto'}}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h3>Credit/Debit Card Payment</h3>
      <p>Paying: <b>₹ {cartData?.total || cartData?.amount}</b></p>

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f2dede',
          color: '#d9534f',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleFinalPay}>
        <input
          className="input-box"
          placeholder="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />

        <input
          className="input-box"
          placeholder="Card Number (16 digits)"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength="19"
          required
        />

        <div style={{display:'flex', gap:'10px'}}>
          <div>
            <label style={{fontSize: '12px', color: '#666'}}>Month</label>
            <input
              className="input-box"
              placeholder="MM"
              value={expiryMonth}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                  setExpiryMonth(val);
                }
              }}
              maxLength="2"
              required
            />
          </div>
          <div>
            <label style={{fontSize: '12px', color: '#666'}}>Year</label>
            <input
              className="input-box"
              placeholder="YY"
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
              maxLength="2"
              required
            />
          </div>
          <div>
            <label style={{fontSize: '12px', color: '#666'}}>CVV</label>
            <input
              className="input-box"
              placeholder="CVV"
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength="4"
              required
            />
          </div>
        </div>

        <div style={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#666'
        }}>
          🔒 Your payment information is encrypted and secure
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
          style={{opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
        >
          {loading ? 'Processing...' : `PAY SECURELY ₹ ${cartData?.total || cartData?.amount}`}
        </button>
      </form>
    </div>
  );
}