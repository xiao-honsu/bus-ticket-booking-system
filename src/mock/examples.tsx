/**
 * Example: Using Mock Seat Map Data Directly
 *
 * This file demonstrates how to use the mock data in components,
 * tests, or Storybook without API calls.
 */

import { mockSeatMapScenario1, mockSeatMapScenario2, getMockSeatMap, generateSingleDeckSeatMap } from './seatMapData';

// =====================================
// Example 1: Use Pre-configured Scenario
// =====================================

export function ExampleUsingPreconfiguredData() {
  const seatMap = mockSeatMapScenario1;

  console.log('Total seats:', seatMap.totalSeats);
  console.log('Available seats:', seatMap.availableSeats);
  console.log('First seat:', seatMap.seats[0]);

  return (
    <div>
      <h2>Trip: {seatMap.tripId}</h2>
      <p>
        Available: {seatMap.availableSeats} / {seatMap.totalSeats}
      </p>
      <div>
        {seatMap.seats.map((seat) => (
          <button
            key={seat.seatNumber}
            disabled={seat.status !== 'available'}
            style={{
              background:
                seat.status === 'available'
                  ? 'white'
                  : seat.status === 'booked'
                    ? 'red'
                    : seat.status === 'locked'
                      ? 'yellow'
                      : 'orange',
            }}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================
// Example 2: Get by Trip ID
// =====================================

export function ExampleGetByTripId() {
  const tripId = 'trip-002';
  const seatMap = getMockSeatMap(tripId);

  if (!seatMap) {
    return <div>Trip not found</div>;
  }

  return (
    <div>
      <h2>Trip: {tripId}</h2>
      <p>
        {seatMap.layout.type} bus with {seatMap.layout.configuration} layout
      </p>
    </div>
  );
}

// =====================================
// Example 3: Generate Custom Data
// =====================================

export function ExampleGenerateCustomData() {
  const customSeatMap = generateSingleDeckSeatMap(
    'custom-test-trip',
    450000, // base price
    ['A1', 'A2', 'B1'], // booked seats
    ['C1', 'C2'] // locked seats
  );

  return (
    <div>
      <h2>Custom Test Scenario</h2>
      <p>Price: {customSeatMap.seats[0].price.toLocaleString()}₫</p>
      <p>
        Layout: {customSeatMap.layout.rows} rows × {customSeatMap.layout.columns} columns
      </p>
    </div>
  );
}

// =====================================
// Example 4: Use in Tests
// =====================================

describe('SeatMap Component', () => {
  it('should display all seats from mock data', () => {
    const mockData = mockSeatMapScenario1;

    // Use mockData in your test
    expect(mockData.seats).toHaveLength(40);
    expect(mockData.availableSeats).toBe(35); // 40 - 3 booked - 2 locked
  });

  it('should handle booked seats correctly', () => {
    const mockData = mockSeatMapScenario2;
    const bookedSeats = mockData.seats.filter((s) => s.status === 'booked');

    expect(bookedSeats).toHaveLength(20);
  });
});

// =====================================
// Example 5: Storybook Story
// =====================================

export const SeatMapStories = {
  NearlyEmpty: {
    args: {
      seatMapData: mockSeatMapScenario1,
    },
  },
  HalfFull: {
    args: {
      seatMapData: mockSeatMapScenario2,
    },
  },
  AlmostFull: {
    args: {
      seatMapData: getMockSeatMap('trip-003'),
    },
  },
};

// =====================================
// Example 6: Filter and Transform Data
// =====================================

export function ExampleFilterSeats() {
  const seatMap = mockSeatMapScenario1;

  // Get only window seats
  const windowSeats = seatMap.seats.filter((s) => s.position.isWindow);

  // Get available VIP seats
  const vipAvailable = seatMap.seats.filter((s) => s.type === 'vip' && s.status === 'available');

  // Group by status
  const groupedByStatus = seatMap.seats.reduce(
    (acc, seat) => {
      if (!acc[seat.status]) acc[seat.status] = [];
      acc[seat.status].push(seat);
      return acc;
    },
    {} as Record<string, typeof seatMap.seats>
  );

  return {
    windowSeats,
    vipAvailable,
    groupedByStatus,
  };
}

// =====================================
// Example 7: Calculate Statistics
// =====================================

export function calculateSeatStatistics(tripId: string) {
  const seatMap = getMockSeatMap(tripId);
  if (!seatMap) return null;

  return {
    totalSeats: seatMap.totalSeats,
    available: seatMap.availableSeats,
    booked: seatMap.bookedSeats,
    locked: seatMap.lockedSeats,
    occupancyRate: ((seatMap.bookedSeats / seatMap.totalSeats) * 100).toFixed(1) + '%',
    windowSeatsTotal: seatMap.seats.filter((s) => s.position.isWindow).length,
    windowSeatsAvailable: seatMap.seats.filter((s) => s.position.isWindow && s.status === 'available').length,
    averagePrice: (seatMap.seats.reduce((sum, s) => sum + s.price, 0) / seatMap.seats.length).toFixed(0) + '₫',
    priceRange: {
      min: Math.min(...seatMap.seats.map((s) => s.price)).toLocaleString() + '₫',
      max: Math.max(...seatMap.seats.map((s) => s.price)).toLocaleString() + '₫',
    },
  };
}

// Usage
const stats = calculateSeatStatistics('trip-001');
console.log(stats);
// {
//   totalSeats: 40,
//   available: 35,
//   booked: 3,
//   locked: 2,
//   occupancyRate: '7.5%',
//   windowSeatsTotal: 20,
//   windowSeatsAvailable: 18,
//   averagePrice: '550000₫',
//   priceRange: { min: '500,000₫', max: '900,000₫' }
// }
