'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ContestantData } from '@/components/admin/contestants-table';
import type {
  ContestantChangeRequest,
  ContestantPublishingState,
} from '@/lib/contestant-runtime-store';

export default function AdminRegistrationReviewPage() {
  const [contestants, setContestants] = useState<ContestantData[]>([]);
  const [publishingState, setPublishingState] = useState<ContestantPublishingState | null>(null);
  const [changeRequests, setChangeRequests] = useState<ContestantChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewContestant, setReviewContestant] = useState<ContestantData | null>(null);

  const registrationRequests = useMemo(
    () => contestants.filter((item) => item.status === 'PENDING'),
    [contestants]
  );
  const pendingChangeRequests = useMemo(
    () => changeRequests.filter((item) => item.status === 'pending'),
    [changeRequests]
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contestantsRes, publishingRes, requestsRes] = await Promise.all([
        fetch('/api/admin/contestants'),
        fetch('/api/admin/contestant/publishing'),
        fetch('/api/admin/contestant/change-requests'),
      ]);

      if (contestantsRes.ok) {
        const contestantsData = (await contestantsRes.json()) as ContestantData[];
        setContestants(Array.isArray(contestantsData) ? contestantsData : []);
      }
      if (publishingRes.ok) {
        setPublishingState((await publishingRes.json()) as ContestantPublishingState);
      }
      if (requestsRes.ok) {
        setChangeRequests((await requestsRes.json()) as ContestantChangeRequest[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRegistrationDecision = async (
    contestant: ContestantData,
    nextStatus: 'APPROVED' | 'REJECTED'
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/contestants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contestant.id, patch: { status: nextStatus } }),
      });
      if (response.ok) {
        setContestants((prev) =>
          prev.map((item) =>
            item.id === contestant.id ? { ...item, status: nextStatus } : item
          )
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishingDecision = async (action: 'approve' | 'reject' | 'reopen') => {
    const reason =
      action === 'reject'
        ? window.prompt('Enter rejection reason for publishing:') || undefined
        : undefined;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/contestant/publishing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (response.ok) {
        setPublishingState((await response.json()) as ContestantPublishingState);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeRequestDecision = async (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    const note = window.prompt(`Optional note for ${action}:`) || undefined;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/contestant/change-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (response.ok) {
        setChangeRequests((prev) =>
          prev.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  status: action === 'approve' ? 'approved' : 'rejected',
                  reviewedAt: new Date().toISOString(),
                  reviewNote: note,
                }
              : item
          )
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoginAsContestant = async (contestant: ContestantData) => {
    try {
      const response = await fetch('/api/admin/contestants/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          contestantId: contestant.id,
          name: contestant.name,
          email: contestant.email,
          avatar: contestant.avatar,
        }),
      });

      if (!response.ok) {
        window.alert('Could not start contestant login. Please try again.');
        return;
      }

      const payload = (await response.json()) as {
        user?: { id: string; email: string; name: string; role: 'contestant'; avatar?: string };
      };
      if (!payload.user) {
        window.alert('Contestant session data is missing.');
        return;
      }

      localStorage.setItem('auth_user_id', payload.user.id);
      localStorage.setItem('auth_user_role', payload.user.role);
      localStorage.setItem('auth_impersonation_user', JSON.stringify(payload.user));

      const expiresAt = Date.now() + 60 * 60 * 1000;
      const token = btoa(
        JSON.stringify({
          id: payload.user.id,
          email: payload.user.email,
          role: payload.user.role,
          name: payload.user.name,
        })
      );
      localStorage.setItem('auth_token', `${token}.${Date.now()}`);
      localStorage.setItem('refresh_token', Math.random().toString(36).slice(2));
      localStorage.setItem('token_expires_at', String(expiresAt));

      window.location.href = '/events/contestant/dashboard';
    } catch {
      window.alert('Could not start contestant login. Please try again.');
    }
  };

  return (
    <ProtectedRouteWrapper requiredRole="admin" fallbackUrl="/events">
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/contestants"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
                aria-label="Back to contestants"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <p className="text-xs text-muted-foreground">Admin Workspace</p>
                <h1 className="text-2xl font-bold text-foreground">Registration Review</h1>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => void loadData()}
              disabled={isLoading || isSaving}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <h2 className="text-sm font-semibold text-foreground">Review Workflow</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              1) Review new registration requests and approve/reject. 2) Review profile change
              requests and approve/reject. 3) Finalize public publishing decision.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Registration Requests
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {registrationRequests.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Pending Change Requests
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {pendingChangeRequests.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Public Profile</p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {publishingState?.published ? 'Published' : 'Hidden'}
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile Lock</p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {publishingState?.profileLocked ? 'Locked' : 'Unlocked'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">1. Registration Requests</h2>
              <div className="mt-3 space-y-2">
                {registrationRequests.slice(0, 12).map((item) => (
                  <div key={item.id} className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.id} | {item.category}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewContestant(item)}
                        disabled={isSaving}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {registrationRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending registration requests.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">2. Change Requests</h2>
              <div className="mt-3 space-y-2">
                {pendingChangeRequests.slice(0, 12).map((item) => (
                  <div key={item.id} className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="font-medium text-foreground">{item.type} request</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.requestedAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void handleChangeRequestDecision(item.id, 'approve')}
                        disabled={isSaving}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleChangeRequestDecision(item.id, 'reject')}
                        disabled={isSaving}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingChangeRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending change requests.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">3. Publishing Decision</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Submission: <span className="font-medium text-foreground">{publishingState?.submissionStatus ?? '-'}</span>
                </p>
                <p className="text-muted-foreground">
                  Admin review: <span className="font-medium text-foreground">{publishingState?.adminReviewStatus ?? '-'}</span>
                </p>
                <p className="text-muted-foreground">
                  Public: <span className="font-medium text-foreground">{publishingState?.published ? 'Published' : 'Hidden'}</span>
                </p>
                <p className="text-muted-foreground">
                  Locked: <span className="font-medium text-foreground">{publishingState?.profileLocked ? 'Yes' : 'No'}</span>
                </p>
                {publishingState?.rejectionReason ? (
                  <p className="text-red-600">Reason: {publishingState.rejectionReason}</p>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void handlePublishingDecision('approve')} disabled={isSaving}>
                  Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handlePublishingDecision('reject')} disabled={isSaving}>
                  Reject Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handlePublishingDecision('reopen')} disabled={isSaving}>
                  Reopen Review
                </Button>
              </div>
            </section>
          </div>

          {isLoading ? <p className="text-sm text-muted-foreground">Loading workspace...</p> : null}
        </main>

        <Dialog open={Boolean(reviewContestant)} onOpenChange={(open) => !open && setReviewContestant(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Review Registration Request</DialogTitle>
            </DialogHeader>
            {reviewContestant ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {reviewContestant.name}</p>
                  <p><span className="text-muted-foreground">ID:</span> {reviewContestant.id}</p>
                  <p><span className="text-muted-foreground">Category:</span> {reviewContestant.category}</p>
                  <p><span className="text-muted-foreground">Status:</span> {reviewContestant.status}</p>
                  <p><span className="text-muted-foreground">Created:</span> {new Date(reviewContestant.createdAt).toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Bio:</span> {reviewContestant.bio || 'No bio provided.'}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => void handleLoginAsContestant(reviewContestant)}
                    disabled={isSaving}
                  >
                    Login as Contestant
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleRegistrationDecision(reviewContestant, 'APPROVED');
                      setReviewContestant(null);
                    }}
                    disabled={isSaving}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await handleRegistrationDecision(reviewContestant, 'REJECTED');
                      setReviewContestant(null);
                    }}
                    disabled={isSaving}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRouteWrapper>
  );
}
