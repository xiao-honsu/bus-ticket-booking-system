/**
 * Mock API Route: POST /api/mock/seat-locks/release
 *
 * Simulates releasing seat locks for testing
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing required field: sessionId',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      sessionId,
      message: 'Locks released successfully',
    },
  });
}
