import bookingReducer, {
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
  resetBooking,
} from '@/lib/store/features/booking/bookingSlice';

describe('bookingSlice', () => {
  const initialState = {
    tripId: null,
    selectedSeats: [],
    passengers: [],
    payment: null,
    contactInfo: null,
    currentStep: 'seat-selection' as const,
  };

  it('should return the initial state', () => {
    expect(bookingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setTripId', () => {
    it('should set trip ID', () => {
      const action = setTripId('trip-123');
      const newState = bookingReducer(initialState, action);

      expect(newState.tripId).toBe('trip-123');
    });
  });

  describe('toggleSeat', () => {
    it('should add seat when not selected', () => {
      const action = toggleSeat('A1');
      const newState = bookingReducer(initialState, action);

      expect(newState.selectedSeats).toContain('A1');
    });

    it('should remove seat when already selected', () => {
      const stateWithSeat = { ...initialState, selectedSeats: ['A1'] };
      const action = toggleSeat('A1');
      const newState = bookingReducer(stateWithSeat, action);

      expect(newState.selectedSeats).not.toContain('A1');
    });

    it('should remove associated passenger when seat is deselected', () => {
      const stateWithSeatAndPassenger = {
        ...initialState,
        selectedSeats: ['A1'],
        passengers: [
          { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
        ],
      };

      const action = toggleSeat('A1');
      const newState = bookingReducer(stateWithSeatAndPassenger, action);

      expect(newState.passengers).toHaveLength(0);
    });
  });

  describe('setSelectedSeats', () => {
    it('should set multiple seats', () => {
      const action = setSelectedSeats(['A1', 'A2', 'B3']);
      const newState = bookingReducer(initialState, action);

      expect(newState.selectedSeats).toEqual(['A1', 'A2', 'B3']);
    });
  });

  describe('addPassenger', () => {
    it('should add a new passenger', () => {
      const passenger = {
        name: 'John Doe',
        age: 30,
        gender: 'male' as const,
        seatNumber: 'A1',
      };

      const action = addPassenger(passenger);
      const newState = bookingReducer(initialState, action);

      expect(newState.passengers).toHaveLength(1);
      expect(newState.passengers[0]).toEqual(passenger);
    });
  });

  describe('updatePassenger', () => {
    it('should update passenger at specific index', () => {
      const stateWithPassenger = {
        ...initialState,
        passengers: [
          { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
        ],
      };

      const updatedPassenger = {
        name: 'Jane Doe',
        age: 25,
        gender: 'female' as const,
        seatNumber: 'A2',
      };

      const action = updatePassenger({ index: 0, passenger: updatedPassenger });
      const newState = bookingReducer(stateWithPassenger, action);

      expect(newState.passengers[0]).toEqual(updatedPassenger);
    });
  });

  describe('removePassenger', () => {
    it('should remove passenger at specific index', () => {
      const stateWithPassengers = {
        ...initialState,
        passengers: [
          { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
          { name: 'Jane', age: 25, gender: 'female' as const, seatNumber: 'A2' },
        ],
      };

      const action = removePassenger(0);
      const newState = bookingReducer(stateWithPassengers, action);

      expect(newState.passengers).toHaveLength(1);
      expect(newState.passengers[0].name).toBe('Jane');
    });
  });

  describe('setPayment', () => {
    it('should set payment information', () => {
      const payment = { method: 'momo' as const, amount: 100 };
      const action = setPayment(payment);
      const newState = bookingReducer(initialState, action);

      expect(newState.payment).toEqual(payment);
    });
  });

  describe('setContactInfo', () => {
    it('should set contact information', () => {
      const contactInfo = {
        email: 'john@example.com',
        phone: '0123456789',
      };

      const action = setContactInfo(contactInfo);
      const newState = bookingReducer(initialState, action);

      expect(newState.contactInfo).toEqual(contactInfo);
    });
  });

  describe('setCurrentStep', () => {
    it('should update current booking step', () => {
      const action = setCurrentStep('payment');
      const newState = bookingReducer(initialState, action);

      expect(newState.currentStep).toBe('payment');
    });
  });

  describe('resetBooking', () => {
    it('should reset all booking state to initial', () => {
      const filledState = {
        tripId: 'trip-123',
        selectedSeats: ['A1', 'A2'],
        passengers: [
          { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
        ],
        payment: { method: 'momo' as const, amount: 100 },
        contactInfo: { email: 'test@test.com', phone: '123' },
        currentStep: 'payment' as const,
      };

      const action = resetBooking();
      const newState = bookingReducer(filledState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('setPassengers', () => {
    it('should set multiple passengers at once', () => {
      const passengers = [
        { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
        { name: 'Jane', age: 25, gender: 'female' as const, seatNumber: 'A2' },
      ];

      const action = setPassengers(passengers);
      const newState = bookingReducer(initialState, action);

      expect(newState.passengers).toEqual(passengers);
    });

    it('should replace existing passengers', () => {
      const initialPassengers = [
        { name: 'Old', age: 40, gender: 'male' as const, seatNumber: 'B1' },
      ];

      const newPassengers = [
        { name: 'John', age: 30, gender: 'male' as const, seatNumber: 'A1' },
        { name: 'Jane', age: 25, gender: 'female' as const, seatNumber: 'A2' },
      ];

      let newState = bookingReducer(initialState, setPassengers(initialPassengers));
      newState = bookingReducer(newState, setPassengers(newPassengers));

      expect(newState.passengers).toEqual(newPassengers);
    });
  });

  describe('Edge cases', () => {
    it('should handle toggling same seat multiple times', () => {
      let newState = bookingReducer(initialState, toggleSeat('A1'));
      expect(newState.selectedSeats).toContain('A1');

      newState = bookingReducer(newState, toggleSeat('A1'));
      expect(newState.selectedSeats).not.toContain('A1');

      newState = bookingReducer(newState, toggleSeat('A1'));
      expect(newState.selectedSeats).toContain('A1');
    });

    it('should handle empty passenger list', () => {
      const action = setPassengers([]);
      const newState = bookingReducer(initialState, action);

      expect(newState.passengers).toEqual([]);
    });

    it('should handle removing passenger from empty list', () => {
      const action = removePassenger(0);
      const newState = bookingReducer(initialState, action);

      expect(newState.passengers).toEqual([]);
    });

    it('should update payment method multiple times', () => {
      let newState = bookingReducer(initialState, setPayment({ method: 'momo', amount: 100 }));
      expect(newState.payment?.method).toBe('momo');

      newState = bookingReducer(newState, setPayment({ method: 'zalopay', amount: 150 }));
      expect(newState.payment?.method).toBe('zalopay');
      expect(newState.payment?.amount).toBe(150);
    });
  });

  describe('Complete booking flow', () => {
    it('should handle full booking process', () => {
      // Step 1: Set trip ID
      let newState = bookingReducer(initialState, setTripId('trip-123'));
      expect(newState.tripId).toBe('trip-123');

      // Step 2: Select seats
      newState = bookingReducer(newState, toggleSeat('A1'));
      newState = bookingReducer(newState, toggleSeat('A2'));
      expect(newState.selectedSeats).toEqual(['A1', 'A2']);

      // Step 3: Add passengers
      newState = bookingReducer(newState, addPassenger({
        name: 'John',
        age: 30,
        gender: 'male',
        seatNumber: 'A1',
      }));
      newState = bookingReducer(newState, addPassenger({
        name: 'Jane',
        age: 25,
        gender: 'female',
        seatNumber: 'A2',
      }));
      expect(newState.passengers).toHaveLength(2);

      // Step 4: Set contact info
      newState = bookingReducer(newState, setContactInfo({
        email: 'john@example.com',
        phone: '0123456789',
      }));
      expect(newState.contactInfo?.email).toBe('john@example.com');

      // Step 5: Set payment
      newState = bookingReducer(newState, setPayment({
        method: 'momo',
        amount: 200000,
      }));
      expect(newState.payment?.amount).toBe(200000);

      // Step 6: Update step
      newState = bookingReducer(newState, setCurrentStep('payment'));
      expect(newState.currentStep).toBe('payment');

      // Verify final state
      expect(newState.tripId).toBe('trip-123');
      expect(newState.selectedSeats).toHaveLength(2);
      expect(newState.passengers).toHaveLength(2);
      expect(newState.contactInfo).toBeTruthy();
      expect(newState.payment).toBeTruthy();

      // Step 7: Reset after booking
      newState = bookingReducer(newState, resetBooking());
      expect(newState).toEqual(initialState);
    });

    it('should handle seat deselection with passenger removal', () => {
      // Add seats and passengers
      let newState = bookingReducer(initialState, toggleSeat('A1'));
      newState = bookingReducer(newState, toggleSeat('A2'));
      newState = bookingReducer(newState, addPassenger({
        name: 'John',
        age: 30,
        gender: 'male',
        seatNumber: 'A1',
      }));
      newState = bookingReducer(newState, addPassenger({
        name: 'Jane',
        age: 25,
        gender: 'female',
        seatNumber: 'A2',
      }));

      expect(newState.selectedSeats).toHaveLength(2);
      expect(newState.passengers).toHaveLength(2);

      // Deselect one seat
      newState = bookingReducer(newState, toggleSeat('A1'));
      expect(newState.selectedSeats).toEqual(['A2']);
      expect(newState.passengers).toHaveLength(1);
      expect(newState.passengers[0].seatNumber).toBe('A2');
    });
  });
});
