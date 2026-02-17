import type { Metadata } from 'next';
import { getEventDetails } from '@/lib/api';
import { mockEventDetails } from '@/lib/dashboard-mock';
import { Calendar, MapPin, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Event Details | Contestant Portal',
  description: 'Event information and timeline',
};

export default async function EventPage() {
  const apiEventData = await getEventDetails();
  const eventData = apiEventData || mockEventDetails;

  const startDate = new Date(eventData.start_date);
  const endDate = new Date(eventData.end_date);
  const votingDeadline = new Date(eventData.voting_deadline);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Event Details</h1>
        <p className="text-muted-foreground">Important information about the contest.</p>
      </div>

      {/* Event Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Name */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Name</h3>
          <p className="text-2xl font-bold text-foreground">{eventData.event_name}</p>
        </div>

        {/* Category */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Category</h3>
          <p className="text-2xl font-bold text-foreground">{eventData.category}</p>
        </div>

        {/* Start Date */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
          </div>
          <p className="text-lg font-semibold text-foreground">{formatDate(startDate)}</p>
        </div>

        {/* End Date */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
          </div>
          <p className="text-lg font-semibold text-foreground">{formatDate(endDate)}</p>
        </div>

        {/* Voting Deadline */}
        <div className="md:col-span-2 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-accent">Voting Deadline</h3>
          </div>
          <p className="text-lg font-semibold text-foreground">{formatDate(votingDeadline)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            No votes will be accepted after this time
          </p>
        </div>
      </div>

      {/* Rules Section */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Contest Rules</h2>
        </div>
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <div
              className="text-foreground space-y-4 text-sm"
              dangerouslySetInnerHTML={{
                __html: eventData.rules_summary
                  .split('\n')
                  .map((line: string) => {
                    if (line.startsWith('#')) {
                      return `<h4 class="font-semibold mt-4 text-base">${line.replace(/^#+\s/, '')}</h4>`;
                    }
                    if (line.startsWith('-') || line.startsWith('•')) {
                      return `<li class="ml-4">${line.replace(/^[-•]\s/, '')}</li>`;
                    }
                    if (line.trim()) {
                      return `<p>${line}</p>`;
                    }
                    return '';
                  })
                  .join(''),
              }}
            />
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">Important Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>✓ All votes are final and cannot be edited</li>
          <li>✓ Free votes and paid votes both count equally in rankings</li>
          <li>✓ Votes must pass our fraud detection system</li>
          <li>✓ Blockchain verification may take up to 24 hours</li>
          <li>✓ Event organizers reserve the right to disqualify contestants who violate rules</li>
        </ul>
      </div>
    </div>
  );
}
