import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Billing from './pages/Billing';
import PaymentSelect from './pages/PaymentSelect';
import CardPayment from './pages/CardPayment';
import NetBanking from './pages/NetBanking';
import Success from './pages/Success'; // Create this simple page for the payment success screen
import DebitCard from './pages/DebitCard';

function App() {
  return (
    <BrowserRouter>
      <div className="header-red">MediCart Mart</div>
      <div className="sub-header">
        <div>Deliver to: <b>Hyderabad, 500081</b></div>
        <div className="steps-container">
          <div className="step"><span className="step-num">1</span> Cart</div>
          <div className="step active"><span className="step-num">4</span> Payment</div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Billing />} />
        <Route path="/payment" element={<PaymentSelect />} />
        <Route path="/card" element={<CardPayment />} />
        <Route path="/netbanking" element={<NetBanking />} />
        <Route path="/success" element={<Success />} />
        <Route path="/debit" element={<DebitCard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;