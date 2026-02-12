import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Home, ShoppingBag } from 'lucide-react';
import logger from '../../utils/logger';
import AlertModal from '../../components/ui/AlertModal';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });

  useEffect(() => {
    logger.info('✅ Success page loaded');
    
    const paymentData = location.state;
    if (!paymentData) {
      logger.warn('⚠️ No payment data found, redirecting to home');
      navigate('/');
      return;
    }

    setOrderDetails(paymentData);
    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  const handleDownloadReceipt = () => {
    logger.info('📥 Downloading receipt');
    // TODO: Implement receipt download functionality
    setAlertModal({ open: true, title: "Coming Soon", message: "Receipt download feature coming soon!", type: "info" });
  };

  const handleContinueShopping = () => {
    logger.info('🛍️ Continuing shopping');
    navigate('/');
  };

  const handleViewOrders = () => {
    logger.info('📦 Viewing orders');
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle size={80} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-lg text-emerald-700 mb-1">Your order has been confirmed</p>
          <p className="text-sm text-emerald-600">Order confirmation email has been sent to your registered email</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Header with Amount */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
            <p className="text-emerald-100 text-sm mb-2">Amount Paid</p>
            <h2 className="text-4xl font-bold mb-1">₹ {orderDetails.amount?.toFixed(2) || '0.00'}</h2>
            <p className="text-emerald-100 text-sm">
              {new Date(orderDetails.timestamp).toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-4 border-emerald-500 pl-4">
                <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                <p className="text-lg font-mono font-bold text-gray-800 break-all">
                  {orderDetails.paymentId || 'PAY-' + Date.now()}
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-lg font-mono font-bold text-gray-800 break-all">
                  {orderDetails.transactionId || 'TXN-' + Date.now()}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Payment Method</p>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg font-semibold text-gray-800">
                {orderDetails.method === 'CREDIT_CARD' ? '💳 Credit Card' :
                 orderDetails.method === 'DEBIT_CARD' ? '💳 Debit Card' :
                 orderDetails.method === 'UPI' ? '📱 UPI' :
                 orderDetails.method === 'NETBANKING' ? '🏦 Net Banking' :
                 orderDetails.method || 'Card Payment'}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle size={18} /> Completed
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-800">Confirmation Email</p>
                <p className="text-sm text-gray-600">You'll receive an order confirmation email shortly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-800">Order Verification</p>
                <p className="text-sm text-gray-600">Our team will verify and process your order</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-800">Shipment & Tracking</p>
                <p className="text-sm text-gray-600">Once shipped, you'll receive tracking details via email</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleDownloadReceipt}
            className="bg-white border-2 border-gray-300 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={20} /> Download Receipt
          </button>
          <button
            onClick={handleViewOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} /> View Orders
          </button>
          <button
            onClick={handleContinueShopping}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-3 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Home size={20} /> Continue Shopping
          </button>
        </div>

        {/* Support Info */}
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-gray-700 font-medium mb-2">Need Help?</p>
          <p className="text-gray-600 text-sm mb-3">If you have any questions about your order, please contact us</p>
          <div className="space-y-1 text-sm">
            <p>📧 Email: <a href="mailto:support@medicart.com" className="text-emerald-600 font-semibold hover:underline">support@medicart.com</a></p>
            <p>📞 Phone: <a href="tel:+919876543210" className="text-emerald-600 font-semibold hover:underline">+91 98765 43210</a></p>
            <p>🕐 Available: Mon-Fri, 9 AM - 6 PM IST</p>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
