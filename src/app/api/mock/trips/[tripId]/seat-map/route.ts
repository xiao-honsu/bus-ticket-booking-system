/**
 * Mock API Route: GET /api/mock/trips/[tripId]/seat-map
 *
 * This Next.js API route serves mock seat map data for testing.
 * No additional dependencies required!
 *
 * Usage: Set NEXT_PUBLIC_API_BASE_URL=/api/mock in .env.local
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMockSeatMap } from '@/mock/seatMapData';

export async function GET(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const mockData = getMockSeatMap(tripId);

  if (!mockData) {
    return NextResponse.json(
      {
        success: false,
        message: `Trip ${tripId} not found. Available test trips: trip-001 to trip-006`,
      },
      { status: 404 }
    );
  }

  // Simulate network delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    success: true,
    data: mockData,
  });
}
