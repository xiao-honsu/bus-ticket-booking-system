'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBookingsQuery } from '@/lib/store/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, Calendar, DollarSign } from 'lucide-react';

export default function SummaryCards() {
  const { data: bookingsData, isLoading } = useGetBookingsQuery({
    page: 1,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const bookings = bookingsData?.results || [];
  const totalBookings = bookingsData?.totalResults || 0;

  // Calculate upcoming trips (future departure dates)
  const upcomingTrips = bookings.filter((booking: any) => {
    const tripDate = new Date(booking.trip?.departureTime);
    const now = new Date();
    return tripDate > now;
  }).length;

  // Calculate total spent
  const totalSpent = bookings.reduce((sum: number, booking: any) => {
    return sum + (booking.totalPrice || 0);
  }, 0);

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Receipt,
      description: 'All time bookings',
    },
    {
      title: 'Upcoming Trips',
      value: upcomingTrips,
      icon: Calendar,
      description: 'Scheduled trips',
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      description: 'Lifetime spending',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
