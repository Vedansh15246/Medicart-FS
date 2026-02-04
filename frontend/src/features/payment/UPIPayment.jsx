import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import paymentService from '../../api/paymentService';
import { orderService } from '../../api/orderService';
import { clearCart } from '../../components/cart/cartSlice';
import { fetchCart } from '../../components/cart/cartSlice';
import logger from '../../utils/logger';
import { ChevronLeft, Smartphone } from 'lucide-react';

export default function UPIPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);

  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get address from location state or redirect
  const selectedAddress = location.state?.selectedAddressId;

  // ✅ Sync cart from backend on page load (handles refresh case)
  useEffect(() => {
    if (cart.items.length === 0 || cart.status === 'idle') {
      logger.info("📍 UPIPayment: Syncing cart from backend");
      dispatch(fetchCart());
    }
  }, []);

  // Calculate totals
  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.qty);
  }, 0);

  const tax = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + delivery;

  const validateUPIId = (id) => {
    const upiRegex = /^[a-zA-Z0-9.-]*@[a-zA-Z]{3,}$/;
    return upiRegex.test(id);
  };

  const handleUPIPayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!upiId.trim()) {
        throw new Error('Please enter UPI ID');
      }

      if (!validateUPIId(upiId)) {
        throw new Error('Invalid UPI ID format (e.g., yourname@okhdfcbank)');
      }

      // Validate address
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }

      logger.info('💳 Processing UPI payment', { upiId, amount: total, addressId: selectedAddress });

      // STEP 1: Create order first
      logger.info("📍 Step 1: Creating order");
      const orderResponse = await orderService.placeOrder(selectedAddress);
      const orderId = orderResponse.id;
      
      logger.info("✅ Order created", { orderId, orderNumber: orderResponse.orderNumber });

      // STEP 2: Create payment data
      const paymentData = {
        upiId: upiId,
        paymentMethod: 'UPI'
      };

      logger.info("📤 Step 2: Processing payment for order", { orderId });

      // STEP 3: Process payment with orderId
      const response = await paymentService.processPayment(
        orderId,
        total,
        'UPI',
        paymentData
      );

      logger.info('✅ UPI Payment processed', { paymentId: response.paymentId, orderId });

      // STEP 4: Clear cart and navigate to success
      dispatch(clearCart());
      
      navigate('/payment/success', {
        state: {
          paymentId: response.paymentId,
          transactionId: response.transactionId,
          amount: total,
          orderId: orderId,
          orderNumber: orderResponse.orderNumber,
          method: 'UPI',
          upiId: upiId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      logger.error('❌ UPI Payment failed', err);
      setError(err.response?.data?.error || err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/payment/select')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium"
        >
          <ChevronLeft size={20} /> Back to Payment Methods
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">UPI Payment</h1>
              <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
              <span className="font-semibold">₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-semibold">₹ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Charges</span>
              <span className="font-semibold">
                {delivery === 0 ? <span className="text-green-600">FREE</span> : `₹ ${delivery}`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold">Total Payable</span>
              <span className="text-2xl font-bold text-emerald-600">₹ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* UPI Form */}
        <form onSubmit={handleUPIPayment} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">UPI ID</label>
            <input
              type="email"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@okhdfcbank"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-2">Format: username@bankname (e.g., john@okhdfcbank)</p>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">💡 Popular UPI Apps</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Google Pay</li>
              <li>• PhonePe</li>
              <li>• Paytm</li>
              <li>• BHIM</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : `Pay ₹ ${total.toFixed(2)} via UPI`}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p>🔒 Secure & encrypted payment</p>
          </div>
        </form>
      </div>
    </div>
  );
}
