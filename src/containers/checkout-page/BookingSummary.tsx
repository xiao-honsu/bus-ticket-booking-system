'use client';

import { useAppSelector } from '@/lib/hooks';
import { useGetTripQuery } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, Bus, Users, Tag, Ticket } from 'lucide-react';

export default function BookingSummary() {
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);
  const selectedSeatDetails = useAppSelector((state) => state.booking.selectedSeatDetails);
  const passengers = useAppSelector((state) => state.booking.passengers);
  const promotion = useAppSelector((state) => state.booking.promotion);

  const { data: trip, isLoading } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

  // Calculate total price from actual seat prices
  const totalPrice = selectedSeatDetails.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trip) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">No trip selected</p>
        </CardContent>
      </Card>
    );
  }

  const discountAmount = promotion?.discountAmount || 0;
  const finalPrice = totalPrice - discountAmount;

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-muted/50 to-transparent pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Route */}
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {trip.route?.origin?.city} → {trip.route?.destination?.city}
            </p>
            <p className="text-xs text-muted-foreground">{trip.route?.routeName || 'Direct Route'}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{new Date(trip.departureTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(trip.departureTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Bus Type */}
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{trip.bus?.busType || 'Standard'}</span>
        </div>

        <Separator />

        {/* Seats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Selected Seats
            </span>
            <Badge variant="secondary" className="font-mono">
              {selectedSeats.length}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((seat) => (
              <Badge key={seat} variant="outline" className="text-xs">
                {seat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Passengers */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Passengers
          </span>
          <Badge variant="secondary">{passengers.length}</Badge>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{totalPrice.toLocaleString()}₫</span>
          </div>
          {promotion && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {promotion.code}
              </span>
              <span className="font-medium text-green-600">-{discountAmount.toLocaleString()}₫</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">{finalPrice.toLocaleString()}₫</span>
          </div>
          {promotion && (
            <p className="text-xs text-green-600 text-center bg-green-50 dark:bg-green-950/50 rounded-lg py-2">
              🎉 You save {discountAmount.toLocaleString()}₫ with {promotion.title}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
