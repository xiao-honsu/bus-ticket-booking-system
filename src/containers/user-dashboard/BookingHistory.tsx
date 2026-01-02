'use client';

import { useGetBookingsQuery, useCancelBookingMutation } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BookingHistory() {
  const { data, isLoading, error } = useGetBookingsQuery({
    page: 1,
    limit: 10,
  });
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;

    try {
      await cancelBooking(selectedBookingId).unwrap();
      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedBookingId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      completed: { variant: 'outline', label: 'Completed' },
    };

    const config = statusConfig[status] || {
      variant: 'secondary',
      label: status,
    };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2"> Loading your booking history is in progress</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bookings = data?.results || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold">
                        {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                      </div>
                      <div className="text-sm text-gray-600">Ref: {booking.bookingRef}</div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                    <div>Date: {new Date(booking.trip?.departureTime).toLocaleDateString()}</div>
                    <div>Seats: {booking.seatNumbers?.join(', ')}</div>
                    <div>Passengers: {booking.passengers?.length || 0}</div>
                    <div className="font-bold text-gray-900">${booking.totalAmount}</div>
                  </div>
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelClick(booking.id)}
                      disabled={isCancelling}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
