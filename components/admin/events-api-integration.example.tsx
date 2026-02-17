/**
 * EXAMPLE: API Integration for Admin Events Page
 * 
 * This file shows how to replace mock data with real API calls.
 * Copy the patterns below and integrate with your backend.
 * 
 * API Endpoints needed:
 * - GET /api/v1/admin/events
 * - POST /api/v1/admin/events
 * - PUT /api/v1/admin/events/:id
 * - PATCH /api/v1/admin/events/:id/status
 * - DELETE /api/v1/admin/events/:id
 */

// ============================================================================
// OPTION 1: Using fetch() - Simple Implementation
// ============================================================================

export async function fetchEventsAPI() {
  try {
    const response = await fetch('/api/v1/admin/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // If needed
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
}

export async function createEventAPI(data: any) {
  try {
    const response = await fetch('/api/v1/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
}

export async function updateEventAPI(id: string, data: any) {
  try {
    const response = await fetch(`/api/v1/admin/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update event:', error);
    throw error;
  }
}

export async function changeEventStatusAPI(id: string, status: string) {
  try {
    const response = await fetch(`/api/v1/admin/events/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to change event status:', error);
    throw error;
  }
}

export async function deleteEventAPI(id: string) {
  try {
    const response = await fetch(`/api/v1/admin/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
}

// ============================================================================
// OPTION 2: Using SWR - Better for Client Components
// ============================================================================

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('API error');
    return res.json();
  });

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/admin/events',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    events: data?.data || [],
    isLoading,
    error,
    mutate, // Use to refresh data
  };
}

// ============================================================================
// OPTION 3: Integration in Main Page Component
// ============================================================================

/**
 * Replace the useEffect in /app/admin/events/page.tsx:
 * 
 * FROM:
 *   useEffect(() => {
 *     setTimeout(() => {
 *       setEvents(generateMockEvents());
 *       setIsTableLoading(false);
 *     }, 500);
 *   }, []);
 * 
 * TO:
 *   useEffect(() => {
 *     loadEvents();
 *   }, []);
 * 
 *   const loadEvents = async () => {
 *     try {
 *       const data = await fetchEventsAPI();
 *       setEvents(data.events || []);
 *     } catch (error) {
 *       console.error('Failed to load events:', error);
 *       // Show toast error notification
 *     } finally {
 *       setIsTableLoading(false);
 *     }
 *   };
 */

/**
 * Replace handleModalSubmit in /app/admin/events/page.tsx:
 * 
 * FROM:
 *   const handleModalSubmit = async (data: EventFormData) => {
 *     setIsLoading(true);
 *     await new Promise((resolve) => setTimeout(resolve, 800));
 *     // Local state update...
 *   };
 * 
 * TO:
 *   const handleModalSubmit = async (data: EventFormData) => {
 *     setIsLoading(true);
 *     try {
 *       if (selectedEvent) {
 *         const result = await updateEventAPI(selectedEvent.id, data);
 *         setEvents((prev) =>
 *           prev.map((e) =>
 *             e.id === selectedEvent.id
 *               ? { ...e, ...result.event }
 *               : e
 *           )
 *         );
 *       } else {
 *         const result = await createEventAPI(data);
 *         setEvents((prev) => [result.event, ...prev]);
 *       }
 *       setIsModalOpen(false);
 *     } catch (error) {
 *       console.error('Failed to save event:', error);
 *       // Show toast error notification
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 */

/**
 * Replace handleDeleteEvent in /app/admin/events/page.tsx:
 * 
 * FROM:
 *   const handleDeleteEvent = (event: EventData) => {
 *     if (confirm(`Are you sure...`)) {
 *       setEvents((prev) => prev.filter((e) => e.id !== event.id));
 *     }
 *   };
 * 
 * TO:
 *   const handleDeleteEvent = async (event: EventData) => {
 *     if (confirm(`Are you sure...`)) {
 *       try {
 *         await deleteEventAPI(event.id);
 *         setEvents((prev) => prev.filter((e) => e.id !== event.id));
 *       } catch (error) {
 *         console.error('Failed to delete event:', error);
 *         // Show toast error notification
 *       }
 *     }
 *   };
 */

/**
 * Replace handleChangeStatus in /app/admin/events/page.tsx:
 * 
 * FROM:
 *   const handleChangeStatus = (event: EventData, newStatus: string) => {
 *     if (newStatus === 'CLOSED' && !confirm(...)) return;
 *     setEvents((prev) =>
 *       prev.map((e) => e.id === event.id ? {...e, status: newStatus} : e)
 *     );
 *   };
 * 
 * TO:
 *   const handleChangeStatus = async (event: EventData, newStatus: string) => {
 *     if (newStatus === 'CLOSED' && !confirm(...)) return;
 *     try {
 *       await changeEventStatusAPI(event.id, newStatus);
 *       setEvents((prev) =>
 *         prev.map((e) =>
 *           e.id === event.id ? {...e, status: newStatus as any} : e
 *         )
 *       );
 *     } catch (error) {
 *       console.error('Failed to change status:', error);
 *       // Show toast error notification
 *     }
 *   };
 */

// ============================================================================
// OPTION 4: Error Handling with Toast Notifications
// ============================================================================

/**
 * Add this to your handleModalSubmit function:
 * 
 *   import { useToast } from '@/hooks/use-toast';
 *   const { toast } = useToast();
 * 
 *   const handleModalSubmit = async (data: EventFormData) => {
 *     setIsLoading(true);
 *     try {
 *       const result = selectedEvent
 *         ? await updateEventAPI(selectedEvent.id, data)
 *         : await createEventAPI(data);
 *       
 *       // Update local state...
 *       
 *       toast({
 *         title: 'Success',
 *         description: selectedEvent
 *           ? 'Event updated successfully'
 *           : 'Event created successfully',
 *       });
 *       setIsModalOpen(false);
 *     } catch (error) {
 *       toast({
 *         title: 'Error',
 *         description: error instanceof Error ? error.message : 'Something went wrong',
 *         variant: 'destructive',
 *       });
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 */

// ============================================================================
// Expected API Response Format
// ============================================================================

/**
 * GET /api/v1/admin/events
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "events": [
 *       {
 *         "id": "1",
 *         "name": "Event Name",
 *         "description": "Description",
 *         "status": "ACTIVE",
 *         "startDate": "2024-04-15",
 *         "endDate": "2024-05-25",
 *         "totalVotes": 6230,
 *         "totalRevenue": 15575,
 *         "createdAt": "2024-03-10T14:52:00Z"
 *       }
 *     ]
 *   }
 * }
 * 
 * POST /api/v1/admin/events
 * Request:
 * {
 *   "name": "New Event",
 *   "description": "Description",
 *   "startDate": "2024-04-15",
 *   "endDate": "2024-05-25",
 *   "status": "UPCOMING"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "event": { ...event object... }
 *   }
 * }
 * 
 * PUT /api/v1/admin/events/:id
 * Request: Same as POST
 * Response: Same as POST
 * 
 * PATCH /api/v1/admin/events/:id/status
 * Request: { "status": "CLOSED" }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "event": { ...event object with new status... }
 *   }
 * }
 * 
 * DELETE /api/v1/admin/events/:id
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Event deleted successfully"
 *   }
 * }
 */

// ============================================================================
// Testing the Integration
// ============================================================================

/**
 * Test with curl:
 * 
 * GET events:
 * curl -X GET http://localhost:3000/api/v1/admin/events
 * 
 * Create event:
 * curl -X POST http://localhost:3000/api/v1/admin/events \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Test","startDate":"2024-04-15","endDate":"2024-05-25"}'
 * 
 * Update event:
 * curl -X PUT http://localhost:3000/api/v1/admin/events/1 \
 *   -H "Content-Type: application/json" \
 *   -d '{"name":"Updated","startDate":"2024-04-15","endDate":"2024-05-25"}'
 * 
 * Change status:
 * curl -X PATCH http://localhost:3000/api/v1/admin/events/1/status \
 *   -H "Content-Type: application/json" \
 *   -d '{"status":"CLOSED"}'
 * 
 * Delete event:
 * curl -X DELETE http://localhost:3000/api/v1/admin/events/1
 */
