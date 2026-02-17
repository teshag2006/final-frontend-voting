import { Button } from '@/components/ui/button';
import { Shield, LogOut, Smartphone } from 'lucide-react';

interface SecurityInfoProps {
  loginMethod: 'google' | 'email';
  isPhoneVerified: boolean;
  lastLogin: string;
  activeSessionsCount: number;
  onLogoutAllSessions?: () => void;
}

export function SecurityInfo({
  loginMethod,
  isPhoneVerified,
  lastLogin,
  activeSessionsCount,
  onLogoutAllSessions,
}: SecurityInfoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Security & Sessions</h3>
      </div>

      <div className="space-y-4">
        {/* Login Method */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Login Method</p>
            <p className="text-xs text-gray-600 mt-1">{loginMethod === 'google' ? 'Google Account' : 'Email & Password'}</p>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Phone Verified</p>
              <p className="text-xs text-gray-600 mt-1">{isPhoneVerified ? 'Yes' : 'Not Verified'}</p>
            </div>
          </div>
          {!isPhoneVerified && (
            <a href="/verify-phone" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
              Verify
            </a>
          )}
        </div>

        {/* Last Login */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-700">Last Login</p>
          <p className="text-sm font-medium text-gray-900">{lastLogin}</p>
        </div>

        {/* Active Sessions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Active Sessions</p>
            <p className="text-xs text-gray-600 mt-1">{activeSessionsCount} active</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={onLogoutAllSessions}
          variant="outline"
          className="w-full border-red-200 text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout All Sessions
        </Button>
      </div>
    </div>
  );
}
