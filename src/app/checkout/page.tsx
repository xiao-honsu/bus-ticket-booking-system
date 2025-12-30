'use client';

import { BookingSummary, PaymentMethods, PassengerDetails } from '@/containers/checkout-page';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCreateBookingMutation, useGetTripQuery } from '@/lib/store/services/api';
import { resetBooking, setPayment } from '@/lib/store/features/booking/bookingSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import SeatLockTimer from '@/components/SeatLockTimer';
import { createPaymentLink } from '@/lib/services/payment.service';
import type { CreateBookingRequest } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const selectedSeatDetails = useAppSelector((state) => state.booking.selectedSeatDetails);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const payment = useAppSelector((state) => state.booking.payment);
  const contactInfo = useAppSelector((state) => state.booking.contactInfo);
  const sessionId = useAppSelector((state) => state.booking.sessionId);
  const promotion = useAppSelector((state) => state.booking.promotion);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: trip } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

  // Calculate total amount from actual seat prices
  const totalAmount = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);

  // Set PayOS as default payment method
  useEffect(() => {
    if (!payment?.method) {
      dispatch(
        setPayment({
          method: 'payos',
          amount: 0,
        })
      );
    }
  }, [payment, dispatch]);

  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();

  // Redirect if no trip selected
  useEffect(() => {
    if (!tripId || selectedSeats.length === 0) {
      toast.error('No booking data found. Please start a new booking.');
      router.push('/search');
    }
  }, [tripId, selectedSeats, router]);

  const handleCompletePayment = async () => {
    // Validation
    if (!contactInfo?.email || !contactInfo?.phone) {
      toast.error('Please provide contact information');
      return;
    }

    if (passengers.length !== selectedSeats.length) {
      toast.error('Please provide passenger details for all seats');
      return;
    }

    if (!trip) {
      toast.error('Trip information not available');
      return;
    }

    setIsProcessing(true);

    try {
      // Ensure tripId is not null
      if (!tripId) {
        toast.error('Trip ID is missing');
        return;
      }

      // Validate total amount from selected seat details
      if (selectedSeatDetails.length === 0) {
        toast.error('No seat information available');
        return;
      }

      const totalAmount = pricePerSeat * selectedSeats.length;
      const discountAmount = promotion?.discountAmount || 0;
      const finalAmount = totalAmount - discountAmount;

      // Validate totalAmount is a valid number
      if (isNaN(finalAmount) || finalAmount <= 0) {
        toast.error('Invalid total amount calculated');
        console.error('Invalid finalAmount:', {
          pricePerSeat,
          selectedSeats,
          totalAmount,
          discountAmount,
          finalAmount,
        });
        return;
      }

      // Prepare booking data matching backend validation schema
      const bookingData: CreateBookingRequest = {
        trip: tripId, // Backend expects 'trip', not 'tripId'
        passengers: passengers.map((p) => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: p.seatNumber,
          // Note: Backend validation only accepts name, age, gender, seatNumber
          // documentId, phoneNumber, seatPrice are handled by backend service
        })),
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        totalAmount: finalAmount,
        // TODO: Backend needs to accept userPromotion and sessionId
        // userPromotion: promotion?.userPromotionId,
        // sessionId: sessionId || undefined,
      };

      console.log('Creating booking with data:', bookingData);

      // Step 1: Create booking
      const bookingResult = await createBooking(bookingData).unwrap();

      console.log('Booking result:', bookingResult);

      // Validate booking result
      if (!bookingResult || !bookingResult.id) {
        console.error('Invalid booking result:', bookingResult);
        throw new Error('Invalid booking response from server');
      }

      toast.success('Booking created successfully!');

      // Step 2: Create payment link with PayOS
      // Token is optional - guests can also book
      const paymentResult = await createPaymentLink(bookingResult.id, accessToken || undefined);

      // Step 3: Redirect to PayOS checkout page
      if (paymentResult.checkoutUrl) {
        // Save booking ID to localStorage for reference after payment
        localStorage.setItem('pendingBookingId', bookingResult.id);

        // Redirect to PayOS
        window.location.href = paymentResult.checkoutUrl;
      } else {
        throw new Error('Không thể tạo link thanh toán');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error?.data?.message || error.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PassengerDetails />
          <PaymentMethods />
        </div>
        <aside className="lg:col-span-1 space-y-4">
          <SeatLockTimer />
          <BookingSummary />
          <Button
            onClick={handleCompletePayment}
            disabled={isCreatingBooking || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Redirecting to payment...' : isCreatingBooking ? 'Processing...' : 'Pay with PayOS'}
          </Button>
        </aside>
      </div>
    </main>
  );
}
