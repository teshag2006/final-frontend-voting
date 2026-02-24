'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { ContestantGender } from '@/lib/contestant-gender';

type SignupRole = 'voter' | 'sponsor' | 'contestant';

const roleCopy: Record<
  SignupRole,
  {
    title: string;
    description: string;
    dashboardPath: string;
  }
> = {
  voter: {
    title: 'Create Voter Account',
    description: 'Sign up to access your voter dashboard and vote securely.',
    dashboardPath: '/verify-phone',
  },
  sponsor: {
    title: 'Create Sponsor Account',
    description: 'Sign up to manage sponsorship campaigns and discover contestants.',
    dashboardPath: '/sponsors',
  },
  contestant: {
    title: 'Create Contestant Account',
    description: 'Sign up to access onboarding, profile tools, and your dashboard.',
    dashboardPath: '/events/contestant/onboarding',
  },
};

export function RoleSignupForm({ role }: { role: SignupRole }) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<ContestantGender | ''>('');
  const [error, setError] = useState<string | null>(null);

  const copy = roleCopy[role];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (role === 'contestant' && !gender) {
      setError('Gender is required for contestant accounts');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(role === 'contestant' ? { gender } : {}),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.message || 'Signup failed');
        return;
      }

      await login(email, password);
      router.push(copy.dashboardPath);
    } catch {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{copy.title}</CardTitle>
            <CardDescription className="text-slate-400">{copy.description}</CardDescription>
            <p className="text-xs text-slate-400">
              Need a different account type?{' '}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Choose role
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-600 bg-red-950 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-slate-600 bg-slate-700 text-white"
                />
              </div>

              {role === 'contestant' ? (
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-slate-200">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as ContestantGender | '')}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              ) : null}

              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
