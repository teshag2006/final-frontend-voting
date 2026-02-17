'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, RefreshCw, Zap, Lock, AlertTriangle } from 'lucide-react';
import type { MaintenanceAction } from '@/types/health-monitor';

interface HealthMaintenanceControlsProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function HealthMaintenanceControls({ isAdmin, isSuperAdmin }: HealthMaintenanceControlsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const actions: MaintenanceAction[] = [
    {
      id: 'restart-queue',
      label: 'Restart Queue Workers',
      description: 'Restart all queue worker processes',
      isDanger: false,
      requiresConfirmation: true,
      requiresPassword: isSuperAdmin,
    },
    {
      id: 'restart-jobs',
      label: 'Restart Background Jobs',
      description: 'Restart the background job processor',
      isDanger: false,
      requiresConfirmation: true,
      requiresPassword: isSuperAdmin,
    },
    {
      id: 'clear-stuck',
      label: 'Clear Stuck Jobs',
      description: 'Remove jobs stuck in processing state',
      isDanger: true,
      requiresConfirmation: true,
      requiresPassword: isSuperAdmin,
    },
    {
      id: 'force-recheck',
      label: 'Force Health Recheck',
      description: 'Immediately re-run all health checks',
      isDanger: false,
      requiresConfirmation: false,
      requiresPassword: false,
    },
    {
      id: 'maintenance-mode',
      label: 'Enter Maintenance Mode',
      description: 'Put system in maintenance mode (read-only)',
      isDanger: true,
      requiresConfirmation: true,
      requiresPassword: isSuperAdmin,
    },
    {
      id: 'disable-voting',
      label: 'Emergency Disable Voting',
      description: 'Immediately disable all voting (emergency only)',
      isDanger: true,
      requiresConfirmation: true,
      requiresPassword: isSuperAdmin,
    },
  ];

  const action = actions.find((a) => a.id === selectedAction);

  const handleActionClick = (actionId: string) => {
    const act = actions.find((a) => a.id === actionId);
    if (act?.requiresConfirmation) {
      setSelectedAction(actionId);
      setShowConfirmation(true);
    } else {
      handleExecuteAction(actionId);
    }
  };

  const handleExecuteAction = (actionId: string) => {
    console.log(`Executing action: ${actionId}`);
    setSelectedAction(null);
    setShowConfirmation(false);
    // API call would go here
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Maintenance Controls</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'Execute system maintenance operations (all actions available)'
              : 'View available maintenance operations (read-only)'}
          </p>
        </div>

        {!isSuperAdmin && isAdmin && (
          <div className="p-3 rounded-lg bg-blue-100/20 border border-blue-200/50 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              You have read-only access to maintenance controls. Contact a Super Admin to execute operations.
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((act) => (
            <Button
              key={act.id}
              onClick={() => handleActionClick(act.id)}
              disabled={isAdmin && !isSuperAdmin}
              variant={act.isDanger ? 'destructive' : 'outline'}
              className="flex-col h-auto p-4 text-left items-start justify-start"
            >
              <div className="flex items-center gap-2 mb-1">
                {act.isDanger ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : act.id === 'force-recheck' ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span className="font-semibold text-sm">{act.label}</span>
              </div>
              <span className="text-xs opacity-75">{act.description}</span>
            </Button>
          ))}
        </div>

        {isSuperAdmin && (
          <div className="pt-3 border-t border-border/30 flex items-start gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
            <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p>All actions are logged in the audit trail. Use with caution - some operations cannot be undone.</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {action && (
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {action.isDanger && <AlertTriangle className="h-5 w-5 text-red-600" />}
                Confirm {action.label}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>{action.description}</p>
                {action.isDanger && (
                  <div className="bg-red-100/20 border border-red-200/50 rounded p-3 text-sm text-red-900">
                    ⚠️ This is a dangerous operation. Make sure you understand the consequences before proceeding.
                  </div>
                )}
                {action.requiresPassword && isSuperAdmin && (
                  <div className="text-sm text-muted-foreground italic">
                    Your password will be required to confirm this action.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleExecuteAction(action.id)}
                className={action.isDanger ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Confirm
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
