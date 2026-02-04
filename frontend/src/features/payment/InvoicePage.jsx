import React from 'react';
import { useSelector } from 'react-redux';
import './InvoicePage.css';

const InvoicePage = () => {
  // 1. Pull data directly from Redux
  const cartItems = useSelector((state) => state.cart.items);
  
  // 2. Constants (could also be moved to a 'settings' slice in Redux)
  const tax = 30.00; 
  const delivery = 40.00;

  const handlePrint = () => window.print();

  // 3. Map Redux structure { product, qty } to UI structure
  const items = cartItems.map(item => ({
    name: item.product.name,
    price: item.product.price,
    qty: item.qty
  }));

  // 4. Calculations
  const subTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const grandTotal = subTotal + tax + delivery;

  if (items.length === 0) {
    return (
      <div className="module-container">
        <div className="card text-center p-10">
          <h2>No Order Found</h2>
          <p>Please complete your checkout to view the invoice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container invoice-wrapper">
      
      {/* --- ACTION HEADER (Hidden during print) --- */}
      <div className="invoice-action-bar no-print">
        <h2 className="page-title">Order Management</h2>
        
        <button className="btn-mini-print" onClick={handlePrint} title="Print Invoice">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>Print PDF</span>
        </button>
      </div>

      {/* --- INVOICE CARD --- */}
      <div className="card invoice-body">
        
        <div className="invoice-header">
          <div className="brand-section">
            <h1 className="brand-name">Medicart</h1>
            <p className="text-gray">123 Wellness Plaza, Healthcare City<br />GSTIN: 27AAECM1234F1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="invoice-label">INVOICE</h2>
            <p className="invoice-number">#INV-2026-{(Math.random() * 1000).toFixed(0)}</p>
            <p className="text-gray">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="invoice-details-grid">
          <div className="info-block">
            <span className="label">BILL TO</span>
            <p className="customer-name">Harshit</p>
            <p className="text-gray">Hinjewadi Phase 3, Pune<br />Maharashtra, 411057</p>
          </div>
          <div className="info-block text-right">
            <span className="label">PAYMENT STATUS</span>
            <div className="status-badge-container">
               <span className="status-badge status-paid">PAID</span>
            </div>
            <p className="text-gray">Method: UPI Online</p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="text-center">Description</th>
              <th className="text-center">Qty</th>
              <th className="text-center">Unit Price</th>
              <th className="text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span className="item-name">{item.name}</span>
                  <br /><small className="text-gray">Batch: BT-{1000 + idx}</small>
                </td>
                <td className="text-center">{item.qty}</td>
                <td className="text-center">₹{item.price}</td>
                <td className="text-center">₹{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-footer-container">
          <div className="notes-section">
            <p className="label">NOTES & TERMS</p>
            <p className="text-gray-small">
              1. Goods once sold will not be taken back.<br />
              2. Computer generated invoice.
            </p>
          </div>
          <div className="invoice-summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>₹{delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>GST (Fixed)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <strong>Grand Total </strong>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
        
        <div className="authorized-signatory">
          <div className="sign-line"></div>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;