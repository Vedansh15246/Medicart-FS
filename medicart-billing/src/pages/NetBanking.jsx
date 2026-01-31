import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const popularBanks = [
  { id: 'sbi', name: 'SBI', icon: '🏦' },
  { id: 'hdfc', name: 'HDFC', icon: '🏦' },
  { id: 'icici', name: 'ICICI', icon: '🏦' },
  { id: 'axis', name: 'Axis', icon: '🏦' },
  { id: 'kotak', name: 'Kotak', icon: '🏦' },
  { id: 'pnb', name: 'PNB', icon: '🏦' }
];

export default function NetBanking() {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState('');

  const handlePayment = () => {
    if (!selectedBank) {
      alert("Please select a bank to proceed.");
      return;
    }
    // Simulate payment processing
    alert(`Redirecting to ${selectedBank} Secure Login...`);
    setTimeout(() => {
      navigate('/success');
    }, 2000);
  };

  return (
    <div className="container">
      <div className="card">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Net Banking</h2>
        <p style={{fontSize: '13px', color: '#666', marginTop: '5px'}}>Select from popular banks</p>
        
        <div className="bank-grid">
          {popularBanks.map(bank => (
            <div 
              key={bank.id} 
              className="bank-box" 
              style={{borderColor: selectedBank === bank.name ? '#00a651' : '#e0e0e0', backgroundColor: selectedBank === bank.name ? '#f0fff4' : 'white'}}
              onClick={() => setSelectedBank(bank.name)}
            >
              <div style={{fontSize: '24px'}}>{bank.icon}</div>
              {bank.name}
            </div>
          ))}
        </div>

        <select 
          className="bank-select" 
          onChange={(e) => setSelectedBank(e.target.value)}
          value={selectedBank}
        >
          <option value="">--- Or Select Other Bank ---</option>
          <option value="Canara Bank">Canara Bank</option>
          <option value="Union Bank">Union Bank</option>
          <option value="Bank of Baroda">Bank of Baroda</option>
        </select>
      </div>

      <div className="card">
        <h3>Order Total</h3>
        <div className="total-row summary-line">
          <span>Amount Payable</span>
          <span>₹ 270.00</span>
        </div>
        <button className="primary-btn" onClick={handlePayment}>
          Make Payment
        </button>
      </div>
    </div>
  );
}