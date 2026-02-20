import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import paymentService from '../../api/paymentService';
import { orderService } from '../../api/orderService';
import { clearCart } from '../../components/cart/cartSlice';
import { fetchCart } from '../../components/cart/cartSlice';
import logger from '../../utils/logger';
import { ChevronLeft, Banknote } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
 
export default function NetBankingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showToast } = useToast();
 
  const cart = useSelector((state) => state.cart);
  const auth = useSelector((state) => state.auth);
 
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  // Get address from location state or redirect
  const selectedAddress = location.state?.selectedAddressId;
 
  // ✅ Sync cart from backend on page load (handles refresh case)
  useEffect(() => {
    if (cart.items.length === 0 || cart.status === 'idle') {
      logger.info("📍 NetBankingPayment: Syncing cart from backend");
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
 
  const banks = [
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
    { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
    { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
    { id: 'axis', name: 'Axis Bank', icon: '🏦' },
    { id: 'boi', name: 'Bank of India', icon: '🏦' },
    { id: 'yes', name: 'YES Bank', icon: '🏦' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏦' },
    { id: 'idbi', name: 'IDBI Bank', icon: '🏦' },
  ];
 
  const handleNetBankingPayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
 
    try {
      if (!selectedBank) {
        throw new Error('Please select a bank');
      }
 
      // Validate address
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }
 
      logger.info('💳 Processing Net Banking payment', { bank: selectedBank, amount: total, addressId: selectedAddress });
 
      // STEP 1: Create order first
      logger.info("📍 Step 1: Creating order");
      const orderResponse = await orderService.placeOrder(selectedAddress);
      const orderId = orderResponse.id;
     
      logger.info("✅ Order created", { orderId, orderNumber: orderResponse.orderNumber });
 
      // STEP 2: Create payment data
      const paymentData = {
        bankCode: selectedBank,
        paymentMethod: 'NET_BANKING'
      };
 
      logger.info("📤 Step 2: Processing payment for order", { orderId });
 
      // STEP 3: Process payment with orderId
      const response = await paymentService.processPayment(
        orderId,
        total,
        'NET_BANKING',
        paymentData
      );
 
      logger.info('✅ Net Banking Payment processed', { paymentId: response.paymentId, orderId });
 
      // STEP 4: Clear cart and navigate to success
      // replace: true removes the payment page from history so back button won't return here
      dispatch(clearCart());

      // STEP 4.5: If prescription was required, set order to "Pending Review"
      const prescriptionRequired = sessionStorage.getItem('prescriptionRequired') === 'true';
      if (prescriptionRequired) {
        try {
          await orderService.updateOrderStatus(orderId, 'Pending Review');
          logger.info("📋 Order set to Pending Review (prescription required)", { orderId });
        } catch (statusErr) {
          logger.warn("⚠️ Failed to set Pending Review status", statusErr);
        }
        sessionStorage.removeItem('prescriptionRequired');
        sessionStorage.removeItem('selectedAddressId');
      }

      showToast('Order placed successfully! 🎉', 'success', 'Payment Complete', 5000);
     
      navigate('/payment/success', {
        replace: true,
        state: {
          paymentId: response.paymentId,
          transactionId: response.transactionId,
          amount: total,
          orderId: orderId,
          orderNumber: orderResponse.orderNumber,
          method: 'NET_BANKING',
          bankCode: selectedBank,
          timestamp: new Date().toISOString(),
          prescriptionRequired
        }
      });
    } catch (err) {
      logger.error('❌ Net Banking Payment failed', err);
      const errMsg = err.response?.data?.error || err.message || 'Payment processing failed. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error', 'Payment Failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
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
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Banknote size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Net Banking</h1>
              <p className="text-sm text-gray-600">All major Indian banks</p>
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
 
        {/* Net Banking Form */}
        <form onSubmit={handleNetBankingPayment} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
 
          <div>
            <label className="block text-gray-700 font-semibold mb-4">Select Your Bank</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBank(bank.id)}
                  disabled={loading}
                  className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    selectedBank === bank.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{bank.icon}</div>
                  <p className="text-xs font-semibold text-center text-gray-800">{bank.name}</p>
                </button>
              ))}
            </div>
          </div>
 
          {/* Security Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">ℹ️ How Net Banking Works</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>✓ You will be redirected to your bank's website</li>
              <li>✓ Log in with your online banking credentials</li>
              <li>✓ Authorize the payment</li>
              <li>✓ You'll be redirected back with confirmation</li>
            </ul>
          </div>
 
          <button
            type="submit"
            disabled={loading || !selectedBank}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : `Pay ₹ ${total.toFixed(2)} via Net Banking`}
          </button>
 
          <div className="text-center text-sm text-gray-600">
            <p>🔒 Secure & encrypted payment</p>
          </div>
        </form>
      </div>
    </div>
  );
}
 