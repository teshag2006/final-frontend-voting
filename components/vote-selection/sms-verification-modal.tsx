'use client';

import { useState } from 'react';
import { X, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SMSVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (phoneNumber: string, otp: string) => Promise<void>;
  contestantName: string;
}

export function SMSVerificationModal({
  isOpen,
  onClose,
  onVerify,
  contestantName,
}: SMSVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone.match(/^\+?2519\d{8}$/)) {
      setError('Invalid Ethiopian phone number. Use format: +2519XXXXXXXX');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to send OTP
      // POST /api/vote/send-otp with phone number
      console.log('[v0] Sending OTP to:', phone);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(phone, otp);
      setStep('success');
      setTimeout(() => {
        onClose();
        // TODO: Redirect to receipt page
      }, 2000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900'>Verify Your Vote</h2>
          <button
            onClick={onClose}
            className='rounded-lg hover:bg-gray-100 p-1 transition-colors'
            aria-label='Close modal'
          >
            <X className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='px-6 py-8'>
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className='space-y-6'>
              <div className='text-center space-y-2 mb-8'>
                <div className='flex justify-center mb-4'>
                  <div className='rounded-full bg-emerald-100 p-3'>
                    <Phone className='h-6 w-6 text-emerald-600' />
                  </div>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Enter Your Phone Number
                </h3>
                <p className='text-sm text-gray-600'>
                  We'll send a verification code to confirm your free vote for {contestantName}
                </p>
              </div>

              <div className='space-y-2'>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                  Ethiopian Phone Number
                </label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='+2519XXXXXXXX'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className='border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                />
                <p className='text-xs text-gray-500'>
                  Format: +2519XXXXXXXX (Ethio Telecom, Vodafone, or Airtel)
                </p>
              </div>

              {error && (
                <div className='flex items-gap-2 rounded-lg bg-red-50 p-3'>
                  <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}

              <Button
                type='submit'
                disabled={isLoading || !phone}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white'
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className='space-y-6'>
              <div className='text-center space-y-2 mb-8'>
                <div className='flex justify-center mb-4'>
                  <div className='rounded-full bg-blue-100 p-3'>
                    <Lock className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Enter Verification Code
                </h3>
                <p className='text-sm text-gray-600'>
                  We sent a 6-digit code to {phone}
                </p>
              </div>

              <div className='space-y-2'>
                <label htmlFor='otp' className='block text-sm font-medium text-gray-700'>
                  Verification Code
                </label>
                <Input
                  id='otp'
                  type='text'
                  placeholder='000000'
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  className='border-gray-300 text-center text-2xl tracking-widest font-mono focus:border-blue-500 focus:ring-blue-500'
                />
              </div>

              {error && (
                <div className='flex gap-2 rounded-lg bg-red-50 p-3'>
                  <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}

              <Button
                type='submit'
                disabled={isLoading || otp.length !== 6}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              >
                {isLoading ? 'Verifying...' : 'Verify & Cast Free Vote'}
              </Button>

              <button
                type='button'
                onClick={() => setStep('phone')}
                className='w-full text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Change phone number
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className='text-center space-y-6 py-8'>
              <div className='flex justify-center'>
                <div className='rounded-full bg-green-100 p-3 animate-pulse'>
                  <CheckCircle2 className='h-8 w-8 text-green-600' />
                </div>
              </div>
              <div className='space-y-2'>
                <h3 className='text-xl font-bold text-gray-900'>Vote Confirmed!</h3>
                <p className='text-sm text-gray-600'>
                  Your free vote for {contestantName} has been securely recorded on the blockchain.
                </p>
              </div>
              <div className='rounded-lg bg-green-50 p-4 text-left space-y-2'>
                <p className='text-sm font-medium text-green-900'>Vote Details:</p>
                <p className='text-xs text-green-700'>
                  Transaction ID: TX-{Math.random().toString(36).substring(7).toUpperCase()}
                </p>
                <p className='text-xs text-green-700'>
                  Status: Verified on Ethereum blockchain
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
