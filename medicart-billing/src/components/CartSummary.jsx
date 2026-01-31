import React from 'react';

export default function CartSummary() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-bold text-gray-800">Cart Summary</h2>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>No. Of Items</span>
          <span className="font-semibold text-gray-900">1</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>MRP Total</span>
          <span className="font-semibold text-gray-900">₹ 430.00</span>
        </div>
        <div className="flex justify-between text-sm text-green-600 font-medium">
          <span>Amount Saved</span>
          <span>- ₹ 160.00</span>
        </div>
        <div className="pt-4 border-t border-dashed flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total Payable</span>
          <span className="text-xl font-black text-gray-900">₹ 270.00</span>
        </div>
      </div>
      <div className="p-5 bg-gray-50 border-t">
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors">
          PROCEED TO PAY
        </button>
      </div>
    </div>
  );
}