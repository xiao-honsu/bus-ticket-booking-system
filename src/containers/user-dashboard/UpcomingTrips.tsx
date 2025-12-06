'use client';

import { useGetBookingsQuery } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function UpcomingTrips() {
  const { data, isLoading } = useGetBookingsQuery({ page: 1, limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const bookings = data?.results || [];

  // Filter for upcoming trips (confirmed bookings with future dates)
  const upcomingTrips = bookings.filter((booking: any) => {
    const tripDate = new Date(booking.trip?.departureTime);
    const now = new Date();
    return booking.status === 'confirmed' && tripDate > now;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Trips</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTrips.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming trips</p>
        ) : (
          <div className="space-y-4">
            {upcomingTrips.map((booking: any) => (
              <div key={booking.id} className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                <div className="font-semibold text-lg mb-2">
                  {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-gray-600">
                    Date: {new Date(booking.trip?.departureTime).toLocaleDateString()}
                  </div>
                  <div className="text-gray-600">
                    Time:{' '}
                    {new Date(booking.trip?.departureTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-gray-600">Seats: {booking.seatNumbers?.join(', ')}</div>
                  <div className="text-gray-600">Ref: {booking.bookingRef}</div>
                </div>
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  View Details →
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
