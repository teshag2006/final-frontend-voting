'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/auth/phone-input';
import { OtpInput } from '@/components/auth/otp-input';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Stage = 'phone' | 'otp' | 'success' | 'error';
type ErrorType = 'invalid_format' | 'rate_limit' | 'invalid_otp' | 'expired' | 'too_many' | 'server_error' | null;

export default function VerifyPhonePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<ErrorType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpStartTime = useRef<number>(0);
  const [timeRemaining, setTimeRemaining] = useState(300);

  // Validate Ethiopian phone number format
  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 12 && cleaned.startsWith('251');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setError(null);

    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid Ethiopian phone number (+251)');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock: Check for rate limit (for demo, always succeeds)
      const random = Math.random();
      if (random < 0.05) {
        setError('rate_limit');
        setPhoneError('Too many OTP requests. Try again in 5 minutes.');
      } else {
        otpStartTime.current = Date.now();
        setTimeRemaining(300);
        setStage('otp');
      }
    } catch (err) {
      setError('server_error');
      setPhoneError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setError(null);

    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock: Validate OTP
      if (otp === '123456') {
        // Demo valid OTP
        setStage('success');
        setTimeout(() => {
          router.push('/voter/dashboard');
        }, 2000);
      } else if (Math.random() < 0.2) {
        setError('expired');
        setOtpError('OTP expired. Please request a new one.');
        setStage('phone');
        setOtp('');
      } else {
        setError('invalid_otp');
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('server_error');
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setOtpError('');
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      otpStartTime.current = Date.now();
      setTimeRemaining(300);
      setResendCountdown(60);
      setSuccessMessage('Code resent successfully!');
      
      // Auto-dismiss success message
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend countdown timer effect
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Timer effect for OTP expiry
  useEffect(() => {
    if (stage !== 'otp') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - otpStartTime.current) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setStage('phone');
        setOtp('');
        setOtpError('OTP expired. Please request a new one.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {stage === 'success' ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Phone Verified</h1>
              <p className="text-gray-600">Your free votes have been activated. Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {stage === 'phone' ? 'Verify Your Phone Number' : 'Enter OTP Code'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {stage === 'phone'
                    ? 'Verify your Ethiopian number to unlock your free vote in every category.'
                    : 'We sent a 6-digit code to your phone. Enter it below.'}
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    {error === 'invalid_format' && 'Please enter a valid Ethiopian phone number.'}
                    {error === 'rate_limit' && 'Too many requests. Please try again later.'}
                    {error === 'invalid_otp' && 'Invalid OTP. Please check and try again.'}
                    {error === 'expired' && 'OTP expired. Please request a new one.'}
                    {error === 'too_many' && 'Too many failed attempts. Please try again later.'}
                    {error === 'server_error' && 'Something went wrong. Please try again.'}
                  </div>
                </div>
              )}

              {/* Form */}
              {stage === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <PhoneInput
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    error={phoneError}
                    disabled={isLoading}
                    autoFocus
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !phone}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    error={otpError}
                    disabled={isLoading}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Code expires in:</span>
                    <span className={cn('font-semibold', timeRemaining < 60 ? 'text-red-600' : 'text-gray-900')}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCountdown > 0}
                    className={cn(
                      'w-full text-center text-sm font-medium py-2 px-4 rounded-lg transition-colors',
                      resendCountdown > 0
                        ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    )}
                  >
                    {resendCountdown > 0
                      ? `Resend code in ${resendCountdown}s`
                      : "Didn't receive the code? Resend"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            By verifying, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms
            </a>
            {' & '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
