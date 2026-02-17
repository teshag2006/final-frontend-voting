'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import type { PaymentMethodConfig, PaymentMethod } from '@/types/vote';

interface PaymentMethodSelectorProps {
  methods: PaymentMethodConfig[];
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  userCountry?: string;
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onMethodChange,
  userCountry = 'US',
}: PaymentMethodSelectorProps) {
  // Filter available methods for user's country
  const availableMethods = methods.filter(
    (m) => m.enabled && (m.countries.includes('ALL') || m.countries.includes(userCountry))
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <h3 className="font-bold text-white text-lg">Payment Method</h3>

      <RadioGroup value={selectedMethod} onValueChange={(v) => onMethodChange(v as PaymentMethod)}>
        <div className="space-y-3">
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="mt-1"
                />
                <Label
                  htmlFor={method.id}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-semibold text-white">{method.label}</div>
                  <div className="text-xs text-white/60 mt-1">{method.description}</div>
                </Label>
                <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Payment Logos */}
      {selectedMethod === 'credit_debit_card' && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3">Accepted Cards:</div>
          <div className="flex gap-3">
            {['Visa', 'Mastercard', 'Amex'].map((card) => (
              <div
                key={card}
                className="bg-white/10 rounded px-3 py-2 text-xs font-semibold text-white"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedMethod === 'chapa' && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3">Powered by Chapa</div>
          <div className="text-xs text-white/80">
            Ethiopia's fastest growing payment platform supporting all major Ethiopian banks
          </div>
        </div>
      )}
      
      {selectedMethod === 'telebirr' && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3">Telebirr Mobile Wallet</div>
          <div className="text-xs text-white/80">
            Send and receive money using your Ethio Telecom mobile number
          </div>
        </div>
      )}
      
      {selectedMethod === 'cbe_birr' && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3">CBE-Birr Account</div>
          <div className="text-xs text-white/80">
            Transfer directly from your Commercial Bank of Ethiopia account
          </div>
        </div>
      )}
      
      {selectedMethod === 'mobile_money' && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-3">Mobile Money Providers:</div>
          <div className="flex gap-3 flex-wrap">
            {['M-Pesa', 'Airtel', 'Orange'].map((provider) => (
              <div
                key={provider}
                className="bg-white/10 rounded px-3 py-2 text-xs font-semibold text-white"
              >
                {provider}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
