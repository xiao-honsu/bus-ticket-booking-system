'use client';

import { BookingSummary, PaymentMethods, PassengerDetails } from '@/containers/checkout-page';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCreateBookingMutation, useGetTripQuery } from '@/lib/store/services/api';
import { resetBooking } from '@/lib/store/features/booking/bookingSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const payment = useAppSelector((state) => state.booking.payment);
  const contactInfo = useAppSelector((state) => state.booking.contactInfo);

  const { data: trip } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

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

    if (!payment?.method) {
      toast.error('Please select a payment method');
      return;
    }

    if (!trip) {
      toast.error('Trip information not available');
      return;
    }

    try {
      const totalAmount = trip.price * selectedSeats.length;

      const bookingData = {
        tripId,
        seatNumbers: selectedSeats,
        passengers: passengers.map((p) => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: p.seatNumber,
          documentId: p.documentId,
          phoneNumber: p.phoneNumber,
        })),
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        paymentMethod: payment.method,
        totalAmount,
      };

      const result = await createBooking(bookingData).unwrap();

      toast.success('Booking created successfully!');

      // Reset booking state
      dispatch(resetBooking());

      // Redirect to booking confirmation or dashboard
      router.push(`/dashboard?bookingId=${result.id}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error?.data?.message || 'Failed to create booking. Please try again.');
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
          <BookingSummary />
          <Button onClick={handleCompletePayment} disabled={isCreatingBooking} className="w-full" size="lg">
            {isCreatingBooking ? 'Processing...' : 'Complete Payment'}
          </Button>
        </aside>
      </div>
    </main>
  );
}
