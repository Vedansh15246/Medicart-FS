import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { fetchCart } from '../../components/cart/cartSlice';
import logger from '../../utils/logger';
 
export default function PaymentSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
 
  // ✅ Sync cart from backend on page load (handles refresh case)
  useEffect(() => {
    if (cart.items.length === 0 || cart.status === 'idle') {
      logger.info("📍 PaymentSelect: Syncing cart from backend");
      dispatch(fetchCart());
    }
  }, []);
 
  // Get selected address from location state
  const selectedAddressId = location.state?.selectedAddressId;
 
  // Calculate totals from Redux cart
  const subtotal = cart.items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.qty);
  }, 0);
 
  const tax = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + delivery;
 
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
      path: '/payment/card',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      description: 'ATM/Visa/Mastercard Debit',
      icon: CreditCard,
      path: '/payment/debit',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
      path: '/payment/upi',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: Banknote,
      path: '/payment/netbanking',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];
 
  const handlePaymentMethodSelect = (method) => {
    logger.info(`💳 Selected payment method: ${method.name}`);
    navigate(method.path, {
      state: {
        selectedAddressId: selectedAddressId,
        cartItems: cart.items,
        subtotal,
        tax,
        delivery,
        total,
        itemCount: cart.items.length
      }
    });
  };
 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/payment')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium"
        >
          <ChevronLeft size={20} /> Back to Checkout
        </button>
 
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Payment Method</h1>
          <p className="text-gray-600">Choose how you want to pay for your order</p>
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
 
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
              >
                <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all flex items-center justify-center">
                  <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                    <IconComponent size={32} className="text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </button>
            );
          })}
        </div>
 
        {/* Security & Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-bold text-gray-800">Secure Payment</h4>
                <p className="text-sm text-gray-600">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-bold text-gray-800">Instant Confirmation</h4>
                <p className="text-sm text-gray-600">Real-time order status</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💯</span>
              <div>
                <h4 className="font-bold text-gray-800">100% Safe</h4>
                <p className="text-sm text-gray-600">Money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
 
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Need help? <a href="#" className="text-emerald-600 font-semibold hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}
 
 