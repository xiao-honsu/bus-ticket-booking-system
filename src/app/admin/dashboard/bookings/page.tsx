'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useGetBookingsQuery, useCancelBookingMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function BookingMonitoringPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // Fetch bookings
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ page: 1, limit: 100 });

  const [cancelBooking] = useCancelBookingMutation();

  // Filter bookings by date
  const filteredBookings = useMemo(() => {
    const bookings = bookingsData?.results || [];
    if (!dateFilter) return bookings;
    return bookings.filter((bk: any) => {
      const bookingDate = format(parseISO(bk.createdAt), 'yyyy-MM-dd');
      return bookingDate === dateFilter;
    });
  }, [bookingsData?.results, dateFilter]);

  const statusColor = (status: string) => {
    if (status === 'confirmed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'cancelled') return 'bg-slate-100 text-slate-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  const handleView = (booking: any) => {
    setSelectedBooking(booking);
    setShowViewDialog(true);
  };

  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    try {
      await cancelBooking(cancelBookingId).unwrap();
      toast.success('Booking cancelled successfully');
      setShowCancelConfirm(false);
      setCancelBookingId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to cancel booking');
    }
  };

  // Format seat numbers (convert array to readable string)
  const formatSeats = (passengers: any[]) => {
    if (!Array.isArray(passengers)) return 'N/A';
    return passengers.map((p) => p.seatNumber).join(', ');
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Booking Monitoring</p>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-slate-600">Monitor and manage customer bookings</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" /> Bookings ({filteredBookings.length})
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="md:w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No bookings found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-4 py-2">Booking ID</th>
                      <th className="text-left px-4 py-2">Passenger</th>
                      <th className="text-left px-4 py-2">Trip</th>
                      <th className="text-left px-4 py-2">Seats</th>
                      <th className="text-left px-4 py-2">Amount</th>
                      <th className="text-left px-4 py-2">Booking Date</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((bk: any) => (
                      <tr key={bk.id} className="border-b last:border-none hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{bk.referenceNumber || bk.id}</td>
                        <td className="px-4 py-3">{bk.user?.name || 'Guest'}</td>
                        <td className="px-4 py-3 text-sm">
                          {bk.trip?.origin || 'N/A'} → {bk.trip?.destination || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {bk.passengers?.length} ({formatSeats(bk.passengers)})
                        </td>
                        <td className="px-4 py-3 font-medium">{bk.totalAmount?.toLocaleString('vi-VN')} đ</td>
                        <td className="px-4 py-3 text-sm">
                          {bk.createdAt ? format(parseISO(bk.createdAt), 'dd MMM yyyy', { locale: vi }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColor(bk.status)}>{bk.status}</Badge>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(bk)}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(bk.id)}
                            disabled={bk.status === 'cancelled'}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Trip & Bus Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
            <DialogDescription>Trip and bus information</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Trip Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Trip Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Origin</p>
                    <p className="font-medium">{selectedBooking.trip?.origin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Destination</p>
                    <p className="font-medium">{selectedBooking.trip?.destination || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Departure</p>
                    <p className="font-medium">
                      {selectedBooking.trip?.departureTime
                        ? format(parseISO(selectedBooking.trip.departureTime), 'dd MMM yyyy HH:mm', { locale: vi })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Arrival</p>
                    <p className="font-medium">
                      {selectedBooking.trip?.arrivalTime
                        ? format(parseISO(selectedBooking.trip.arrivalTime), 'dd MMM yyyy HH:mm', { locale: vi })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Base Price</p>
                    <p className="font-medium">{selectedBooking.trip?.basePrice?.toLocaleString('vi-VN') || 'N/A'} đ</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Duration</p>
                    <p className="font-medium">{selectedBooking.trip?.estimatedDuration || 'N/A'} hours</p>
                  </div>
                </div>
              </div>

              {/* Bus Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Bus Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">License Plate</p>
                    <p className="font-medium">{selectedBooking.trip?.busId?.licensePlate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Model</p>
                    <p className="font-medium">{selectedBooking.trip?.busId?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Total Seats</p>
                    <p className="font-medium">{selectedBooking.trip?.busId?.totalSeats || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Operator</p>
                    <p className="font-medium">{selectedBooking.trip?.operatorId?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Seats Booked</p>
                    <p className="font-medium">{formatSeats(selectedBooking.passengers)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Total Price</p>
                    <p className="font-medium">{selectedBooking.totalAmount?.toLocaleString('vi-VN') || 'N/A'} đ</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <Badge className={statusColor(selectedBooking.status)}>{selectedBooking.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel Booking
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
