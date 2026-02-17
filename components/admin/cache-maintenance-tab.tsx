'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceTask, MaintenanceAction } from '@/types/cache-monitor';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface CacheMaintenanceTabProps {
  tasks: MaintenanceTask[];
  isLoading?: boolean;
  onExecuteTask?: (action: MaintenanceAction) => Promise<void>;
  isSuperAdmin?: boolean;
}

export function CacheMaintenanceTab({
  tasks,
  isLoading = false,
  onExecuteTask,
  isSuperAdmin = false,
}: CacheMaintenanceTabProps) {
  const [executingAction, setExecutingAction] = useState<MaintenanceAction | null>(null);
  const [passwordForDanger, setPasswordForDanger] = useState('');

  const handleExecute = async (action: MaintenanceAction) => {
    if (!onExecuteTask) return;
    setExecutingAction(action);
    try {
      await onExecuteTask(action);
    } catch (error) {
      console.error('Failed to execute task:', error);
    } finally {
      setExecutingAction(null);
      setPasswordForDanger('');
    }
  };

  const regularTasks = tasks.filter((t) => !t.dangerZone);
  const dangerTasks = tasks.filter((t) => t.dangerZone);

  if (isLoading) {
    return <div className="h-96 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Regular Tasks */}
      {regularTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Maintenance Tasks</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {regularTasks.map((task) => (
              <Card key={task.action}>
                <CardHeader>
                  <CardTitle className="text-base">{task.label}</CardTitle>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    Est. duration: {task.estimatedDuration}s
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        {executingAction === task.action ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          'Execute'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Execute: {task.label}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {task.description}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleExecute(task.action)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {dangerTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Danger Zone</h3>
          </div>

          {!isSuperAdmin ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Only SUPER_ADMIN users can access danger zone actions. Your current role does not have permission.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {dangerTasks.map((task) => (
                <Card key={task.action} className="border-destructive/30 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-base text-destructive">{task.label}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs text-muted-foreground">
                      Est. duration: {task.estimatedDuration}s
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="w-full"
                          variant="destructive"
                          disabled={executingAction === task.action}
                        >
                          {executingAction === task.action ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            'Execute'
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive">
                            ⚠️ Confirm: {task.label}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {task.description}
                            <p className="mt-2 font-semibold text-foreground">This action cannot be undone.</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        {task.requiresPasswordReentry && (
                          <div className="space-y-3">
                            <label className="text-sm font-medium">
                              Enter your password to confirm:
                            </label>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              value={passwordForDanger}
                              onChange={(e) => setPasswordForDanger(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleExecute(task.action)}
                            disabled={
                              task.requiresPasswordReentry && passwordForDanger === ''
                            }
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {task.requiresPasswordReentry ? 'Confirm & Execute' : 'Execute'}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
