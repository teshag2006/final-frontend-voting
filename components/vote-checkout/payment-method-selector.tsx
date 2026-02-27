'use client';

import type { ReactNode } from 'react';
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
  const availableMethods = methods.filter(
    (m) => m.enabled && (m.countries.includes('ALL') || m.countries.includes(userCountry))
  );

  const methodLogos: Record<PaymentMethod, ReactNode> = {
    credit_debit_card: (
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">VISA</span>
        <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">Mastercard</span>
        <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">AMEX</span>
      </div>
    ),
    mobile_money: (
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">M-Pesa</span>
        <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">Airtel</span>
        <span className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">Orange</span>
      </div>
    ),
    chapa: (
      <div className="mt-2 inline-flex items-center gap-2 rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
        <span className="inline-block h-2 w-2 rounded-full bg-violet-600" />
        <span>Chapa</span>
      </div>
    ),
    telebirr: (
      <div className="mt-2 inline-flex items-center gap-2 rounded border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
        <span className="inline-block h-2 w-2 rounded-full bg-cyan-600" />
        <span>telebirr</span>
      </div>
    ),
    digital_wallet: (
      <div className="mt-2 inline-flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
          <path
            fill="currentColor"
            d="M7.4 4h8.1c2.7 0 4.3 1.6 4.3 4 0 3-2 4.7-4.9 4.7h-2l-.6 3.8H8.4L10.2 6h4.8c.8 0 1.4.3 1.4 1.1 0 1.1-.8 1.7-1.9 1.7h-2.8L11 13h2.5c4.1 0 7.1-2.2 7.1-6.4C20.6 3 18.4 1 14.9 1H8.1L7.4 4z"
          />
        </svg>
        <span>PayPal</span>
      </div>
    ),
    crypto: (
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Bitcoin</span>
        <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">Ethereum</span>
      </div>
    ),
    cbe_birr: null,
    bank_transfer: null,
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Payment Method</h3>

      <RadioGroup value={selectedMethod} onValueChange={(v) => onMethodChange(v as PaymentMethod)}>
        <div className="space-y-3">
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className={`rounded-lg border p-4 transition-all ${
                selectedMethod === method.id
                  ? 'border-accent bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">{method.label}</div>
                  <div className="mt-1 text-xs text-slate-600">{method.description}</div>
                  {methodLogos[method.id as PaymentMethod]}
                </Label>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>

      {selectedMethod === 'credit_debit_card' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">Accepted Cards:</div>
          <div className="flex gap-3">
            {['Visa', 'Mastercard', 'Amex'].map((card) => (
              <div key={card} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {card}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMethod === 'chapa' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">Powered by Chapa</div>
          <div className="text-xs text-slate-700">
            Ethiopia's fastest growing payment platform supporting all major Ethiopian banks
          </div>
        </div>
      )}

      {selectedMethod === 'telebirr' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">Telebirr Mobile Wallet</div>
          <div className="text-xs text-slate-700">
            Send and receive money using your Ethio Telecom mobile number
          </div>
        </div>
      )}

      {selectedMethod === 'cbe_birr' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">CBE-Birr Account</div>
          <div className="text-xs text-slate-700">
            Transfer directly from your Commercial Bank of Ethiopia account
          </div>
        </div>
      )}

      {selectedMethod === 'mobile_money' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">Mobile Money Providers:</div>
          <div className="flex flex-wrap gap-3">
            {['M-Pesa', 'Airtel', 'Orange'].map((provider) => (
              <div key={provider} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                {provider}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMethod === 'digital_wallet' && (
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 text-xs text-slate-500">Digital Payment:</div>
          <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-blue-700">
              <path
                fill="currentColor"
                d="M7.4 4h8.1c2.7 0 4.3 1.6 4.3 4 0 3-2 4.7-4.9 4.7h-2l-.6 3.8H8.4L10.2 6h4.8c.8 0 1.4.3 1.4 1.1 0 1.1-.8 1.7-1.9 1.7h-2.8L11 13h2.5c4.1 0 7.1-2.2 7.1-6.4C20.6 3 18.4 1 14.9 1H8.1L7.4 4z"
              />
            </svg>
            <span className="text-xs font-semibold text-slate-700">PayPal</span>
          </div>
        </div>
      )}
    </div>
  );
}
