import { ReactNode } from 'react';
import { EventProvider } from '@/context/EventContext';
import { mockEvents } from '@/lib/events-mock';

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{
    eventSlug: string;
  }>;
}

export async function generateStaticParams() {
  return mockEvents.map((event) => ({
    eventSlug: event.slug,
  }));
}

export default async function EventLayout({
  children,
  params,
}: EventLayoutProps) {
  const { eventSlug } = await params;

  // Find the event by slug
  const event = mockEvents.find((e) => e.slug === eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Event Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EventProvider initialEvent={event}>
      {children}
    </EventProvider>
  );
}
