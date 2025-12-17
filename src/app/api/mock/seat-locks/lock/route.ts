/**
 * Mock API Route: POST /api/mock/seat-locks/lock
 *
 * Simulates seat locking for testing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tripId, seatNumbers, sessionId } = body;

  if (!tripId || !seatNumbers || !sessionId) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing required fields: tripId, seatNumbers, sessionId',
      },
      { status: 400 }
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({
    success: true,
    data: {
      tripId,
      sessionId,
      lockedSeats: seatNumbers,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      message: `Successfully locked ${seatNumbers.length} seat(s)`,
    },
  });
}
