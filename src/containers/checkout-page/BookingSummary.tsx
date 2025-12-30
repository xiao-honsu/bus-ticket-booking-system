'use client';

import { useAppSelector } from '@/lib/hooks';
import { useGetTripQuery } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingSummary() {
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const selectedSeatDetails = useAppSelector((state) => state.booking.selectedSeatDetails);
  const passengers = useAppSelector((state) => state.booking.passengers);

  const { data: trip, isLoading } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

  // Calculate total price from actual seat prices
  const totalPrice = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trip) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No trip selected</p>
        </CardContent>
      </Card>
    );
  }

  const pricePerSeat = trip.pricePerSeat || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Route:</span>
          <span className="font-medium">
            {trip.route?.origin?.city} → {trip.route?.destination?.city}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{new Date(trip.departureTime).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">
            {new Date(trip.departureTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Bus Type:</span>
          <span className="font-medium">{trip.bus?.type || 'Standard'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Seats:</span>
          <span className="font-medium">{selectedSeats.join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Passengers:</span>
          <span className="font-medium">{passengers.length}</span>
        </div>
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Base price per seat:</span>
            <span className="font-medium">${pricePerSeat.toFixed(2)}</span>
          </div>

          {/* Show individual seat prices */}
          {selectedSeatDetails.length > 0 && (
            <div className="space-y-1 mb-3">
              {selectedSeatDetails.map((seat) => (
                <div key={seat.seatNumber} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Seat {seat.seatNumber} ({seat.seatType}):
                  </span>
                  <span className="font-medium">${seat.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
