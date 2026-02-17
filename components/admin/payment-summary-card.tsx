'use client';

import { LucideIcon } from 'lucide-react';

interface PaymentSummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  bgColor: string;
  textColor?: string;
  isLoading?: boolean;
  isAmount?: boolean;
}

export function PaymentSummaryCard({
  icon: Icon,
  title,
  value,
  bgColor,
  textColor = 'text-white',
  isLoading = false,
  isAmount = false,
}: PaymentSummaryCardProps) {
  const formatValue = () => {
    if (isAmount && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    }
    return value;
  };

  return (
    <div className={`${bgColor} rounded-lg p-6 text-white shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading ? '—' : formatValue()}
          </p>
        </div>
        <Icon className="h-8 w-8 opacity-70" />
      </div>
    </div>
  );
}
