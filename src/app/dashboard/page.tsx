'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { useGetBookingsQuery } from '@/lib/store/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  User,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bus,
} from 'lucide-react';
import { format, parseISO, isFuture } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ page: 1, limit: 50 });

  const bookings = bookingsData?.results || [];

  // Separate bookings into upcoming and past
  const upcomingBookings = bookings.filter(
    (booking: any) => booking.tripSnapshot?.departureTime && isFuture(parseISO(booking.tripSnapshot.departureTime))
  );
  const pastBookings = bookings.filter(
    (booking: any) => booking.tripSnapshot?.departureTime && !isFuture(parseISO(booking.tripSnapshot.departureTime))
  );

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-2">View and manage all your bus tickets</p>
            </div>
            <div className="flex gap-2">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Book New Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Trips Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Trips</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <Card className="border-border bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bus className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">No upcoming trips scheduled</p>
                <Button asChild>
                  <Link href="/search">Book Your First Trip</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <Card key={booking.id} className="border-border bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={getStatusVariant(booking.status)} className="gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Ref: {booking.referenceNumber}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">{booking.tripSnapshot?.routeName || 'N/A'}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {booking.tripSnapshot?.departureTime
                                  ? format(parseISO(booking.tripSnapshot.departureTime), 'PPP', { locale: vi })
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {booking.tripSnapshot?.departureTime
                                  ? format(parseISO(booking.tripSnapshot.departureTime), 'p', { locale: vi })
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Ticket className="h-4 w-4" />
                              <span>Seats: {booking.seatNumbers?.join(', ') || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{booking.passengers?.length || 0} Passengers</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="text-2xl font-bold text-primary">
                            {booking.totalPrice?.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Past Bookings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Past Trips</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastBookings.length === 0 ? (
            <Card className="border-border bg-muted/30">
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">No past trips</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastBookings.map((booking: any) => (
                <Card key={booking.id} className="border-border bg-card hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusVariant(booking.status)} className="gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Ref: {booking.referenceNumber}</span>
                        </div>
                        <p className="font-medium text-foreground mb-1">{booking.tripSnapshot?.routeName || 'N/A'}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {booking.tripSnapshot?.departureTime
                              ? format(parseISO(booking.tripSnapshot.departureTime), 'PP', { locale: vi })
                              : 'N/A'}
                          </span>
                          <span>Seats: {booking.seatNumbers?.join(', ') || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{booking.totalPrice?.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
