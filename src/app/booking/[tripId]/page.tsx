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
import { Badge } from '@/components/ui/badge';
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

    console.log('Selected Seats:', selectedSeats);
    console.log('Passengers:', passengers);

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
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Select Your Seats</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">
            {trip.route?.origin?.city || trip.route?.origin} →{' '}
            {trip.route?.destination?.city || trip.route?.destination}
          </span>
          <span>•</span>
          <span>
            {new Date(trip.departureTime).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>•</span>
          <span className="text-gray-500">
            {trip.availableSeats || 0} / {trip.bus?.totalSeats || 40} available
          </span>
          <span>•</span>
          <span className="text-gray-500">Base Fare: {trip.pricePerSeat?.toLocaleString() || 0} ₫</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <SeatMap tripId={tripId} totalSeats={trip.bus?.totalSeats || 40} />
        </div>

        {/* Booking Summary - Right Side */}
        <aside className="lg:col-span-1 space-y-4">
          <SeatLockTimer />

          {/* Your Destination */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Destination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-500 text-xs">From</p>
                  <p className="font-semibold">{trip.route?.origin?.city || trip.route?.origin}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">To</p>
                  <p className="font-semibold">{trip.route?.destination?.city || trip.route?.destination}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Seats */}
          {selectedSeats.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <Badge key={seat} variant="default" className="text-sm px-3 py-1">
                      {seat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fare Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fare Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Basic Fare:</span>
                <span className="font-medium">{trip.pricePerSeat?.toLocaleString() || 0} ₫</span>
              </div>
              {selectedSeats.length > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seats × {selectedSeats.length}:</span>
                    <span className="font-medium">
                      {((trip.pricePerSeat || 0) * selectedSeats.length).toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Price:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {((trip.pricePerSeat || 0) * selectedSeats.length).toLocaleString()} ₫
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">(Including all taxes)</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <SeatLegend />

          {/* Checkout Button */}
          <Button
            onClick={handleContinueToCheckout}
            disabled={selectedSeats.length === 0}
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base uppercase"
          >
            {selectedSeats.length === 0 ? 'Select Seats' : 'Proceed to Checkout'}
          </Button>

          {selectedSeats.length === 0 && (
            <p className="text-xs text-center text-gray-500">Please select at least one seat to continue</p>
          )}
        </aside>
      </div>

      {/* Passenger Form Below */}
      {selectedSeats.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Passenger Details</CardTitle>
              <p className="text-sm text-gray-600">Provide information for all passengers</p>
            </CardHeader>
            <CardContent>
              <PassengerForm />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
