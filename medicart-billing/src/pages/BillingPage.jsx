import React from 'react';
import '../index.css'; // Ensure this is imported
import { Search, MapPin, Download, Eye } from 'lucide-react';

export default function BillingPage() {
  const invoices = [
    { id: 'INV1531', date: '2023-11-20', orderId: 'ORD-9922', amount: '699.22' },
    { id: 'INV1852', date: '2023-11-21', orderId: 'ORD-1108', amount: '309.00' }
  ];

  return (
    <div>
      <div className="medicart-header">MediCart Mart</div>
      
      <div className="sub-nav">
        <div style={{display:'flex', alignItems:'center'}}>
          <MapPin size={16} /> Deliver to: <b>Hyderabad, 500081</b>
        </div>
        <div className="progress-container">
          <div className="step"><span className="step-num">1</span> Shopping Cart</div>
          <div className="step"><span className="step-num">2</span> Delivery</div>
          <div className="step active"><span className="step-num">4</span> Payment</div>
        </div>
      </div>

      <div className="main-container">
        {/* Left Section: Billing List */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2>Billing & Invoices</h2>
            <div style={{position:'relative'}}>
              <input type="text" placeholder="Search Invoice..." style={{padding:'8px 12px', border:'1px solid #ddd', borderRadius:'4px'}} />
            </div>
          </div>
          
          <table className="billing-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order Date</th>
                <th>Order ID</th>
                <th>Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><b>{inv.id}</b></td>
                  <td>{inv.date}</td>
                  <td>{inv.orderId}</td>
                  <td><span className="status-paid">Paid</span></td>
                  <td style={{textAlign:'right', color:'#aaa'}}>
                    <Eye size={18} style={{marginRight:'10px', cursor:'pointer'}} />
                    <Download size={18} style={{cursor:'pointer'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Section: Summary */}
        <div className="card">
          <div className="summary-header">Cart Summary</div>
          <div className="summary-row"><span>No. Of Items</span><span>1</span></div>
          <div className="summary-row"><span>MRP Total</span><span>₹ 430.00</span></div>
          <div className="summary-row saved-amount"><span>Amount Saved</span><span>- ₹ 160.00</span></div>
          <div className="summary-row total-payable"><span>Total Payable</span><span>₹ 270.00</span></div>
          <button className="proceed-btn">PROCEED TO PAY</button>
        </div>
      </div>
    </div>
  );
}