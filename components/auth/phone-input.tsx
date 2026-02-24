'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ error, className, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.replace(/\D/g, '');

      // Add +251 prefix if not present and user starts typing
      if (input && !input.startsWith('251')) {
        if (input.startsWith('0')) {
          input = '251' + input.substring(1);
        } else if (input.startsWith('9')) {
          input = '251' + input;
        }
      }

      // Enforce max Ethiopian length: country code (251) + 9 local digits
      if (input.startsWith('251')) {
        input = input.slice(0, 12);
      } else {
        input = input.slice(0, 9);
      }

      // Format as +251 XXX XXX XXXX
      let formatted = '';
      if (input.startsWith('251')) {
        formatted =
          '+' +
          input.substring(0, 3) +
          ' ' +
          input.substring(3, 6) +
          ' ' +
          input.substring(6, 9) +
          ' ' +
          input.substring(9, 12);
      } else {
        formatted = input;
      }

      onChange?.({ ...e, target: { ...e.target, value: formatted.trim() } });
    };

    return (
      <div className="space-y-2">
        <input
          ref={ref}
          type="tel"
          placeholder="+251 9XX XXX XXX"
          value={value}
          onChange={handleChange}
          maxLength={16}
          className={cn(
            'w-full px-4 py-3 border rounded-lg',
            'text-base font-medium',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
