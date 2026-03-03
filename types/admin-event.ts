export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface AdminEvent {
  id: string;
  name: string;
  description: string;
  status: EventStatus;
  registrationStart?: string;
  registrationEnd?: string;
  votingStart?: string;
  votingEnd?: string;
  startDate: string;
  endDate: string;
  totalVotes: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEventApiResponse {
  id: number | string;
  name?: string;
  description?: string | null;
  status?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  voting_start?: string | null;
  voting_end?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  total_votes?: number | null;
  total_revenue?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateEventPayload {
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  voting_start?: string;
  voting_end?: string;
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  voting_rules?: string;
  is_public?: boolean;
  tenant_id?: number;
  tagline?: string;
  organizer_name?: string;
  vote_price?: number;
  max_votes_per_transaction?: number;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  voting_start?: string;
  voting_end?: string;
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  voting_rules?: string;
  is_public?: boolean;
  tagline?: string;
  organizer_name?: string;
  vote_price?: number;
  max_votes_per_transaction?: number;
}

export interface ChangeEventStatusPayload {
  eventId: string;
  newStatus: EventStatus;
  reason?: string;
}
