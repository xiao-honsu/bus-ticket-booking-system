'use client';

import React from 'react';
import { SeatMap, SeatLegend, PassengerForm, BookingPromoCode } from '@/containers/seat-selection';
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
import { getSocket } from '@/lib/services/socket';
import { SOCKET_EVENTS } from '@/lib/types/socket';

interface BookingPageProps {
  params: Promise<{ tripId: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { tripId } = React.use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: trip, isLoading, error } = useGetTripQuery(tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const selectedSeatDetails = useAppSelector((state) => state.booking.selectedSeatDetails);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const sessionId = useAppSelector((state) => state.booking.sessionId);
  const promotion = useAppSelector((state) => state.booking.promotion);

  // Calculate total price from selected seat details
  const totalPrice = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);

  const [releaseLocks] = useReleaseLocksMutation();

  // Debug: Log promotion state changes
  useEffect(() => {
    if (promotion) {
      console.log('🎁 Promotion Updated in Booking Page:', promotion);
    } else {
      console.log('🎁 No promotion applied');
    }
  }, [promotion]);

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

      // Leave trip room and disconnect socket
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_TRIP, { tripId });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleRouteChange();
    };
  }, [sessionId, releaseLocks, tripId]);

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
        >
          ← Back to Search
        </Button>

        {/* Trip Header Card */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            {/* Main Route Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                <span className="text-6xl">🚌</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2 flex items-center gap-3 flex-wrap">
                  {trip.route?.origin?.city || trip.route?.origin}
                  <span className="text-yellow-300 animate-pulse">→</span>
                  {trip.route?.destination?.city || trip.route?.destination}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="text-lg">📍</span>
                  <p className="text-lg font-medium">
                    {trip.route?.routeName || `${trip.route?.origin} - ${trip.route?.destination}`}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/40 px-4 py-2 text-sm font-bold">
                ✅ Scheduled
              </Badge>
            </div>

            {/* Journey Timeline */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
              <div className="flex items-center justify-between gap-8">
                {/* Departure */}
                <div className="flex-1">
                  <div className="text-white/80 text-sm mb-2 font-semibold">Departure</div>
                  <div className="text-5xl font-black text-white drop-shadow-md mb-1">
                    {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                  <div className="text-white/90 font-semibold mb-2">
                    {new Date(trip.departureTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <span>📍</span>
                    <span>{trip.route?.origin?.landmark || 'Bus Station'}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-white font-bold whitespace-nowrap">
                    {Math.round(
                      (new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime()) / (1000 * 60 * 60)
                    )}
                    h
                  </div>
                  <div className="w-32 h-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 rounded-full shadow-md animate-pulse" />
                  <div className="text-xs text-white font-bold bg-white/20 px-3 py-1 rounded-full">
                    {trip.route?.distance || 964}km
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <div className="text-white/80 text-sm mb-2 font-semibold">Arrival</div>
                  <div className="text-5xl font-black text-white drop-shadow-md mb-1">
                    {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                  <div className="text-white/90 font-semibold mb-2">
                    {new Date(trip.arrivalTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm justify-end">
                    <span>🏯</span>
                    <span>{trip.route?.destination?.landmark || 'Bus Station'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stops Info */}
            {trip.route?.stops && trip.route.stops.length > 0 && (
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-xl border border-white/30 shadow-md">
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">🛑</span>
                  Stops on the way:
                </p>
                <div className="flex flex-wrap gap-2">
                  {trip.route.stops.map((stop: any, idx: number) => (
                    <Badge
                      key={idx}
                      className="text-xs bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all px-3 py-1.5 font-semibold"
                    >
                      📌 {stop.city || stop} ({stop.minutesFromStart || idx * 120}m)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="transform transition-all duration-500 hover:scale-[1.01]">
              <SeatMap tripId={tripId} totalSeats={trip.bus?.totalSeats || 40} />
            </div>
          </div>

          {/* Booking Summary - Right Side */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Timer */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <SeatLockTimer />
            </div>

            {/* Trip Info Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-white/70 text-xs mb-1">Departure</p>
                    <p className="font-bold text-lg">{trip.route?.origin?.city || trip.route?.origin}</p>
                    <p className="text-sm text-white/90">
                      {new Date(trip.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="px-4">
                    <div className="text-3xl animate-bounce">→</div>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-white/70 text-xs mb-1">Arrival</p>
                    <p className="font-bold text-lg">{trip.route?.destination?.city || trip.route?.destination}</p>
                    <p className="text-sm text-white/90">
                      {new Date(trip.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Seats */}
            {selectedSeats.length > 0 && (
              <Card className="border-2 border-green-200 bg-green-50/50 backdrop-blur-sm shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-900">
                    <span className="text-xl">✅</span>
                    Your Selected Seats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat, index) => (
                      <Badge
                        key={seat}
                        className="text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md animate-in fade-in-50 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        💺 {seat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fare Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  Fare Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare per seat:</span>
                  <span className="font-semibold">{(trip.pricePerSeat || trip.price)?.toLocaleString()} ₫</span>
                </div>
                {selectedSeats.length > 0 && (
                  <>
                    {/* Show individual seat prices */}
                    <div className="space-y-2">
                      {selectedSeatDetails.map((seat) => (
                        <div key={seat.seatNumber} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-700">
                            Seat {seat.seatNumber} ({seat.seatType}):
                          </span>
                          <span className="font-semibold text-gray-900">{seat.price.toLocaleString()} ₫</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm bg-blue-50 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium">Total for {selectedSeats.length} seat(s):</span>
                      <span className="font-semibold text-blue-900">{totalPrice.toLocaleString()} ₫</span>
                    </div>
                    {promotion && (
                      <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg border-2 border-green-200">
                        <span className="text-green-700 font-medium flex items-center gap-1">
                          <span>🎉</span> Discount ({promotion.code}):
                        </span>
                        <span className="font-bold text-green-700">-{promotion.discountAmount.toLocaleString()} ₫</span>
                      </div>
                    )}
                    <div className="border-t-2 border-dashed border-gray-200 pt-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl text-white">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total Amount:</span>
                          <span className="text-2xl font-black">
                            {promotion
                              ? (
                                  (trip.pricePerSeat || trip.price) * selectedSeats.length -
                                  promotion.discountAmount
                                ).toLocaleString()
                              : ((trip.pricePerSeat || trip.price) * selectedSeats.length).toLocaleString()}{' '}
                            ₫
                          </span>
                        </div>
                        <p className="text-xs text-white/80 mt-2">✓ All taxes included</p>
                        {promotion && (
                          <p className="text-xs text-yellow-300 mt-1 font-bold">
                            💰 You saved {promotion.discountAmount.toLocaleString()} ₫ with {promotion.title}!
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Promo Code Section */}
            {selectedSeats.length > 0 && (
              <div className="transform transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-2">
                <BookingPromoCode totalAmount={(trip.pricePerSeat || trip.price) * selectedSeats.length} />
              </div>
            )}

            {/* Legend */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <SeatLegend />
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleContinueToCheckout}
              disabled={selectedSeats.length === 0}
              size="lg"
              className={`w-full font-bold py-7 text-lg rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                selectedSeats.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white animate-pulse hover:animate-none'
              }`}
            >
              {selectedSeats.length === 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <span>👆</span> Select Your Seats First
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🎉</span> Continue to Checkout ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                  )
                </span>
              )}
            </Button>

            {selectedSeats.length === 0 && (
              <p className="text-sm text-center text-gray-500 animate-pulse">
                💡 Tip: Click on available seats to select them
              </p>
            )}
          </aside>
        </div>

        {/* Passenger Form Below */}
        {selectedSeats.length > 0 && (
          <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">👤</span>
                  Passenger Information
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">📝 Please provide accurate details for all passengers</p>
              </CardHeader>
              <CardContent className="pt-6">
                <PassengerForm />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
