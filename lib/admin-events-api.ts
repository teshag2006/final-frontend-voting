/**
 * Admin Events API Wrapper
 * Centralized API calls for event management
 * Ready for backend integration
 */

import { AdminEvent, CreateEventPayload, UpdateEventPayload, ChangeEventStatusPayload } from '@/types/admin-event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class AdminEventsAPI {
  /**
   * GET /api/v1/admin/events
   * Fetch all events with optional filtering and pagination
   */
  static async getEvents(params?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'name';
  }): Promise<AdminEvent[]> {
    try {
      const queryString = new URLSearchParams();
      if (params?.status) queryString.append('status', params.status);
      if (params?.page) queryString.append('page', String(params.page));
      if (params?.limit) queryString.append('limit', String(params.limit));
      if (params?.sortBy) queryString.append('sortBy', params.sortBy);

      const response = await fetch(`${API_BASE_URL}/admin/events?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * GET /api/v1/admin/events/:id
   * Fetch a single event by ID
   */
  static async getEvent(id: string): Promise<AdminEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  /**
   * POST /api/v1/admin/events
   * Create a new event
   */
  static async createEvent(payload: CreateEventPayload): Promise<AdminEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * PUT /api/v1/admin/events/:id
   * Update event details
   */
  static async updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<AdminEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  }

  /**
   * PATCH /api/v1/admin/events/:id/status
   * Change event status
   */
  static async changeEventStatus(payload: ChangeEventStatusPayload): Promise<AdminEvent> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/events/${payload.eventId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: payload.newStatus, reason: payload.reason }),
        }
      );
      if (!response.ok) throw new Error('Failed to change event status');
      return response.json();
    } catch (error) {
      console.error(`Error changing status for event ${payload.eventId}:`, error);
      throw error;
    }
  }

  /**
   * DELETE /api/v1/admin/events/:id
   * Delete an event (only if no votes exist)
   */
  static async deleteEvent(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  }
}

export default AdminEventsAPI;
