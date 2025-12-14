'use client';

import React from 'react';
import { SeatMap, SeatLegend, PassengerForm } from '@/containers/seat-selection';
import { useGetTripQuery, useReleaseLocksMutation } from '@/lib/store/services/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setTripId } from '@/lib/store/features/booking/bookingSlice';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SeatLockTimer from '@/components/SeatLockTimer';

interface BookingPageProps {
  params: Promise<{ tripId: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { tripId } = React.use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: trip, isLoading, error } = useGetTripQuery(tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const sessionId = useAppSelector((state) => state.booking.sessionId);

  const [releaseLocks] = useReleaseLocksMutation();

  useEffect(() => {
    dispatch(setTripId(tripId));
  }, [dispatch, tripId]);

  // Release locks when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use navigator.sendBeacon for reliable cleanup on page unload
        const blob = new Blob([JSON.stringify({ sessionId })], { type: 'application/json' });
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/seat-locks/release`,
          blob
        );
      }
    };

    const handleRouteChange = async () => {
      if (sessionId) {
        try {
          await releaseLocks(sessionId);
        } catch (error) {
          console.error('Failed to release locks:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleRouteChange();
    };
  }, [sessionId, releaseLocks]);

  const handleContinueToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (passengers.length !== selectedSeats.length) {
      toast.error('Please fill in passenger details for all selected seats');
      return;
    }

    // Check if all passengers have required fields
    const allValid = passengers.every((p) => p.name && p.age && p.gender && p.seatNumber);

    if (!allValid) {
      toast.error('Please complete all passenger details');
      return;
    }

    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <aside className="lg:col-span-1">
            <Skeleton className="h-48 w-full" />
          </aside>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error ? 'Failed to load trip details' : 'Trip not found'}</p>
            <Button onClick={() => router.push('/search')} className="mt-4">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span>
            {trip.route?.origin?.city || trip.route?.origin} →{' '}
            {trip.route?.destination?.city || trip.route?.destination}
          </span>
          <span>•</span>
          <span>{new Date(trip.departureTime).toLocaleDateString()}</span>
          <span>•</span>
          <span className="font-medium">{trip.pricePerSeat?.toLocaleString() || trip.price} ₫</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SeatMap tripId={tripId} />
          <div className="mt-6">
            <PassengerForm />
          </div>
        </div>
        <aside className="lg:col-span-1 space-y-4">
          <SeatLockTimer />
          <SeatLegend />

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Seats selected:</span>
                <span className="font-medium">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per seat:</span>
                <span className="font-medium">{trip.pricePerSeat?.toLocaleString() || trip.price} ₫</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {((trip.pricePerSeat || trip.price) * selectedSeats.length).toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleContinueToCheckout} disabled={selectedSeats.length === 0} className="w-full" size="lg">
            Continue to Checkout
          </Button>
        </aside>
      </div>
    </main>
  );
}
