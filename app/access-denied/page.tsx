'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    switch (user?.role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'contestant':
        router.push('/events/contestant/dashboard');
        break;
      case 'media':
        router.push('/media/dashboard');
        break;
      case 'voter':
        router.push('/voter/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md border-red-700 bg-slate-800 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-950 p-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
          <CardDescription className="text-slate-400 text-base">
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="rounded-lg bg-slate-700 p-4 space-y-2">
              <p className="text-sm text-slate-400">Current Account:</p>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-slate-300 text-sm">{user?.email}</p>
              <div className="pt-2">
                <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold
                  ${user?.role === 'admin' ? 'bg-amber-950 text-amber-300' :
                    user?.role === 'contestant' ? 'bg-green-950 text-green-300' :
                    user?.role === 'media' ? 'bg-purple-950 text-purple-300' :
                    'bg-cyan-950 text-cyan-300'}`}>
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          <div className="text-sm text-slate-300 space-y-1">
            <p>This page is restricted to certain user roles. Your current account does not have access.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {user && (
              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
              </Button>
            )}
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Go to Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-red-400 hover:bg-red-950 hover:text-red-300"
            >
              Logout & Try Another Account
            </Button>
          </div>

          {/* Help Info */}
          <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-700">
            If you believe this is an error, please contact support or ask your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
