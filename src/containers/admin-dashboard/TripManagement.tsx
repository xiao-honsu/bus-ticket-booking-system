'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  useGetRoutesQuery,
  useGetBusesQuery,
  useSearchTripsQuery,
  useCreateTripMutation,
  useDeleteTripMutation,
  useUpdateTripStatusMutation,
  useCheckBusAvailabilityMutation,
} from '@/lib/store/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function TripManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { data: routesData } = useGetRoutesQuery({ page: 1, limit: 100 });
  const { data: busesData } = useGetBusesQuery({ page: 1, limit: 100 });

  // Default filters: scheduled trips, newest first
  const [filters, setFilters] = useState({
    status: 'scheduled' as string,
    sortBy: 'departureTime',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const { data: tripsData, isLoading: isLoadingTrips } = useSearchTripsQuery({
    page: currentPage,
    limit,
    status: filters.status !== 'all' ? filters.status : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });
  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [deleteTrip, { isLoading: isDeleting }] = useDeleteTripMutation();
  const [updateTripStatus] = useUpdateTripStatusMutation();
  const [checkBusAvailability, { isLoading: isCheckingAvailability }] = useCheckBusAvailabilityMutation();

  const routes = routesData?.results || [];
  const buses = busesData?.results || [];
  const trips = tripsData?.results || [];
  const totalPages = tripsData?.totalPages || 1;
  const totalResults = tripsData?.totalResults || 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripForStatus, setSelectedTripForStatus] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');
  const [hasConflict, setHasConflict] = useState(false);

  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    pricePerSeat: 0,
    driver: {
      name: '',
      phone: '',
      licenseNumber: '',
    },
  });

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.routeId || !formData.busId) {
        toast.error('Please select route and bus');
        return;
      }
      if (!formData.departureDate || !formData.departureTime) {
        toast.error('Please enter departure date and time');
        return;
      }
      if (!formData.arrivalDate || !formData.arrivalTime) {
        toast.error('Please enter arrival date and time');
        return;
      }
      if (!formData.pricePerSeat || formData.pricePerSeat <= 0) {
        toast.error('Please enter valid price per seat');
        return;
      }

      const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
      const arrivalDateTime = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);

      if (arrivalDateTime <= departureDateTime) {
        toast.error('Arrival time must be after departure time');
        return;
      }

      // Get selected bus to extract operator
      const selectedBus = buses.find((b: any) => b.id === formData.busId);
      if (!selectedBus || !selectedBus.operator) {
        toast.error('Selected bus must have an operator');
        return;
      }

      const tripData = {
        route: formData.routeId,
        bus: formData.busId,
        operator: selectedBus.operator.id || selectedBus.operator,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        pricePerSeat: formData.pricePerSeat,
        driver: formData.driver.name
          ? {
              name: formData.driver.name,
              phone: formData.driver.phone,
              licenseNumber: formData.driver.licenseNumber,
            }
          : undefined,
      };

      await createTrip(tripData).unwrap();
      toast.success('Trip created successfully');
      setDialogOpen(false);

      // Reset form
      setFormData({
        routeId: '',
        busId: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        pricePerSeat: 0,
        driver: {
          name: '',
          phone: '',
          licenseNumber: '',
        },
      });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create trip');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await deleteTrip(tripId).unwrap();
      toast.success('Trip deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedTripId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete trip');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTripForStatus) return;

    try {
      const tripId = selectedTripForStatus._id || selectedTripForStatus.id;
      await updateTripStatus({
        tripId,
        status: newStatus,
        ...(newStatus === 'cancelled' && cancellationReason && { cancellationReason }),
      }).unwrap();

      toast.success('Trip status updated successfully');
      setStatusDialogOpen(false);
      setSelectedTripForStatus(null);
      setNewStatus('');
      setCancellationReason('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update trip status');
    }
  };

  const checkConflicts = async () => {
    if (
      !formData.busId ||
      !formData.departureDate ||
      !formData.departureTime ||
      !formData.arrivalDate ||
      !formData.arrivalTime
    ) {
      setConflictMessage('⚠️ Please fill in bus, departure and arrival date/time first');
      setHasConflict(false);
      return;
    }

    try {
      // Combine date and time into ISO string
      const departureTime = `${formData.departureDate}T${formData.departureTime}:00.000Z`;
      const arrivalTime = `${formData.arrivalDate}T${formData.arrivalTime}:00.000Z`;

      const result = await checkBusAvailability({
        busId: formData.busId,
        departureTime,
        arrivalTime,
      }).unwrap();

      if (result.available) {
        setHasConflict(false);
        setConflictMessage('✅ Bus is available for selected time slot');
      } else {
        setHasConflict(true);
        const conflictDetails = result.conflicts
          .map((c: any) => {
            const route = c.route
              ? `${c.route.origin?.city || 'Unknown'} → ${c.route.destination?.city || 'Unknown'}`
              : 'Unknown route';
            const depTime = new Date(c.departureTime).toLocaleString();
            const arrTime = new Date(c.arrivalTime).toLocaleString();
            return `${route} (${depTime} - ${arrTime})`;
          })
          .join(', ');
        setConflictMessage(`❌ Bus is NOT available. Conflicts with: ${conflictDetails}`);
      }
    } catch (error: any) {
      setConflictMessage(`❌ Error checking availability: ${error?.data?.message || 'Unknown error'}`);
      setHasConflict(false);
    }
  };

  const filteredTrips = trips;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Trip Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage trips and schedules</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
          <ArrowLeft className="w-4 h-4 dark:text-gray-300" />
          Back to Dashboard
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trips ({totalResults})</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>+ Add Trip</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => setFilters({ ...filters, sortOrder: value as 'asc' | 'desc' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setFilters({ status: 'scheduled', sortBy: 'departureTime', sortOrder: 'desc' })}
            >
              Reset Filters
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Route</th>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Time</th>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Available Seats</th>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTrips ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading trips...
                    </td>
                  </tr>
                ) : filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No trips match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip: any) => {
                    const tripId = trip._id || trip.id;
                    return (
                      <tr
                        key={tripId}
                        className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 dark:text-gray-300">{trip.route?.routeName || 'N/A'}</td>
                        <td className="px-4 py-3 dark:text-gray-300">
                          {new Date(trip.departureTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(trip.departureTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {trip.availableSeats}/{trip.bus?.totalSeats || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              trip.status === 'scheduled'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : trip.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : trip.status === 'completed'
                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {trip.status === 'in_progress'
                              ? 'In Progress'
                              : trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTripForStatus(trip);
                                setNewStatus(trip.status);
                                setStatusDialogOpen(true);
                              }}
                            >
                              Change Status
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/trips/${tripId}/seat-pricing`)}
                            >
                              Set Prices
                            </Button>
                            <button
                              onClick={() => {
                                setSelectedTripId(tripId);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTrips.length} of {totalResults} trips
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Trip Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Trip</DialogTitle>
            <DialogDescription>
              Create a new trip by assigning a bus to a route with departure/arrival times
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Route Selection */}
            <div>
              <Label htmlFor="route" className="mb-1.5 block">
                Select Route *
              </Label>
              <Select value={formData.routeId} onValueChange={(value) => setFormData({ ...formData, routeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.length === 0 ? (
                    <SelectItem value="placeholder" disabled>
                      No routes available
                    </SelectItem>
                  ) : (
                    routes.map((route: any) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.routeName} - {route.distance}km ({Math.floor(route.estimatedDuration / 60)}h{' '}
                        {route.estimatedDuration % 60}m)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Bus Selection */}
            <div>
              <Label htmlFor="bus" className="mb-1.5 block">
                Select Bus *
              </Label>
              <Select value={formData.busId} onValueChange={(value) => setFormData({ ...formData, busId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.length === 0 ? (
                    <SelectItem value="placeholder" disabled>
                      No buses available
                    </SelectItem>
                  ) : (
                    buses.map((bus: any) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.licensePlate} - {bus.busType} ({bus.totalSeats} seats) - {bus.operator?.companyName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Departure Time */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Departure</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="depDate" className="mb-1.5 block">
                    Date *
                  </Label>
                  <Input
                    id="depDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departureDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="depTime" className="mb-1.5 block">
                    Time *
                  </Label>
                  <Input
                    id="depTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departureTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Arrival Time */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Arrival</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="arrDate" className="mb-1.5 block">
                    Date *
                  </Label>
                  <Input
                    id="arrDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="arrTime" className="mb-1.5 block">
                    Time *
                  </Label>
                  <Input
                    id="arrTime"
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <Label htmlFor="price" className="mb-1.5 block">
                Price per Seat (VND) *
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={formData.pricePerSeat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerSeat: parseFloat(e.target.value),
                  })
                }
                placeholder="500000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Base price, modifiers will apply based on seat type
              </p>
            </div>

            <Separator />

            {/* Driver Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Driver Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="driverName" className="mb-1.5 block">
                    Driver Name *
                  </Label>
                  <Input
                    id="driverName"
                    value={formData.driver.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driver: { ...formData.driver, name: e.target.value },
                      })
                    }
                    placeholder="Nguyen Van A"
                  />
                </div>
                <div>
                  <Label htmlFor="driverPhone" className="mb-1.5 block">
                    Phone
                  </Label>
                  <Input
                    id="driverPhone"
                    value={formData.driver.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driver: { ...formData.driver, phone: e.target.value },
                      })
                    }
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label htmlFor="driverLicense" className="mb-1.5 block">
                    License Number *
                  </Label>
                  <Input
                    id="driverLicense"
                    value={formData.driver.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driver: {
                          ...formData.driver,
                          licenseNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="B2-123456"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Conflict Checker */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={checkConflicts}
                disabled={isCheckingAvailability}
              >
                🔍 {isCheckingAvailability ? 'Checking...' : 'Check Bus Availability'}
              </Button>
              {conflictMessage && (
                <div
                  className={`rounded-lg border p-4 ${
                    hasConflict
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : 'bg-green-50 text-green-900 border-green-200'
                  }`}
                >
                  <p className="text-sm">{conflictMessage}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || hasConflict}>
              {isCreating ? 'Creating...' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trip Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? Passengers will lose their bookings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => selectedTripId && handleDeleteTrip(selectedTripId)}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Trip Status</DialogTitle>
            <DialogDescription>
              Change the status of this trip. Current status: <strong>{selectedTripForStatus?.status}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newStatus" className="mb-2 block">
                New Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'cancelled' && (
              <div>
                <Label htmlFor="cancellationReason" className="mb-2 block">
                  Cancellation Reason *
                </Label>
                <Input
                  id="cancellationReason"
                  placeholder="Enter reason for cancellation"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setNewStatus('');
                setCancellationReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || (newStatus === 'cancelled' && !cancellationReason)}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
