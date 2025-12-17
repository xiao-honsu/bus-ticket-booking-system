/**
 * Mock data for seat map testing
 * Based on seat-map API endpoint response structure
 */

export interface MockSeat {
  seatNumber: string;
  row: number;
  column: number;
  deck?: 'upper' | 'lower';
  type: 'standard' | 'vip' | 'sleeper';
  price: number;
  status: 'available' | 'booked' | 'locked' | 'selected';
  position: {
    isWindow: boolean;
    isAisle: boolean;
  };
  lockedUntil?: string;
  lockedBy?: string;
}

export interface MockSeatLayout {
  type: 'single-deck' | 'double-deck';
  rows: number;
  columns: number;
  decks?: ('upper' | 'lower')[];
  configuration: string; // e.g., '2-2' for two seats on each side
}

export interface MockSeatMapResponse {
  tripId: string;
  busId: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  lockedSeats: number;
  layout: MockSeatLayout;
  seats: MockSeat[];
  lastUpdated: string;
}

// Helper function to generate seat pricing
const getSeatPrice = (basePrice: number, type: string, isWindow: boolean): number => {
  let price = basePrice;

  // Type modifiers
  if (type === 'vip') price *= 1.5;
  if (type === 'sleeper') price *= 2;

  // Window seat modifier
  if (isWindow) price *= 1.2;

  return Math.round(price);
};

// Generate single-deck bus (40 seats, 10 rows x 4 columns)
export const generateSingleDeckSeatMap = (
  tripId: string,
  basePrice: number = 500000,
  bookedSeatNumbers: string[] = [],
  lockedSeatNumbers: string[] = []
): MockSeatMapResponse => {
  const seats: MockSeat[] = [];
  const rows = 10;
  const columns = 4;

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${col}`; // A1, A2, B1, B2, etc.
      const isWindow = col === 1 || col === 4;
      const isAisle = col === 2 || col === 3; // col 2 and 3 are aisle seats (sides of the aisle)
      const type = row <= 2 ? 'vip' : 'standard'; // First 2 rows are VIP

      let status: 'available' | 'booked' | 'locked' = 'available';
      let lockedUntil: string | undefined;
      let lockedBy: string | undefined;

      if (bookedSeatNumbers.includes(seatNumber)) {
        status = 'booked';
      } else if (lockedSeatNumbers.includes(seatNumber)) {
        status = 'locked';
        lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
        lockedBy = 'session-xyz-123';
      }

      seats.push({
        seatNumber,
        row,
        column: col,
        type,
        price: getSeatPrice(basePrice, type, isWindow),
        status,
        position: {
          isWindow,
          isAisle,
        },
        lockedUntil,
        lockedBy,
      });
    }
  }

  return {
    tripId,
    busId: 'bus-001',
    totalSeats: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    bookedSeats: seats.filter((s) => s.status === 'booked').length,
    lockedSeats: seats.filter((s) => s.status === 'locked').length,
    layout: {
      type: 'single-deck',
      rows,
      columns,
      configuration: '2-2',
    },
    seats,
    lastUpdated: new Date().toISOString(),
  };
};

// Generate double-deck bus (50 seats - 25 lower, 25 upper)
export const generateDoubleDeckSeatMap = (
  tripId: string,
  basePrice: number = 600000,
  bookedSeatNumbers: string[] = [],
  lockedSeatNumbers: string[] = []
): MockSeatMapResponse => {
  const seats: MockSeat[] = [];
  const rowsPerDeck = 7;
  const columns = 4;
  const decks: ('lower' | 'upper')[] = ['lower', 'upper'];

  decks.forEach((deck, deckIndex) => {
    for (let row = 1; row <= rowsPerDeck; row++) {
      for (let col = 1; col <= columns; col++) {
        const rowLetter = String.fromCharCode(64 + row + deckIndex * rowsPerDeck);
        const seatNumber = `${deck === 'lower' ? 'L' : 'U'}${rowLetter}${col}`; // LA1, LA2, UA1, UA2, etc.
        const isWindow = col === 1 || col === 4;
        const isAisle = col === 2 || col === 3;
        const type = deck === 'upper' && row <= 2 ? 'vip' : 'standard'; // Upper deck first 2 rows are VIP

        let status: 'available' | 'booked' | 'locked' = 'available';
        let lockedUntil: string | undefined;
        let lockedBy: string | undefined;

        if (bookedSeatNumbers.includes(seatNumber)) {
          status = 'booked';
        } else if (lockedSeatNumbers.includes(seatNumber)) {
          status = 'locked';
          lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          lockedBy = 'session-abc-456';
        }

        seats.push({
          seatNumber,
          row,
          column: col,
          deck,
          type,
          price: getSeatPrice(basePrice, type, isWindow),
          status,
          position: {
            isWindow,
            isAisle,
          },
          lockedUntil,
          lockedBy,
        });
      }
    }
  });

  return {
    tripId,
    busId: 'bus-002',
    totalSeats: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    bookedSeats: seats.filter((s) => s.status === 'booked').length,
    lockedSeats: seats.filter((s) => s.status === 'locked').length,
    layout: {
      type: 'double-deck',
      rows: rowsPerDeck,
      columns,
      decks,
      configuration: '2-2',
    },
    seats,
    lastUpdated: new Date().toISOString(),
  };
};

// Generate sleeper bus (30 beds - 15 lower, 15 upper)
export const generateSleeperBusSeatMap = (
  tripId: string,
  basePrice: number = 800000,
  bookedSeatNumbers: string[] = [],
  lockedSeatNumbers: string[] = []
): MockSeatMapResponse => {
  const seats: MockSeat[] = [];
  const rowsPerDeck = 5;
  const columns = 3;
  const decks: ('lower' | 'upper')[] = ['lower', 'upper'];

  decks.forEach((deck, deckIndex) => {
    for (let row = 1; row <= rowsPerDeck; row++) {
      for (let col = 1; col <= columns; col++) {
        const rowLetter = String.fromCharCode(64 + row);
        const seatNumber = `${deck === 'lower' ? 'L' : 'U'}${rowLetter}${col}`;
        const isWindow = col === 1 || col === 3;
        const isAisle = col === 2;
        const type = 'sleeper';

        let status: 'available' | 'booked' | 'locked' = 'available';
        let lockedUntil: string | undefined;
        let lockedBy: string | undefined;

        if (bookedSeatNumbers.includes(seatNumber)) {
          status = 'booked';
        } else if (lockedSeatNumbers.includes(seatNumber)) {
          status = 'locked';
          lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          lockedBy = 'session-def-789';
        }

        seats.push({
          seatNumber,
          row,
          column: col,
          deck,
          type,
          price: getSeatPrice(basePrice, type, isWindow),
          status,
          position: {
            isWindow,
            isAisle,
          },
          lockedUntil,
          lockedBy,
        });
      }
    }
  });

  return {
    tripId,
    busId: 'bus-003',
    totalSeats: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    bookedSeats: seats.filter((s) => s.status === 'booked').length,
    lockedSeats: seats.filter((s) => s.status === 'locked').length,
    layout: {
      type: 'double-deck',
      rows: rowsPerDeck,
      columns,
      decks,
      configuration: '1-1-1',
    },
    seats,
    lastUpdated: new Date().toISOString(),
  };
};

// ========================================
// Pre-configured test scenarios
// ========================================

/**
 * Scenario 1: Nearly empty bus (only 3 seats booked)
 * Good for testing seat selection flow
 */
export const mockSeatMapScenario1 = generateSingleDeckSeatMap(
  'trip-001',
  500000,
  ['A1', 'A4', 'B2'], // 3 booked seats
  ['C1', 'C2'] // 2 locked seats
);

/**
 * Scenario 2: Half-full bus
 * Good for testing availability display
 */
export const mockSeatMapScenario2 = generateSingleDeckSeatMap(
  'trip-002',
  450000,
  [
    'A1',
    'A2',
    'A3',
    'A4',
    'B1',
    'B2',
    'B3',
    'B4',
    'C1',
    'C2',
    'C3',
    'C4',
    'D1',
    'D2',
    'D3',
    'D4',
    'E1',
    'E2',
    'E3',
    'E4',
  ],
  ['F1', 'F2', 'F3']
);

/**
 * Scenario 3: Almost full bus (only 5 seats available)
 * Good for testing scarcity and urgency
 */
export const mockSeatMapScenario3 = generateSingleDeckSeatMap(
  'trip-003',
  550000,
  [
    'A1',
    'A2',
    'A3',
    'A4',
    'B1',
    'B2',
    'B3',
    'B4',
    'C1',
    'C2',
    'C3',
    'C4',
    'D1',
    'D2',
    'D3',
    'D4',
    'E1',
    'E2',
    'E3',
    'E4',
    'F1',
    'F2',
    'F3',
    'F4',
    'G1',
    'G2',
    'G3',
    'G4',
    'H1',
    'H2',
    'H3',
    'H4',
    'I1',
  ],
  ['I2', 'I3']
);

/**
 * Scenario 4: Double-deck bus with mixed availability
 * Good for testing deck-based layout
 */
export const mockSeatMapScenario4 = generateDoubleDeckSeatMap(
  'trip-004',
  600000,
  ['LA1', 'LA2', 'LA3', 'LA4', 'LB1', 'LB2', 'UA1', 'UA2', 'UA3', 'UB1'],
  ['LC1', 'LC2', 'UC1', 'UC2']
);

/**
 * Scenario 5: Sleeper bus
 * Good for testing sleeper-specific UI
 */
export const mockSeatMapScenario5 = generateSleeperBusSeatMap(
  'trip-005',
  800000,
  ['LA1', 'LA2', 'LA3', 'LB1', 'LB2', 'UA1', 'UA2'],
  ['LC1', 'UC1']
);

/**
 * Scenario 6: Empty bus (all seats available)
 * Good for testing initial state and selection
 */
export const mockSeatMapScenario6 = generateSingleDeckSeatMap('trip-006', 500000, [], []);

// Export all scenarios as a map for easy access
export const mockSeatMapScenarios = {
  'trip-001': mockSeatMapScenario1,
  'trip-002': mockSeatMapScenario2,
  'trip-003': mockSeatMapScenario3,
  'trip-004': mockSeatMapScenario4,
  'trip-005': mockSeatMapScenario5,
  'trip-006': mockSeatMapScenario6,
};

// Helper function to get mock seat map by trip ID
export const getMockSeatMap = (tripId: string): MockSeatMapResponse | undefined => {
  return mockSeatMapScenarios[tripId as keyof typeof mockSeatMapScenarios];
};
