/**
 * Socket.IO Event Types for Real-time Seat Reservation
 * Backend: ws://localhost:4000
 */

// ============================================
// Client → Server Events
// ============================================

export interface JoinTripPayload {
  tripId: string;
  sessionId?: string;
}

export interface JoinTripResponse {
  success: boolean;
  tripId: string;
  message?: string;
  currentStatus?: {
    availableSeats: number;
    lockedSeats: number;
    bookedSeats: number;
  };
}

export interface LeaveTripPayload {
  tripId: string;
}

export interface LeaveTripResponse {
  success: boolean;
}

export interface PingResponse {
  timestamp: string;
}

// ============================================
// Server → Client Events
// ============================================

export interface SocketSeatLockedEvent {
  tripId: string;
  seatNumbers: string[];
  sessionId: string;
  userId?: string;
  expiresAt: string; // ISO date
  lockedBy: 'guest' | 'user';
  timestamp: string;
}

export interface SocketSeatReleasedEvent {
  tripId: string;
  seatNumbers: string[];
  sessionId: string;
  reason: 'manual' | 'expired' | 'booked';
  timestamp: string;
}

export interface SocketSeatBookedEvent {
  tripId: string;
  seatNumbers: string[];
  bookingId: string;
  timestamp: string;
}

export interface SocketConnectedEvent {
  socketId: string;
  serverTime: string;
  message?: string;
}

export interface SocketErrorEvent {
  message: string;
  code?: string;
  timestamp: string;
}

// ============================================
// Socket Event Names (Constants)
// ============================================

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_TRIP: 'joinTrip',
  LEAVE_TRIP: 'leaveTrip',
  PING: 'ping',

  // Server → Client
  SEAT_LOCKED: 'seatLocked',
  SEAT_RELEASED: 'seatReleased',
  SEAT_BOOKED: 'seatBooked',
  CONNECTED: 'connected',
  ERROR: 'error',

  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
} as const;

// ============================================
// Type Guards
// ============================================

export function isSeatLockedEvent(data: unknown): data is SocketSeatLockedEvent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'tripId' in data &&
    'seatNumbers' in data &&
    'sessionId' in data &&
    'expiresAt' in data
  );
}

export function isSeatReleasedEvent(data: unknown): data is SocketSeatReleasedEvent {
  return typeof data === 'object' && data !== null && 'tripId' in data && 'seatNumbers' in data && 'reason' in data;
}

export function isSeatBookedEvent(data: unknown): data is SocketSeatBookedEvent {
  return typeof data === 'object' && data !== null && 'tripId' in data && 'seatNumbers' in data && 'bookingId' in data;
}
