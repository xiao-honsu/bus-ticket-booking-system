/**
 * Mock Service Worker (MSW) handlers for seat map API
 * Use this to test seat selection without a backend
 */

import { http, HttpResponse } from 'msw';
import { getMockSeatMap, mockSeatMapScenarios } from './seatMapData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export const seatMapHandlers = [
  // GET /trips/:tripId/seat-map
  http.get(`${API_BASE_URL}/trips/:tripId/seat-map`, ({ params }) => {
    const { tripId } = params;
    const mockData = getMockSeatMap(tripId as string);

    if (!mockData) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Trip not found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockData,
    });
  }),

  // POST /seat-locks/lock
  http.post(`${API_BASE_URL}/seat-locks/lock`, async ({ request }) => {
    const body = (await request.json()) as any;
    const { tripId, seatNumbers, sessionId } = body;

    // Simulate successful lock
    return HttpResponse.json({
      success: true,
      data: {
        tripId,
        sessionId,
        lockedSeats: seatNumbers,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        message: `Successfully locked ${seatNumbers.length} seat(s)`,
      },
    });
  }),

  // POST /seat-locks/release
  http.post(`${API_BASE_URL}/seat-locks/release`, async ({ request }) => {
    const body = (await request.json()) as any;
    const { sessionId } = body;

    return HttpResponse.json({
      success: true,
      data: {
        sessionId,
        message: 'Locks released successfully',
      },
    });
  }),

  // POST /seat-locks/check-availability
  http.post(`${API_BASE_URL}/seat-locks/check-availability`, async ({ request }) => {
    const body = (await request.json()) as any;
    const { tripId, seatNumbers } = body;

    // Mock: all seats are available
    return HttpResponse.json({
      success: true,
      data: {
        available: true,
        unavailableSeats: [],
        message: 'All seats are available',
      },
    });
  }),

  // GET /seat-locks/:tripId
  http.get(`${API_BASE_URL}/seat-locks/:tripId`, ({ params }) => {
    const { tripId } = params;

    return HttpResponse.json({
      success: true,
      data: {
        tripId,
        locks: [],
      },
    });
  }),
];

// Export default for convenience
export default seatMapHandlers;
