import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber: string;
  documentId?: string;
  phoneNumber?: string;
}

interface PaymentInfo {
  method?: 'momo' | 'zalopay' | 'payos' | 'card' | 'bank_transfer';
  amount: number;
}

interface PromotionInfo {
  userPromotionId: string; // ID of UserPromotion from validate API
  promotionId: string; // ID of Promotion
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

interface SeatDetail {
  seatNumber: string;
  price: number;
  seatType: string;
  position?: {
    isWindow: boolean;
    isAisle: boolean;
  };
}

interface BookingState {
  tripId: string | null;
  selectedSeats: string[];
  passengers: Passenger[];
  payment: PaymentInfo | null;
  contactInfo: {
    email: string;
    phone: string;
  } | null;
  currentStep: 'seat-selection' | 'passenger-details' | 'payment' | 'confirmation';
  sessionId: string | null;
  lockExpiresAt: string | null;
  promotion: PromotionInfo | null;
}

const initialState: BookingState = {
  tripId: null,
  selectedSeats: [],
  passengers: [],
  payment: null,
  contactInfo: null,
  currentStep: 'seat-selection',
  sessionId: null,
  lockExpiresAt: null,
  promotion: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setTripId: (state, action: PayloadAction<string>) => {
      state.tripId = action.payload;
    },
    toggleSeat: (state, action: PayloadAction<string>) => {
      const seatNumber = action.payload;
      const index = state.selectedSeats.indexOf(seatNumber);

      if (index > -1) {
        state.selectedSeats.splice(index, 1);
        state.passengers = state.passengers.filter((p) => p.seatNumber !== seatNumber);
      } else {
        state.selectedSeats.push(seatNumber);
      }
    },
    setSelectedSeats: (state, action: PayloadAction<string[]>) => {
      state.selectedSeats = action.payload;
    },
    addPassenger: (state, action: PayloadAction<Passenger>) => {
      state.passengers.push(action.payload);
    },
    updatePassenger: (state, action: PayloadAction<{ index: number; passenger: Passenger }>) => {
      state.passengers[action.payload.index] = action.payload.passenger;
    },
    removePassenger: (state, action: PayloadAction<number>) => {
      state.passengers.splice(action.payload, 1);
    },
    setPassengers: (state, action: PayloadAction<Passenger[]>) => {
      state.passengers = action.payload;
    },
    setPayment: (state, action: PayloadAction<PaymentInfo>) => {
      state.payment = action.payload;
    },
    setContactInfo: (state, action: PayloadAction<{ email: string; phone: string }>) => {
      state.contactInfo = action.payload;
    },
    setCurrentStep: (
      state,
      action: PayloadAction<'seat-selection' | 'passenger-details' | 'payment' | 'confirmation'>
    ) => {
      state.currentStep = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setLockExpiresAt: (state, action: PayloadAction<string | null>) => {
      state.lockExpiresAt = action.payload;
    },
    setPromotion: (state, action: PayloadAction<PromotionInfo | null>) => {
      state.promotion = action.payload;
    },
    resetBooking: () => {
      return initialState;
    },
  },
});

export const {
  setTripId,
  toggleSeat,
  setSelectedSeats,
  addPassenger,
  updatePassenger,
  removePassenger,
  setPassengers,
  setPayment,
  setContactInfo,
  setCurrentStep,
  setSessionId,
  setLockExpiresAt,
  setPromotion,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
