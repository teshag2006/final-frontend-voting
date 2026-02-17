'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SignUpFormProps {
  onSubmit?: (data: SignUpData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export function SignUpForm({
  onSubmit,
  isLoading: externalIsLoading = false,
  className,
}: SignUpFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior - call API
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Failed to create account');
          return;
        }

        router.push('/signin?registered=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join us to start voting today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (validationErrors.firstName) {
                    setValidationErrors({ ...validationErrors, firstName: '' });
                  }
                }}
                className={validationErrors.firstName ? 'border-red-500' : ''}
                disabled={isLoading || externalIsLoading}
              />
              {validationErrors.firstName && (
                <p className="text-xs text-red-500">{validationErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (validationErrors.lastName) {
                    setValidationErrors({ ...validationErrors, lastName: '' });
                  }
                }}
                className={validationErrors.lastName ? 'border-red-500' : ''}
                disabled={isLoading || externalIsLoading}
              />
              {validationErrors.lastName && (
                <p className="text-xs text-red-500">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn('h-1 flex-1 rounded-full transition-colors', i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted')}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: <span className="font-medium">{strengthLabels[Math.max(0, passwordStrength - 1)]}</span>
                </p>
              </div>
            )}
            {validationErrors.password && (
              <p className="text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (validationErrors.confirmPassword) {
                    setValidationErrors({ ...validationErrors, confirmPassword: '' });
                  }
                }}
                className={cn('pl-10 pr-10', validationErrors.confirmPassword && 'border-red-500')}
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
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Passwords match
              </p>
            )}
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, agreeToTerms: checked as boolean });
                if (validationErrors.terms) {
                  setValidationErrors({ ...validationErrors, terms: '' });
                }
              }}
              disabled={isLoading || externalIsLoading}
            />
            <Label htmlFor="terms" className="text-xs font-normal leading-tight cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {validationErrors.terms && (
            <p className="text-sm text-red-500">{validationErrors.terms}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || externalIsLoading}
            size="lg"
          >
            {isLoading || externalIsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
