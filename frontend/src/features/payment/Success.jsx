import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Home, ShoppingBag } from 'lucide-react';
import logger from '../../utils/logger';
import jsPDF from 'jspdf';
 
export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    logger.info('✅ Success page loaded');
   
    const paymentData = location.state;
    if (!paymentData) {
      logger.warn('⚠️ No payment data found, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
 
    setOrderDetails(paymentData);
    setLoading(false);

    // Push home page into history stack so back button goes to "/" 
    // instead of the payment page (which was already replaced via navigate replace:true)
    window.history.pushState(null, '', '/payment/success');

    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
   
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
     
      // Colors
      const green = [16, 185, 129];
      const darkText = [31, 41, 55];
      const grayText = [107, 114, 128];
     
      // === HEADER ===
      doc.setFillColor(green[0], green[1], green[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
     
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICART', pageWidth / 2, 12, { align: 'center' });
     
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Trusted Online Pharmacy', pageWidth / 2, 20, { align: 'center' });
     
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT RECEIPT', pageWidth / 2, 28, { align: 'center' });
     
      // === SUCCESS BADGE ===
      doc.setFillColor(209, 250, 229);
      doc.roundedRect(55, 42, 100, 10, 3, 3, 'F');
      doc.setTextColor(6, 95, 70);
      doc.setFontSize(10);
      doc.text('PAYMENT SUCCESSFUL', pageWidth / 2, 49, { align: 'center' });
     
      // === AMOUNT BOX ===
      doc.setFillColor(green[0], green[1], green[2]);
      doc.roundedRect(15, 60, pageWidth - 30, 32, 4, 4, 'F');
     
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Amount Paid', pageWidth / 2, 68, { align: 'center' });
     
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      const amount = orderDetails.amount?.toFixed(2) || '0.00';
      doc.text('Rs ' + amount, pageWidth / 2, 80, { align: 'center' });
     
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const date = new Date(orderDetails.timestamp || Date.now());
      const dateStr = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(dateStr, pageWidth / 2, 88, { align: 'center' });
     
      // === TRANSACTION DETAILS ===
      let y = 105;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TRANSACTION DETAILS', 20, y);
     
      doc.setDrawColor(green[0], green[1], green[2]);
      doc.setLineWidth(0.5);
      doc.line(20, y + 2, pageWidth - 20, y + 2);
     
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
     
      // Payment ID
      doc.text('Payment ID:', 25, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(String(orderDetails.paymentId || 'N/A'), 25, y + 5);
     
      // Transaction ID
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Transaction ID:', 115, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(String(orderDetails.transactionId || 'N/A'), 115, y + 5);
     
      y += 18;
     
      // Order ID
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Order ID:', 25, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(String(orderDetails.orderId || 'N/A'), 25, y + 5);
     
      // Status
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Status:', 115, y);
      doc.setTextColor(green[0], green[1], green[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('COMPLETED', 115, y + 5);
     
      // === PAYMENT METHOD ===
      y += 20;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT METHOD', 20, y);
     
      doc.setDrawColor(green[0], green[1], green[2]);
      doc.line(20, y + 2, pageWidth - 20, y + 2);
     
      y += 10;
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(20, y - 4, pageWidth - 40, 10, 2, 2, 'F');
     
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      let method = 'Card Payment';
      if (orderDetails.method === 'CREDIT_CARD') method = 'Credit Card';
      else if (orderDetails.method === 'DEBIT_CARD') method = 'Debit Card';
      else if (orderDetails.method === 'UPI') method = 'UPI Payment';
      else if (orderDetails.method === 'NET_BANKING') method = 'Net Banking';
      doc.text(method, pageWidth / 2, y + 2, { align: 'center' });
     
      // === ORDER SUMMARY ===
      y += 18;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER SUMMARY', 20, y);
     
      doc.setDrawColor(green[0], green[1], green[2]);
      doc.line(20, y + 2, pageWidth - 20, y + 2);
     
      y += 10;
      doc.setFontSize(8);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Items:', 25, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(String(orderDetails.itemCount || 0) + ' items', 25, y + 5);
     
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Delivery:', 115, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Processing', 115, y + 5);
     
      // === THANK YOU ===
      y += 18;
      doc.setTextColor(green[0], green[1], green[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Thank you for shopping with MediCart!', pageWidth / 2, y, { align: 'center' });
     
      // === FOOTER ===
      y += 12;
      doc.setDrawColor(229, 231, 235);
      doc.line(20, y, pageWidth - 20, y);
     
      y += 7;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Support', pageWidth / 2, y, { align: 'center' });
     
      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text('Email: support@medicart.com  |  Phone: +91 98765 43210', pageWidth / 2, y, { align: 'center' });
     
      y += 4;
      doc.text('Available: Monday to Friday, 9:00 AM - 6:00 PM IST', pageWidth / 2, y, { align: 'center' });
     
      y += 6;
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text('This is a computer-generated receipt.', pageWidth / 2, y, { align: 'center' });
     
      // Save PDF
      const filename = 'MediCart_Receipt_' + (orderDetails.paymentId || Date.now()) + '.pdf';
      doc.save(filename);
     
      logger.info('✅ PDF receipt downloaded successfully');
    } catch (error) {
      logger.error('❌ Error generating PDF:', error);
      alert('Failed to download receipt. Error: ' + error.message);
    }
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
    </div>
  );
}