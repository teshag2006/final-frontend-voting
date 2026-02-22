import { Trophy, FileText, CheckCircle2, Coins, MapPin, Building } from "lucide-react";
import type { Event } from "@/types/event";
import { cn } from "@/lib/utils";

interface EventOverviewProps {
  event: Event;
  className?: string;
}

function StatusBadge({ status }: { status: Event["status"] }) {
  const normalized = String(status).toUpperCase();
  const config: Record<string, { label: string; bg: string; text: string }> = {
    LIVE: { label: "OPEN", bg: "bg-accent", text: "text-accent-foreground" },
    ACTIVE: { label: "OPEN", bg: "bg-accent", text: "text-accent-foreground" },
    UPCOMING: {
      label: "COMING SOON",
      bg: "bg-amber-500",
      text: "text-primary-foreground",
    },
    CLOSED: {
      label: "CLOSED",
      bg: "bg-muted-foreground",
      text: "text-primary-foreground",
    },
    ARCHIVED: {
      label: "CLOSED",
      bg: "bg-muted-foreground",
      text: "text-primary-foreground",
    },
    CANCELLED: {
      label: "CANCELLED",
      bg: "bg-destructive",
      text: "text-destructive-foreground",
    },
  };

  const c = config[normalized] ?? config.CLOSED;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        c.bg,
        c.text
      )}
    >
      {c.label}
    </span>
  );
}

export function EventOverview({ event, className }: EventOverviewProps) {
  const formatWindow = (start?: string, end?: string) => {
    if (!start || !end) return null;
    return `${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6",
        className
      )}
    >
      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3">
        <Trophy className="h-7 w-7 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          {event.name}
        </h2>
        <StatusBadge status={event.status} />
      </div>

      {/* Tagline */}
      {event.tagline && (
        <p className="mt-2 text-sm font-medium text-foreground">
          {"The search is on for the next big stars!"}
        </p>
      )}

      {/* Description */}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {event.description}
      </p>

      {/* Info Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {event.voting_rules && (
          <InfoItem
            icon={<FileText className="h-4 w-4" />}
            label={event.voting_rules}
          />
        )}
        {event.registration_start && event.registration_end && (
          <InfoItem
            icon={<CheckCircle2 className="h-4 w-4 text-blue-500" />}
            label={`Registration: ${formatWindow(event.registration_start, event.registration_end)}`}
          />
        )}
        {event.voting_start && event.voting_end && (
          <InfoItem
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            label={`Voting: ${formatWindow(event.voting_start, event.voting_end)}`}
          />
        )}
        {event.revenue_share_disclosure && (
          <InfoItem
            icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
            label={event.revenue_share_disclosure}
          />
        )}
        {event.vote_price !== undefined && (
          <InfoItem
            icon={<Coins className="h-4 w-4" />}
            label={`Contestants receive ${event.vote_price ? "50%" : "0%"} of rese...`}
          />
        )}
        {event.organizer_name && (
          <InfoItem
            icon={<Building className="h-4 w-4 text-sky-500" />}
            label={`Organizer: ${event.organizer_name}`}
          />
        )}
        {event.location && (
          <InfoItem
            icon={<MapPin className="h-4 w-4 text-sky-500" />}
            label={`Location: ${event.location}`}
          />
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
