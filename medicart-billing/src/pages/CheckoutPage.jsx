import React, { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import CartSummary from '../components/CartSummary';
import PaymentOptions from '../components/PaymentOptions';
import { MapPin, ChevronLeft } from 'lucide-react';

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState('upi');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <span className="text-2xl font-black text-red-600 tracking-tighter">MediCart</span>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin size={14} className="mr-1" />
            <span>Deliver to: <b>Hyderabad, 500081</b></span>
          </div>
        </div>
      </nav>

      <ProgressBar currentStep={4} />

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-6">
          <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft size={18} /> Back to Delivery
          </button>
          
          <PaymentOptions selected={selectedMethod} setSelected={setSelectedMethod} />
          
          {selectedMethod === 'upi' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
              <h4 className="font-bold mb-4">Pay using UPI ID</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter UPI ID (e.g. user@okaxis)" 
                  className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold text-sm">VERIFY</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </main>
    </div>
  );
}