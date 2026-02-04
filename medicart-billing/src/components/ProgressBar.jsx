import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Shopping Cart' },
  { id: 2, name: 'Promotions & Review' },
  { id: 3, name: 'Delivery & Inventory' },
  { id: 4, name: 'Payment' }
];

export default function ProgressBar({ currentStep = 4 }) {
  return (
    <div className="flex items-center justify-center w-full py-6 bg-white border-b mb-6">
      <div className="flex items-center space-x-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 
              ${step.id < currentStep ? 'bg-green-600 border-green-600 text-white' : 
                step.id === currentStep ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {step.id < currentStep ? <Check size={16} /> : step.id}
            </div>
            <span className={`ml-2 text-sm font-medium ${step.id === currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
              {step.name}
            </span>
            {step.id !== 4 && <div className="w-12 h-px bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}