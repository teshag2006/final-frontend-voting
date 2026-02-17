'use client';

import React, { useState } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, Pause, StopCircle, Lock, Activity } from 'lucide-react';

export default function EmergencyControlsPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <EmergencyControlsContent />
    </ProtectedRouteWrapper>
  );
}

function EmergencyControlsContent() {
  const [systemState, setSystemState] = useState({
    maintenanceMode: false,
    votingPaused: false,
    paymentsPaused: false,
    gatewayKillSwitch: false,
    emergencyMode: false,
  });

  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  const handleToggle = (key: keyof typeof systemState) => {
    setSystemState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setConfirmingAction(null);
  };

  const getActionDescription = (key: keyof typeof systemState) => {
    const descriptions: Record<keyof typeof systemState, string> = {
      maintenanceMode: 'Enable maintenance mode - only admins can access the platform',
      votingPaused: 'Pause all voting - prevents new votes from being submitted',
      paymentsPaused: 'Pause payments - stops all payment processing',
      gatewayKillSwitch: 'Kill switch payment gateway - emergency stop for payment service',
      emergencyMode: 'Activate emergency mode - restricts all non-essential operations',
    };
    return descriptions[key];
  };

  const getButtonStyle = (key: keyof typeof systemState) => {
    return systemState[key] ? 'bg-red-700 hover:bg-red-800' : 'bg-slate-700 hover:bg-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-950 border border-red-800">
        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-red-300">Emergency Controls</h1>
          <p className="text-sm text-red-200">Use only in critical situations. All actions are logged.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Maintenance Mode */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <CardTitle>Maintenance Mode</CardTitle>
            </div>
            <CardDescription>Only admins can access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{getActionDescription('maintenanceMode')}</p>
              
              {confirmingAction === 'maintenanceMode' ? (
                <div className="p-3 rounded bg-red-950 border border-red-700 space-y-2">
                  <p className="text-sm text-red-200">
                    {systemState.maintenanceMode ? 'Disable maintenance mode?' : 'Enable maintenance mode?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggle('maintenanceMode')}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmingAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmingAction('maintenanceMode')}
                  className={getButtonStyle('maintenanceMode')}
                >
                  {systemState.maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
                </Button>
              )}

              {systemState.maintenanceMode && (
                <div className="p-3 rounded bg-yellow-950 border border-yellow-700 text-sm text-yellow-200">
                  Status: ACTIVE - Platform is in maintenance mode
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voting Pause */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-orange-400" />
              <CardTitle>Pause Voting</CardTitle>
            </div>
            <CardDescription>Prevent new votes from being submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{getActionDescription('votingPaused')}</p>
              
              {confirmingAction === 'votingPaused' ? (
                <div className="p-3 rounded bg-red-950 border border-red-700 space-y-2">
                  <p className="text-sm text-red-200">
                    {systemState.votingPaused ? 'Resume voting?' : 'Pause voting?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggle('votingPaused')}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmingAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmingAction('votingPaused')}
                  className={getButtonStyle('votingPaused')}
                >
                  {systemState.votingPaused ? 'Resume' : 'Pause'} Voting
                </Button>
              )}

              {systemState.votingPaused && (
                <div className="p-3 rounded bg-yellow-950 border border-yellow-700 text-sm text-yellow-200">
                  Status: ACTIVE - Voting is paused
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Pause */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-orange-400" />
              <CardTitle>Pause Payments</CardTitle>
            </div>
            <CardDescription>Stop all payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{getActionDescription('paymentsPaused')}</p>
              
              {confirmingAction === 'paymentsPaused' ? (
                <div className="p-3 rounded bg-red-950 border border-red-700 space-y-2">
                  <p className="text-sm text-red-200">
                    {systemState.paymentsPaused ? 'Resume payments?' : 'Pause payments?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggle('paymentsPaused')}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmingAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmingAction('paymentsPaused')}
                  className={getButtonStyle('paymentsPaused')}
                >
                  {systemState.paymentsPaused ? 'Resume' : 'Pause'} Payments
                </Button>
              )}

              {systemState.paymentsPaused && (
                <div className="p-3 rounded bg-yellow-950 border border-yellow-700 text-sm text-yellow-200">
                  Status: ACTIVE - Payments are paused
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gateway Kill Switch */}
        <Card className="bg-slate-800 border-slate-700 border-red-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <StopCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-400">Payment Gateway Kill Switch</CardTitle>
            </div>
            <CardDescription>Emergency stop for payment service (CRITICAL)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-300">{getActionDescription('gatewayKillSwitch')}</p>
              
              {confirmingAction === 'gatewayKillSwitch' ? (
                <div className="p-3 rounded bg-red-950 border border-red-700 space-y-2">
                  <p className="text-sm text-red-200">
                    {systemState.gatewayKillSwitch 
                      ? 'Restore payment gateway connection?' 
                      : 'ACTIVATE KILL SWITCH? This will disconnect the payment gateway immediately.'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggle('gatewayKillSwitch')}
                      className={systemState.gatewayKillSwitch ? 'bg-green-700 hover:bg-green-800' : 'bg-red-900 hover:bg-red-950'}
                    >
                      {systemState.gatewayKillSwitch ? 'Restore' : 'Activate'} Kill Switch
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmingAction(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmingAction('gatewayKillSwitch')}
                  className={`${getButtonStyle('gatewayKillSwitch')} ${systemState.gatewayKillSwitch ? 'bg-red-900' : ''}`}
                >
                  {systemState.gatewayKillSwitch ? 'Restore' : 'Activate'} Kill Switch
                </Button>
              )}

              {systemState.gatewayKillSwitch && (
                <div className="p-3 rounded bg-red-950 border border-red-700 text-sm text-red-200">
                  ⚠️ Status: ACTIVE - Payment gateway is DISCONNECTED
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <CardTitle>System Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform Status:</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  systemState.maintenanceMode 
                    ? 'bg-red-950 text-red-300' 
                    : 'bg-green-950 text-green-300'
                }`}>
                  {systemState.maintenanceMode ? 'Maintenance' : 'Operational'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Voting:</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  systemState.votingPaused 
                    ? 'bg-orange-950 text-orange-300' 
                    : 'bg-green-950 text-green-300'
                }`}>
                  {systemState.votingPaused ? 'Paused' : 'Active'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Payments:</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  systemState.paymentsPaused 
                    ? 'bg-orange-950 text-orange-300' 
                    : 'bg-green-950 text-green-300'
                }`}>
                  {systemState.paymentsPaused ? 'Paused' : 'Active'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway:</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  systemState.gatewayKillSwitch 
                    ? 'bg-red-950 text-red-300' 
                    : 'bg-green-950 text-green-300'
                }`}>
                  {systemState.gatewayKillSwitch ? 'Disconnected' : 'Connected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
