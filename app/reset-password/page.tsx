'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? undefined;
  const initialEmail = searchParams.get('email') ?? '';

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Invalid Reset Link</CardTitle>
            <CardDescription className="text-slate-400">
              This reset link is missing or expired. Request a new password reset link to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
            <p className="text-center text-sm text-slate-400">
              Back to{' '}
              <Link href="/login" className="text-blue-400 hover:underline">
                sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-4">
        <PasswordResetForm token={token} initialEmail={initialEmail} />
        <p className="text-center text-sm text-slate-400">
          Need a new reset link?{' '}
          <Link href="/forgot-password" className="text-blue-400 hover:underline">
            Request one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4" />}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
