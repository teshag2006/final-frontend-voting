'use client';

import Link from 'next/link';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-4">
        <PasswordResetForm />
        <p className="text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
