'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validate inputs
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await login(email, password);
      // Redirect directly based on role instead of going through home page
      const userRole = localStorage.getItem('auth_user_role');
      switch (userRole) {
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
    } catch (err) {
      setLocalError('Invalid email or password. Please try again.');
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Form */}
          <div>
            <Card className="border-slate-700 bg-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Sign In</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Messages */}
                  {(error || localError) && (
                    <Alert className="border-red-600 bg-red-950 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error || localError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Demo Credentials</h3>

            {/* Admin */}
            <Card className="border-amber-700 bg-amber-950 cursor-pointer hover:bg-amber-900 transition"
              onClick={() => handleQuickLogin('admin@votingplatform.com', 'Admin@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-300 text-sm">Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-amber-200 font-mono">admin@votingplatform.com</p>
                  <p className="text-amber-300 font-mono">Admin@123456</p>
                </div>
                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Use Admin Account
                </Button>
              </CardContent>
            </Card>

            {/* Contestant 1 */}
            <Card className="border-green-700 bg-green-950 cursor-pointer hover:bg-green-900 transition"
              onClick={() => handleQuickLogin('contestant@example.com', 'Contestant@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 text-sm">Contestant #1 (LA)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-green-200 font-mono text-xs">contestant@example.com</p>
                  <p className="text-green-300 font-mono text-xs">Contestant@123456</p>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Contestant 2 */}
            <Card className="border-green-700 bg-green-950 cursor-pointer hover:bg-green-900 transition"
              onClick={() => handleQuickLogin('maria.garcia@example.com', 'Contestant@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 text-sm">Contestant #2 (Madrid)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-green-200 font-mono text-xs">maria.garcia@example.com</p>
                  <p className="text-green-300 font-mono text-xs">Contestant@123456</p>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Contestant 3 */}
            <Card className="border-green-700 bg-green-950 cursor-pointer hover:bg-green-900 transition"
              onClick={() => handleQuickLogin('alex.chen@example.com', 'Contestant@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 text-sm">Contestant #3 (Shanghai)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-green-200 font-mono text-xs">alex.chen@example.com</p>
                  <p className="text-green-300 font-mono text-xs">Contestant@123456</p>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Media #1 */}
            <Card className="border-purple-700 bg-purple-950 cursor-pointer hover:bg-purple-900 transition"
              onClick={() => handleQuickLogin('media@example.com', 'Media@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 text-sm">Media #1 (New York)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-purple-200 font-mono text-xs">media@example.com</p>
                  <p className="text-purple-300 font-mono text-xs">Media@123456</p>
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Media 2 */}
            <Card className="border-purple-700 bg-purple-950 cursor-pointer hover:bg-purple-900 transition"
              onClick={() => handleQuickLogin('press@example.com', 'Media@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 text-sm">Media #2 (London)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-purple-200 font-mono text-xs">press@example.com</p>
                  <p className="text-purple-300 font-mono text-xs">Media@123456</p>
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Voter #1 */}
            <Card className="border-cyan-700 bg-cyan-950 cursor-pointer hover:bg-cyan-900 transition"
              onClick={() => handleQuickLogin('voter@example.com', 'Voter@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 text-sm">Voter #1 (Toronto)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-cyan-200 font-mono text-xs">voter@example.com</p>
                  <p className="text-cyan-300 font-mono text-xs">Voter@123456</p>
                </div>
                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Voter #2 */}
            <Card className="border-cyan-700 bg-cyan-950 cursor-pointer hover:bg-cyan-900 transition"
              onClick={() => handleQuickLogin('james.smith@example.com', 'Voter@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 text-sm">Voter #2 (Sydney)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-cyan-200 font-mono text-xs">james.smith@example.com</p>
                  <p className="text-cyan-300 font-mono text-xs">Voter@123456</p>
                </div>
                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>

            {/* Voter #3 */}
            <Card className="border-cyan-700 bg-cyan-950 cursor-pointer hover:bg-cyan-900 transition"
              onClick={() => handleQuickLogin('lisa.anderson@example.com', 'Voter@123456')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 text-sm">Voter #3 (Berlin)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-cyan-200 font-mono text-xs">lisa.anderson@example.com</p>
                  <p className="text-cyan-300 font-mono text-xs">Voter@123456</p>
                </div>
                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                  Use Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
