'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { CreateEditEventModal, type EventFormData } from '@/components/admin/create-edit-event-modal';

export default function AdminNewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (_data: EventFormData) => {
    setIsSubmitting(true);

    // Temporary local flow until backend create endpoint is connected.
    await new Promise((resolve) => setTimeout(resolve, 800));

    router.push('/admin/events?created=1');
  };

  return (
    <ProtectedRouteWrapper requiredRole="admin" fallbackUrl="/events">
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event Management
          </Link>

          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <h1 className="text-2xl font-bold text-foreground">Create New Event</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure registration, voting window, and lifecycle status for a new event.
            </p>
          </div>
        </div>

        <CreateEditEventModal
          isOpen
          onClose={() => router.push('/admin/events')}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </main>
    </ProtectedRouteWrapper>
  );
}
