'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { ArrowLeft, Ticket, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useGetBookingsQuery, useCancelBookingMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function BookingMonitoringPage() {
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // Fetch bookings with higher limit to get all recent bookings
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ page: 1, limit: 500 });

  const [cancelBooking] = useCancelBookingMutation();

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let bookings = bookingsData?.results || [];

    // Default sort by createdAt descending (newest first)
    bookings = [...bookings].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      bookings = bookings.filter((bk: any) => {
        const referenceNumber = (bk.referenceNumber || bk.id || '').toLowerCase();
        const userName = (bk.user?.name || '').toLowerCase();
        const userEmail = (bk.user?.email || '').toLowerCase();
        const userPhone = (bk.contactInfo?.phone || '').toLowerCase();

        return (
          referenceNumber.includes(query) ||
          userName.includes(query) ||
          userEmail.includes(query) ||
          userPhone.includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      bookings = bookings.filter((bk: any) => bk.status === statusFilter);
    }

    // Date filter (single booking date)
    if (dateFilter) {
      bookings = bookings.filter((bk: any) => {
        const bookingDate = format(parseISO(bk.createdAt), 'yyyy-MM-dd');
        return bookingDate === dateFilter;
      });
    }

    return bookings;
  }, [bookingsData?.results, searchQuery, statusFilter, dateFilter]);

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

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Booking Monitoring</p>
            <h1 className="text-2xl font-bold dark:text-gray-100">Bookings</h1>
            <p className="text-slate-600 dark:text-slate-400">Monitor and manage customer bookings</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4 dark:text-gray-300" /> Back
          </Button>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Search by booking ID, passenger name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Booking Date Filter */}
              <div>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Booking Date"
                />
              </div>

              {/* Clear Filters Button */}
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Bookings ({filteredBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">No bookings found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Booking ID</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Passenger</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Trip</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Seats</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Amount</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Booking Date</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Status</th>
                      <th className="text-left px-4 py-2 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((bk: any) => (
                      <tr
                        key={bk.id}
                        className="border-b dark:border-slate-700 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium dark:text-gray-200">{bk.referenceNumber || bk.id}</td>
                        <td className="px-4 py-3 dark:text-gray-300">{bk.user?.name || 'Guest'}</td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                          {bk.tripSnapshot?.routeName ||
                            (bk.trip?.route
                              ? `${bk.trip.route.origin?.city || 'N/A'} - ${bk.trip.route.destination?.city || 'N/A'}`
                              : 'N/A')}
                        </td>
                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                          {bk.passengers?.length} ({formatSeats(bk.passengers)})
                        </td>
                        <td className="px-4 py-3 font-medium dark:text-gray-200">
                          {bk.totalAmount?.toLocaleString('vi-VN')} đ
                        </td>
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
              <div className="border dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3 dark:text-gray-200">Trip Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Route</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.tripSnapshot?.routeName ||
                        (selectedBooking.trip?.route
                          ? `${selectedBooking.trip.route.origin?.city || 'N/A'} - ${selectedBooking.trip.route.destination?.city || 'N/A'}`
                          : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Operator</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.tripSnapshot?.operatorName ||
                        selectedBooking.trip?.operator?.companyName ||
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Departure</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.tripSnapshot?.departureTime
                        ? format(parseISO(selectedBooking.tripSnapshot.departureTime), 'dd MMM yyyy HH:mm', {
                            locale: vi,
                          })
                        : selectedBooking.trip?.departureTime
                          ? format(parseISO(selectedBooking.trip.departureTime), 'dd MMM yyyy HH:mm', { locale: vi })
                          : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Arrival</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.tripSnapshot?.arrivalTime
                        ? format(parseISO(selectedBooking.tripSnapshot.arrivalTime), 'dd MMM yyyy HH:mm', {
                            locale: vi,
                          })
                        : selectedBooking.trip?.arrivalTime
                          ? format(parseISO(selectedBooking.trip.arrivalTime), 'dd MMM yyyy HH:mm', { locale: vi })
                          : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Bus License Plate</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.tripSnapshot?.busPlateNumber || selectedBooking.trip?.bus?.plateNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3 dark:text-gray-200">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Seats Booked</p>
                    <p className="font-medium dark:text-gray-200">{formatSeats(selectedBooking.passengers)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Total Price</p>
                    <p className="font-medium dark:text-gray-200">
                      {selectedBooking.totalAmount?.toLocaleString('vi-VN') || 'N/A'} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Status</p>
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
