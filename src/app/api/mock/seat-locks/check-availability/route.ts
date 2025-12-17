/**
 * Mock API Route: POST /api/mock/seat-locks/check-availability
 *
 * Simulates checking seat availability for testing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tripId, seatNumbers } = body;

  if (!tripId || !seatNumbers) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing required fields: tripId, seatNumbers',
      },
      { status: 400 }
    );
  }

  // Mock: all seats are available
  return NextResponse.json({
    success: true,
    data: {
      available: true,
      unavailableSeats: [],
      message: 'All seats are available',
    },
  });
}
