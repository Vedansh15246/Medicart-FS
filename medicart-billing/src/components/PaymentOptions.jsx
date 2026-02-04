import React from 'react';
import { CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';

const options = [
  { id: 'card', name: 'Credit / Debit Card', desc: 'All Credit/Debit Cards are accepted', icon: <CreditCard className="text-blue-600" /> },
  { id: 'netbanking', name: 'Net Banking', desc: 'All major banks are supported', icon: <Landmark className="text-orange-600" /> },
  { id: 'upi', name: 'UPI', desc: 'Google Pay, PhonePe, Paytm, UPI ID', icon: <Smartphone className="text-green-600" /> },
  { id: 'wallets', name: 'Wallets', desc: 'Amazon Pay, Mobikwik, etc.', icon: <Wallet className="text-purple-600" /> },
];

export default function PaymentOptions({ selected, setSelected }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Select Payment Option</h2>
      <div className="space-y-4">
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selected === opt.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
              {opt.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{opt.name}</h3>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === opt.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
            }`}>
              {selected === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}