import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import billingPaymentAPI from '../api/billingPaymentAPI';

export default function Success() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch payment details if we have a payment ID
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (state?.paymentId) {
          const details = await billingPaymentAPI.getPaymentStatus(state.paymentId);
          setPaymentDetails(details);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [state?.paymentId]);

  const invoiceId = state?.paymentId || Math.floor(1000 + Math.random() * 9000);
  const totalAmount = state?.total || state?.amount || paymentDetails?.amount || '0.00';

  return (
    <div className="container" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ fontSize: '50px', color: '#00a651', marginBottom: '10px' }}>✅</div>
        <h1 style={{ color: '#00a651', marginBottom: '20px' }}>Payment Successful</h1>
        
        <div className="invoice-box" style={{ border: '1px solid #ddd', padding: '30px', textAlign: 'left', borderRadius: '8px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #c8102e', paddingBottom: '15px', marginBottom: '20px' }}>
            <h2 style={{ color: '#c8102e', margin: 0 }}>🏥 MediCart Mart</h2>
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#666' }}>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
              <div style={{ fontWeight: 'bold', color: '#c8102e' }}>Invoice: #INV-{invoiceId}</div>
            </div>
          </div>

          {/* Order Details */}
          {state?.orderId && (
            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>Order ID:</span>
                <span style={{ fontWeight: 'bold' }}>#{state.orderId}</span>
              </div>
              {state?.paymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Payment ID:</span>
                  <span style={{ fontWeight: 'bold' }}>#{state.paymentId}</span>
                </div>
              )}
              {state?.transactionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Transaction ID:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', fontFamily: 'monospace' }}>{state.transactionId}</span>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          {state?.items && (
            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #eee' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Items Ordered:</div>
              <div style={{ fontSize: '14px', color: '#333', marginLeft: '10px' }}>
                {typeof state.items === 'string' ? state.items : JSON.stringify(state.items)}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
              <span style={{ color: '#666' }}>Subtotal:</span>
              <span>₹ {(state?.subtotal || '0.00')}</span>
            </div>

            {state?.tax && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                <span style={{ color: '#666' }}>Tax (18% GST):</span>
                <span>₹ {state.tax}</span>
              </div>
            )}

            {state?.delivery !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                <span style={{ color: '#666' }}>Delivery Charge:</span>
                <span>{state.delivery === '0.00' ? 'Free' : `₹ ${state.delivery}`}</span>
              </div>
            )}
          </div>

          {/* Total Paid Row */}
          <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '10px', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total Paid</span>
            <span style={{ color: '#00a651' }}>₹ {totalAmount}</span>
          </div>

          {/* Status Badge */}
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#e6f9f0',
            borderLeft: '4px solid #00a651',
            borderRadius: '4px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '13px', color: '#00a651', fontWeight: 'bold' }}>
              ✓ Payment Status: SUCCESS
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Your order has been confirmed and is being prepared for delivery.
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', marginTop: '15px', fontStyle: 'italic' }}>
            This is a computer-generated invoice for your MediCart order.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
          <button className="primary-btn" onClick={() => window.print()} style={{ flex: 1, minWidth: '150px' }}>
            📥 Download Invoice
          </button>
          <button className="primary-btn" style={{ background: '#5b7c99', flex: 1, minWidth: '150px' }} onClick={() => navigate('/')}>
            🏠 Back to Home
          </button>
        </div>

        {loading && (
          <div style={{ marginTop: '20px', color: '#999', fontSize: '14px' }}>
            Loading payment confirmation...
          </div>
        )}
      </div>
    </div>
  );
}