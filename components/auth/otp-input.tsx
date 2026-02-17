'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, error, disabled }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [isFilled, setIsFilled] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsFilled(value.length === length);
  }, [value, length]);

  useEffect(() => {
    if (error) {
      setIsError(true);
      const timer = setTimeout(() => setIsError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (index: number, newValue: string) => {
    const digit = newValue.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newOtp = value.split('');
    newOtp[index] = digit;
    const newOtpValue = newOtp.join('').slice(0, length);
    onChange(newOtpValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pasted)) {
      onChange(pasted);
      // Focus last input or next empty
      const nextIndex = Math.min(pasted.length, length - 1);
      inputs.current[nextIndex]?.focus();
    }
  };

  return (
    <style>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .otp-shake {
        animation: shake 0.3s ease;
      }
    `}</style>
  ) || (
    <div className="space-y-3">
      <div className={cn('flex gap-2 justify-center', isError && 'otp-shake')}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14',
              'text-center text-lg sm:text-xl font-semibold',
              'border-2 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isError
                ? 'border-red-500 bg-red-50'
                : error
                  ? 'border-red-400 bg-red-50'
                  : isFilled
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-200 bg-gray-50'
            )}
          />
        ))}
      </div>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
