// User types
export interface IOAuthProvider {
  provider: 'google' | 'facebook';
  providerId: string;
  providerData?: any;
  connectedAt: Date;
}

export interface INotificationPreferences {
  email: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
    promotional: boolean;
  };
  sms: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
  };
  push: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
  };
}

export interface IUserStats {
  totalBookings: number;
  completedTrips: number;
  cancelledBookings: number;
  totalSpent: number;
}

// Full User interface - from API responses
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'operator';
  phone?: string;
  isEmailVerified: boolean;
  profilePictureUrl?: string;
  status: 'active' | 'suspended' | 'deleted';
  failedLoginAttempts: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  oauthProviders: IOAuthProvider[];
  notificationPreferences: INotificationPreferences;
  stats: IUserStats;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Partial User interface - for SSR state (only id and role available from JWT)
// Used during initial SSR before full user data is fetched
export interface PartialUser {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

// Passenger types
export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
  seatPrice?: number; // Optional to match backend
  documentId?: string;
  phoneNumber?: string;
}

// Payment types
export interface Payment {
  paymentReference?: string;
  method?: 'momo' | 'zalopay' | 'payos' | 'card' | 'bank_transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayResponse?: any;
  paidAt?: Date;
}

// Booking types
export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  tripId: string;
  passengers: Passenger[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment: Payment;
  contactEmail: string;
  contactPhone: string;
  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Route types
export interface Location {
  city: string;
  state: string;
  landmark?: string;
  coordinates?: [number, number];
  stopOrder?: number;
  minutesFromStart?: number;
  stopType?: 'pickup' | 'dropoff' | 'both';
}

export interface RouteStop {
  name: string;
  sequence: number;
  arrivalOffset: number;
}

export interface Route {
  id: string;
  name: string;
  origin: Location;
  destination: Location;
  distance: number;
  estimatedDuration: number;
  stops: RouteStop[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bus types
export interface BusSeat {
  seatNumber: string;
  row: number;
  column: number;
  deck?: 'upper' | 'lower';
  type: 'standard' | 'vip' | 'sleeper';
  isAvailable: boolean;
}

export interface Bus {
  id: string;
  plateNumber: string;
  busType: 'standard' | 'deluxe' | 'sleeper' | 'limousine';
  seatCapacity: number;
  seatLayout: BusSeat[];
  amenities: string[];
  operatorId: string;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Trip types
export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  operatorId: string;
  departureTime: Date;
  arrivalTime: Date;
  pricePerSeat: number; // Match backend field name
  seatPricing?: Record<string, number>; // Optional seat-specific pricing
  availableSeats: number;
  bookedSeats?: string[];
  seatStatus?: Record<string, 'available' | 'booked' | 'locked'>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  route?: Route;
  bus?: Bus;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

export interface SearchTripsRequest {
  origin?: string;
  destination?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Booking types - Payment Info
export interface PaymentInfo {
  paymentReference?: string;
  method?: 'momo' | 'zalopay' | 'payos' | 'card' | 'bank_transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayResponse?: any;
  paidAt?: Date;
}

export interface Booking {
  id: string;
  referenceNumber: string;
  user?: string;
  trip: string | Trip;
  guestEmail?: string;
  guestPhone?: string;
  passengers: Passenger[];
  totalPassengers: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  expiresAt?: Date;
  confirmedAt?: Date;
  contactPhone: string;
  contactEmail: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  payment: PaymentInfo;
  createdAt: Date;
  updatedAt: Date;
}

// Create Booking Request (what frontend sends to backend)
// MUST match backend validation schema exactly
export interface CreateBookingRequest {
  trip: string; // Backend expects 'trip', not 'tripId'
  passengers: Array<{
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    seatNumber: string;
    // Note: Only these 4 fields are allowed by backend validation
    // documentId, phoneNumber, seatPrice are NOT in validation schema
  }>;
  contactEmail: string;
  contactPhone: string;
  totalAmount: number;
  // TODO: Backend needs to be updated to accept these fields:
  // sessionId?: string; // For seat lock verification
  // userPromotion?: string; // Optional UserPromotion ID from validate API
}

// Create Booking Response (what backend returns)
export interface CreateBookingResponse {
  id: string;
  referenceNumber: string;
  trip: string;
  passengers: Passenger[];
  totalPassengers: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  contactPhone: string;
  contactEmail: string;
  payment: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

// Guest Booking Request (no authentication)
export interface CreateGuestBookingRequest {
  trip: string;
  guestEmail: string;
  guestPhone: string;
  passengers: Passenger[];
  contactPhone: string;
  contactEmail: string;
  totalAmount: number;
  sessionId?: string;
}

export interface ApiError {
  code: number;
  message: string;
}

export interface ApiSuccessResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  code?: number;
  message?: string;
  data?: any;
}
