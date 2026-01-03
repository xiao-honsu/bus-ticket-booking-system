'use client';

import React from 'react';
import { SeatMap, PassengerForm, BookingPromoCode } from '@/containers/seat-selection';
import { useGetTripQuery, useReleaseLocksMutation } from '@/lib/store/services/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setTripId } from '@/lib/store/features/booking/bookingSlice';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookingCountdownTimer from '@/components/BookingCountdownTimer';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { BorderBeam } from '@/components/ui/border-beam';
import { getSocket } from '@/lib/services/socket';
import { SOCKET_EVENTS } from '@/lib/types/socket';
import { ArrowLeft, Bus, Clock, MapPin, ArrowRight, Route as RouteIcon, CreditCard, Ticket } from 'lucide-react';

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
      <AnimatedBackground>
        <main className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <aside className="lg:col-span-1 space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </aside>
          </div>
        </main>
      </AnimatedBackground>
    );
  }

  if (error || !trip) {
    return (
      <AnimatedBackground>
        <main className="container mx-auto px-3 py-4 md:px-4 md:py-6">
          <Card className="py-0">
            <CardHeader className="pb-2">
              <CardTitle>Error Loading Trip</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-destructive text-sm">Failed to load trip details. Please try again later.</p>
              <Button onClick={() => router.push('/search')} className="mt-3" size="sm">
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </main>
      </AnimatedBackground>
    );
  }

  // Calculate duration
  const durationHours = Math.round(
    (new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime()) / (1000 * 60 * 60)
  );

  return (
    <AnimatedBackground>
      <main className="container mx-auto px-3 py-4 md:px-4 md:py-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 -ml-2 h-8">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {/* Trip Header Card - Compact Redesign */}
        <Card className="mb-4 relative overflow-hidden py-0 gap-0">
          <BorderBeam size={200} duration={12} delay={9} />
          <CardContent className="p-4 md:p-5">
            {/* Route Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-primary/10 p-2 md:p-2.5 rounded-xl shrink-0">
                  <Bus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-bold flex items-center gap-2 flex-wrap">
                    <span className="truncate">{trip.route?.origin?.city || trip.route?.origin}</span>
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{trip.route?.destination?.city || trip.route?.destination}</span>
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {trip.route?.routeName || `${trip.route?.origin} - ${trip.route?.destination}`}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-medium w-fit shrink-0">
                ✅ Scheduled
              </Badge>
            </div>

            {/* Journey Timeline - Compact */}
            <div className="bg-muted/50 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Departure */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Departure</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </p>
                  <p className="text-xs md:text-sm font-medium">
                    {new Date(trip.departureTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground text-[10px] md:text-xs mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{trip.route?.origin?.landmark || 'Bus Station'}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center gap-1 shrink-0 px-2">
                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <p className="text-[10px] md:text-xs font-bold whitespace-nowrap">{durationHours}h</p>
                  <div className="w-12 md:w-20 h-px bg-primary/50" />
                  <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">
                    {trip.route?.distance || 964}km
                  </Badge>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right min-w-0">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5">Arrival</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {new Date(trip.arrivalTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </p>
                  <p className="text-xs md:text-sm font-medium">
                    {new Date(trip.arrivalTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground text-[10px] md:text-xs mt-1 justify-end">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{trip.route?.destination?.landmark || 'Bus Station'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stops Info - Compact */}
            {trip.route?.stops && trip.route.stops.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
                  <RouteIcon className="h-3.5 w-3.5" />
                  Stops: {trip.route.stops.length}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {trip.route.stops.map((stop: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
                      {stop.city || stop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Seat Map - Left Side */}
          <div className="lg:col-span-2">
            <SeatMap tripId={tripId} totalSeats={trip.bus?.totalSeats || 40} />
          </div>

          {/* Booking Summary - Right Side */}
          <aside className="lg:col-span-1 space-y-3">
            {/* Timer - Always active on page load */}
            <BookingCountdownTimer tripId={tripId} durationMinutes={3} />

            {/* Selected Seats */}
            {selectedSeats.length > 0 && (
              <Card className="border-2 border-primary/20 bg-primary/5 py-0 gap-0">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    Selected Seats ({selectedSeats.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeats.map((seat) => (
                      <Badge key={seat} variant="default" className="text-xs px-2 py-1">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fare Details */}
            <Card className="py-0 gap-0">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Fare Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Base Fare/seat:</span>
                  <span className="font-medium">{(trip.pricePerSeat || trip.price)?.toLocaleString()} ₫</span>
                </div>
                {selectedSeats.length > 0 && (
                  <>
                    {/* Show individual seat prices */}
                    <div className="space-y-1">
                      {selectedSeatDetails.map((seat) => (
                        <div key={seat.seatNumber} className="flex justify-between text-xs bg-muted/50 p-1.5 rounded">
                          <span>
                            {seat.seatNumber} ({seat.seatType})
                          </span>
                          <span className="font-medium">{seat.price.toLocaleString()} ₫</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between text-xs">
                      <span className="font-medium">
                        Subtotal ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}):
                      </span>
                      <span className="font-semibold">{totalPrice.toLocaleString()} ₫</span>
                    </div>

                    {promotion && (
                      <div className="flex justify-between text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-2 rounded">
                        <span className="font-medium">Discount ({promotion.code})</span>
                        <span className="font-bold">-{promotion.discountAmount.toLocaleString()} ₫</span>
                      </div>
                    )}

                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Total:</span>
                        <span className="text-lg font-bold">
                          {promotion
                            ? (totalPrice - promotion.discountAmount).toLocaleString()
                            : totalPrice.toLocaleString()}{' '}
                          ₫
                        </span>
                      </div>
                      <p className="text-[10px] text-primary-foreground/80 mt-1">✓ All taxes included</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Promo Code Section */}
            {selectedSeats.length > 0 && <BookingPromoCode totalAmount={totalPrice} />}

            {/* Checkout Button */}
            <Button
              onClick={handleContinueToCheckout}
              disabled={selectedSeats.length === 0}
              size="lg"
              className="w-full font-semibold py-5 text-sm"
            >
              {selectedSeats.length === 0 ? (
                <>Select Seats to Continue</>
              ) : (
                <>
                  Continue to Checkout ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
                </>
              )}
            </Button>

            {selectedSeats.length === 0 && (
              <p className="text-xs text-center text-muted-foreground">Click on available seats to select them</p>
            )}
          </aside>
        </div>

        {/* Passenger Form Below */}
        {selectedSeats.length > 0 && (
          <div className="mt-4">
            <Card className="py-0 gap-0">
              <CardHeader className="p-3 md:p-4 bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-base">👤 Passenger Information</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Please provide details for all {selectedSeats.length} passenger{selectedSeats.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <PassengerForm />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </AnimatedBackground>
  );
}
