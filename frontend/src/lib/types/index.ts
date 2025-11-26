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

// Passenger types
export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
  seatPrice: number;
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
export interface RouteStop {
  name: string;
  sequence: number;
  arrivalOffset: number;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
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
  basePrice: number;
  availableSeats: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
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

export interface CreateBookingRequest {
  tripId: string;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  paymentMethod: 'momo' | 'zalopay' | 'payos' | 'card' | 'bank_transfer';
}

export interface ApiError {
  code: number;
  message: string;
}
