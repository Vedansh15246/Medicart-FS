import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import paymentService from '../../api/paymentService';
import { orderService } from '../../api/orderService';
import { clearCart } from '../../components/cart/cartSlice';
import { fetchCart } from '../../components/cart/cartSlice';
import logger from '../../utils/logger';
import { ChevronLeft } from 'lucide-react';

export default function CardPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // ✅ Get cart data and auth from Redux
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get address from location state or redirect
  const selectedAddress = location.state?.selectedAddressId;

  // ✅ Sync cart from backend on page load (handles refresh case)
  useEffect(() => {
    if (cart.items.length === 0 || cart.status === 'idle') {
      logger.info("📍 CardPayment: Syncing cart from backend");
      dispatch(fetchCart());
    }
  }, []);

  // Calculate totals from Redux cart
  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.qty);
  }, 0);

  const tax = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + delivery;

  const handleFinalPay = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      logger.info("💳 Processing card payment", { 
        amount: total, 
        cardholder: cardholderName,
        addressId: selectedAddress
      });

      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        throw new Error('Please fill all card details');
      }

      // Validate address
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }

      // Validate card number
      if (cardNumber.replace(/\s/g, '').length < 13) {
        throw new Error('Invalid card number (minimum 13 digits required)');
      }

      // Validate CVV
      if (cvv.length < 3 || cvv.length > 4) {
        throw new Error('Invalid CVV (3-4 digits required)');
      }

      // Validate expiry
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(expiryYear) < currentYear || 
          (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
        throw new Error('Card has expired');
      }

      logger.info("📍 Step 1: Creating order");

      // STEP 1: Create order first
      const orderResponse = await orderService.placeOrder(selectedAddress);
      const orderId = orderResponse.id;
      
      logger.info("✅ Order created", { orderId, orderNumber: orderResponse.orderNumber });

      // STEP 2: Create payment object with card details
      const paymentData = {
        method: 'CREDIT_CARD',
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName
      };

      logger.info("📤 Step 2: Processing payment for order", { orderId });

      // STEP 3: Process payment with the orderId
      const paymentResponse = await paymentService.processPayment(
        orderId,
        total,
        'CREDIT_CARD',
        paymentData
      );

      logger.info("✅ Payment processed successfully", { 
        paymentId: paymentResponse.paymentId,
        orderId: orderId,
        status: paymentResponse.status
      });

      // STEP 4: Clear cart and navigate to success
      dispatch(clearCart());
      
      navigate('/payment/success', {
        state: {
          paymentId: paymentResponse.paymentId,
          transactionId: paymentResponse.transactionId,
          amount: total,
          orderId: orderId,
          orderNumber: orderResponse.orderNumber,
          method: 'CREDIT_CARD',
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      logger.error('❌ Payment processing failed', err);
      setError(err.response?.data?.error || err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium"
        >
          <ChevronLeft size={20} /> Back to Payment Options
        </button>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Credit Card Payment</h2>
            <p className="text-emerald-100">Secure payment gateway</p>
          </div>

          {/* Form */}
          <form onSubmit={handleFinalPay} className="p-6 space-y-4">
            {/* Amount Display */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Amount to Pay:</span>
                <span className="text-2xl font-bold text-emerald-600">₹ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength="19"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💳 16-digit card number</p>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <input
                  type="text"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                      setExpiryMonth(val);
                    }
                  }}
                  maxLength="2"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  placeholder="YY"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  maxLength="2"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength="4"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-mono"
                  required
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-sm text-blue-700">
              <span className="text-lg mt-0.5">🔒</span>
              <span>Your payment information is encrypted and secure. We never store full card details.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white text-lg transition-all mt-6 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing Payment...
                </span>
              ) : (
                `Pay ₹ ${total.toFixed(2)} Securely`
              )}
            </button>

            {/* Test Card Info */}
            <div className="text-xs text-gray-500 text-center mt-4 pt-4 border-t border-gray-200">
              💡 Test Card: 4532 1234 5678 9010 | MM/YY: 12/25 | CVV: 123
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
