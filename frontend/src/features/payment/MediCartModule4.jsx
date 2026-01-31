import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Hook to access Redux state
import CheckoutPage from './CheckoutPage';
import InvoicePage from './InvoicePage';
import PaymentsPage from './PaymentsPage';
import './Theme.css'; 

const MediCartModule4 = () => {
  const [activeTab, setActiveTab] = useState('checkout');

  // 1. Extract data from Redux store
  // Assumes your store has 'cart' and 'payments' slices
  const cartItems = useSelector((state) => state.cart.items);
  
  // 2. Logic to calculate totals for the child components
  // Since your Redux state stores { product, qty }, we map it to the expected format
  const cartData = {
    items: cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      qty: item.qty,
      price: item.product.price
    })),
    tax: 30.00, // These could also come from a 'totals' selector in Redux
    delivery: 40.00
  };

  // Assuming you have a payment history slice in Redux
  const paymentHistory = useSelector((state) => state.payments?.history || []);

  return (
    <div className="app-wrapper">
      <nav className="main-nav">
        <div className="nav-logo">MediCart</div>
        <div className="nav-links">
          <button 
            onClick={() => setActiveTab('checkout')} 
            className={activeTab === 'checkout' ? 'active' : ''}
          >
            1. Checkout
          </button>
          <button 
            onClick={() => setActiveTab('invoice')} 
            className={activeTab === 'invoice' ? 'active' : ''}
          >
            2. Invoice
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className={activeTab === 'payments' ? 'active' : ''}
          >
            3. History
          </button>
        </div>
      </nav>

      <main>
        {activeTab === 'checkout' && (
          <CheckoutPage 
            cart={cartData} 
            onPaymentSuccess={() => setActiveTab('invoice')} 
          />
        )}
        {activeTab === 'invoice' && (
          <InvoicePage cart={cartData} />
        )}
        {activeTab === 'payments' && (
          <PaymentsPage payments={paymentHistory} />
        )}
      </main>
    </div>
  );
};

export default MediCartModule4;