/**
 * Mock API Route: GET /api/mock/trips/[tripId]
 *
 * Returns trip information including bus details with totalSeats
 * This matches the data structure used in TripDetailView
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock trip data matching the seat map scenarios
const mockTrips: Record<string, any> = {
  'trip-001': {
    id: 'trip-001',
    _id: 'trip-001',
    tripId: 'TRIP-001',
    departureTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    arrivalTime: new Date(Date.now() + 86400000 + 14400000).toISOString(), // +4 hours
    pricePerSeat: 500000,
    price: 500000,
    availableSeats: 35, // 40 total - 3 booked - 2 locked
    bookedSeats: ['A1', 'A4', 'B2'],
    status: 'scheduled',
    route: {
      id: 'route-001',
      routeName: 'Hanoi - Ho Chi Minh City',
      origin: { city: 'Hanoi', state: 'Hanoi' },
      destination: { city: 'Ho Chi Minh City', state: 'Ho Chi Minh' },
      distance: 1700,
      estimatedDuration: 240, // minutes
    },
    bus: {
      id: 'bus-001',
      busNumber: 'VN-29A-12345',
      busType: 'standard',
      totalSeats: 40,
      amenities: ['WiFi', 'Air Conditioning', 'USB Charging'],
      licensePlate: '29A-12345',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-001',
      companyName: 'Phuong Trang Express',
      rating: {
        overall: 4.5,
        cleanliness: 4.6,
        punctuality: 4.4,
        staff: 4.7,
        comfort: 4.5,
        value: 4.3,
        totalReviews: 1250,
      },
    },
  },
  'trip-002': {
    id: 'trip-002',
    _id: 'trip-002',
    tripId: 'TRIP-002',
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    pricePerSeat: 450000,
    price: 450000,
    availableSeats: 17, // 40 - 20 booked - 3 locked
    bookedSeats: Array.from({ length: 20 }, (_, i) => `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`),
    status: 'scheduled',
    route: {
      id: 'route-002',
      routeName: 'Da Nang - Hue',
      origin: { city: 'Da Nang', state: 'Da Nang' },
      destination: { city: 'Hue', state: 'Thua Thien Hue' },
      distance: 100,
      estimatedDuration: 120,
    },
    bus: {
      id: 'bus-002',
      busNumber: 'VN-43C-54321',
      busType: 'standard',
      totalSeats: 40,
      amenities: ['WiFi', 'Air Conditioning', 'Toilet'],
      licensePlate: '43C-54321',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-002',
      companyName: 'Mai Linh Express',
      rating: {
        overall: 4.2,
        cleanliness: 4.3,
        punctuality: 4.1,
        staff: 4.4,
        comfort: 4.2,
        value: 4.0,
        totalReviews: 890,
      },
    },
  },
  'trip-003': {
    id: 'trip-003',
    _id: 'trip-003',
    tripId: 'TRIP-003',
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    pricePerSeat: 550000,
    price: 550000,
    availableSeats: 5, // Almost full!
    bookedSeats: Array.from({ length: 33 }, (_, i) => `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`),
    status: 'scheduled',
    route: {
      id: 'route-003',
      routeName: 'Hanoi - Haiphong',
      origin: { city: 'Hanoi', state: 'Hanoi' },
      destination: { city: 'Haiphong', state: 'Haiphong' },
      distance: 120,
      estimatedDuration: 150,
    },
    bus: {
      id: 'bus-003',
      busNumber: 'VN-30B-99999',
      busType: 'standard',
      totalSeats: 40,
      amenities: ['WiFi', 'Air Conditioning', 'USB Charging', 'Blankets'],
      licensePlate: '30B-99999',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-003',
      companyName: 'Hoang Long Express',
      rating: {
        overall: 4.8,
        cleanliness: 4.9,
        punctuality: 4.7,
        staff: 4.8,
        comfort: 4.8,
        value: 4.6,
        totalReviews: 2100,
      },
    },
  },
  'trip-004': {
    id: 'trip-004',
    _id: 'trip-004',
    tripId: 'TRIP-004',
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 18000000).toISOString(),
    pricePerSeat: 600000,
    price: 600000,
    availableSeats: 42, // Double-deck: 56 - 10 booked - 4 locked
    bookedSeats: ['LA1', 'LA2', 'LA3', 'LA4', 'LB1', 'LB2', 'UA1', 'UA2', 'UA3', 'UB1'],
    status: 'scheduled',
    route: {
      id: 'route-004',
      routeName: 'Hanoi - Vinh',
      origin: { city: 'Hanoi', state: 'Hanoi' },
      destination: { city: 'Vinh', state: 'Nghe An' },
      distance: 300,
      estimatedDuration: 300,
    },
    bus: {
      id: 'bus-004',
      busNumber: 'VN-51D-77777',
      busType: 'limousine',
      totalSeats: 56, // Double-deck
      amenities: ['WiFi', 'Air Conditioning', 'USB Charging', 'Toilet', 'Entertainment'],
      licensePlate: '51D-77777',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-004',
      companyName: 'Luxury Express',
      rating: {
        overall: 4.7,
        cleanliness: 4.8,
        punctuality: 4.6,
        staff: 4.7,
        comfort: 4.9,
        value: 4.5,
        totalReviews: 1500,
      },
    },
  },
  'trip-005': {
    id: 'trip-005',
    _id: 'trip-005',
    tripId: 'TRIP-005',
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 28800000).toISOString(),
    pricePerSeat: 800000,
    price: 800000,
    availableSeats: 21, // Sleeper: 30 - 7 booked - 2 locked
    bookedSeats: ['LA1', 'LA2', 'LA3', 'LB1', 'LB2', 'UA1', 'UA2'],
    status: 'scheduled',
    route: {
      id: 'route-005',
      routeName: 'Hanoi - Nha Trang',
      origin: { city: 'Hanoi', state: 'Hanoi' },
      destination: { city: 'Nha Trang', state: 'Khanh Hoa' },
      distance: 1280,
      estimatedDuration: 480,
    },
    bus: {
      id: 'bus-005',
      busNumber: 'VN-79S-11111',
      busType: 'sleeper',
      totalSeats: 30, // Sleeper beds
      amenities: ['WiFi', 'Air Conditioning', 'USB Charging', 'Toilet', 'Blankets & Pillows', 'Entertainment'],
      licensePlate: '79S-11111',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-005',
      companyName: 'Premium Sleeper Bus',
      rating: {
        overall: 4.9,
        cleanliness: 5.0,
        punctuality: 4.8,
        staff: 4.9,
        comfort: 5.0,
        value: 4.7,
        totalReviews: 980,
      },
    },
  },
  'trip-006': {
    id: 'trip-006',
    _id: 'trip-006',
    tripId: 'TRIP-006',
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    pricePerSeat: 500000,
    price: 500000,
    availableSeats: 40, // All available!
    bookedSeats: [],
    status: 'scheduled',
    route: {
      id: 'route-006',
      routeName: 'Can Tho - Ho Chi Minh City',
      origin: { city: 'Can Tho', state: 'Can Tho' },
      destination: { city: 'Ho Chi Minh City', state: 'Ho Chi Minh' },
      distance: 170,
      estimatedDuration: 180,
    },
    bus: {
      id: 'bus-006',
      busNumber: 'VN-65F-88888',
      busType: 'standard',
      totalSeats: 40,
      amenities: ['WiFi', 'Air Conditioning', 'USB Charging'],
      licensePlate: '65F-88888',
      images: ['/placeholder-bus.jpg'],
    },
    operator: {
      id: 'op-006',
      companyName: 'Mekong Express',
      rating: {
        overall: 4.4,
        cleanliness: 4.5,
        punctuality: 4.3,
        staff: 4.6,
        comfort: 4.4,
        value: 4.2,
        totalReviews: 750,
      },
    },
  },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = mockTrips[tripId];

  if (!trip) {
    return NextResponse.json(
      {
        success: false,
        message: `Trip ${tripId} not found. Available test trips: trip-001 to trip-006`,
      },
      { status: 404 }
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(trip);
}
