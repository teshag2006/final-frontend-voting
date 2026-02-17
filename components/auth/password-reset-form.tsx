'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PasswordResetFormProps {
  onSubmit?: (email: string, token?: string, newPassword?: string) => Promise<void>;
  token?: string;
  isLoading?: boolean;
  className?: string;
}

type Step = 'request' | 'verify' | 'reset';

export function PasswordResetForm({
  onSubmit,
  token,
  isLoading: externalIsLoading = false,
  className,
}: PasswordResetFormProps) {
  const [step, setStep] = useState<Step>(token ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Failed to send reset email');
          return;
        }
      }

      setSuccess('Check your email for a verification code');
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: Record<string, string> = {};

    if (!verificationCode.trim()) {
      errors.code = 'Verification code is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, verify the code with the backend
      setSuccess(null);
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: Record<string, string> = {};

    if (!newPassword) {
      errors.password = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email, token || verificationCode, newPassword);
      } else {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            token: token || verificationCode,
            newPassword,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Failed to reset password');
          return;
        }
      }

      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {step === 'request' && 'Enter your email to receive a reset code'}
              {step === 'verify' && 'Enter the verification code'}
              {step === 'reset' && 'Create your new password'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Success Alert */}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Request Reset */}
        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  className={cn('pl-10', validationErrors.email && 'border-red-500')}
                  disabled={isLoading || externalIsLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || externalIsLoading}
              size="lg"
            >
              {isLoading || externalIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  if (validationErrors.code) {
                    setValidationErrors({ ...validationErrors, code: '' });
                  }
                }}
                className={validationErrors.code ? 'border-red-500' : ''}
                disabled={isLoading || externalIsLoading}
                maxLength={6}
              />
              {validationErrors.code && (
                <p className="text-sm text-red-500">{validationErrors.code}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Didn't receive a code?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setStep('request')}
                disabled={isLoading || externalIsLoading}
              >
                Resend
              </button>
            </p>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || externalIsLoading}
              size="lg"
            >
              {isLoading || externalIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: '' });
                    }
                  }}
                  className={cn('pl-10 pr-10', validationErrors.password && 'border-red-500')}
                  disabled={isLoading || externalIsLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || externalIsLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirm) {
                      setValidationErrors({ ...validationErrors, confirm: '' });
                    }
                  }}
                  className={cn('pl-10 pr-10', validationErrors.confirm && 'border-red-500')}
                  disabled={isLoading || externalIsLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || externalIsLoading}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirm && (
                <p className="text-sm text-red-500">{validationErrors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || externalIsLoading}
              size="lg"
            >
              {isLoading || externalIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
