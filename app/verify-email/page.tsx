'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    void fetch(`/api/auth/confirm-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!mounted) return;
        if (response.ok) {
          setStatus('success');
          setMessage('Your account has been confirmed successfully.');
          return;
        }
        const payload = await response.json().catch(() => null);
        setStatus('error');
        setMessage(payload?.message || 'Verification failed.');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('error');
        setMessage('Verification failed.');
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Email Verification</CardTitle>
            <CardDescription className="text-slate-400">
              Account confirmation status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                status === 'success'
                  ? 'border-emerald-700 bg-emerald-950 text-emerald-200'
                  : status === 'error'
                    ? 'border-red-700 bg-red-950 text-red-200'
                    : 'border-slate-600 bg-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : null}
                <span>{message}</span>
              </div>
            </div>

            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

