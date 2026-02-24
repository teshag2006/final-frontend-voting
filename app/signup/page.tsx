import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRound, Handshake, Trophy } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Select your account type to continue registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-amber-600 hover:text-slate-900 text-white">
                <Link href="/signup/voter">
                  <span className="flex w-full items-center">
                    <span className="inline-flex w-5 justify-center">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span className="ml-3">Register as Voter</span>
                  </span>
                </Link>
              </Button>
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 hover:text-slate-900 text-white">
                <Link href="/signup/sponsor">
                  <span className="flex w-full items-center">
                    <span className="inline-flex w-5 justify-center">
                      <Handshake className="h-4 w-4" />
                    </span>
                    <span className="ml-3">Register as Sponsor</span>
                  </span>
                </Link>
              </Button>
              <Button asChild className="w-full bg-emerald-600 hover:bg-amber-600 hover:text-slate-900 text-white">
                <Link href="/signup/contestant">
                  <span className="flex w-full items-center">
                    <span className="inline-flex w-5 justify-center">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <span className="ml-3">Register as Contestant</span>
                  </span>
                </Link>
              </Button>
            </div>

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
