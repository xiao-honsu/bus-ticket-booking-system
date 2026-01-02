'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useDeleteRouteMutation,
  useUpdateRouteMutation,
} from '@/lib/store/services/api';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function RouteManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useGetRoutesQuery({
    page: currentPage,
    limit,
  });
  const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation();
  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();
  const [updateRoute, { isLoading: isUpdating }] = useUpdateRouteMutation();

  const routes = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '' });
  const [formData, setFormData] = useState({
    routeName: '',
    origin: {
      city: '',
      state: '',
      landmark: '',
    },
    destination: {
      city: '',
      state: '',
      landmark: '',
    },
    distance: 0,
    estimatedDuration: 0,
    stops: [] as Array<{
      city: string;
      state: string;
      stopOrder: number;
      minutesFromStart: number;
      stopType: 'pickup' | 'dropoff' | 'both';
    }>,
  });

  const validateRoute = () => {
    if (!formData.routeName || !formData.origin.city || !formData.destination.city) {
      toast.error('Route name, origin city, and destination city are required');
      return false;
    }
    if (formData.distance <= 0 || formData.estimatedDuration <= 0) {
      toast.error('Distance and duration must be greater than zero');
      return false;
    }
    const hasInvalidStop = formData.stops.some(
      (stop) => !stop.city || stop.stopOrder <= 0 || stop.minutesFromStart < 0
    );
    if (hasInvalidStop) {
      toast.error('Each stop needs a city, positive order, and non-negative minutes');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateRoute()) return;
      await createRoute(formData).unwrap();
      toast.success('Route created successfully');
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create route');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRouteId) return;
    try {
      if (!validateRoute()) return;
      await updateRoute({ id: selectedRouteId, ...formData }).unwrap();
      toast.success('Route updated successfully');
      setDialogOpen(false);
      resetForm();
      setSelectedRouteId(null);
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update route');
    }
  };

  const resetForm = () => {
    setFormData({
      routeName: '',
      origin: { city: '', state: '', landmark: '' },
      destination: { city: '', state: '', landmark: '' },
      distance: 0,
      estimatedDuration: 0,
      stops: [],
    });
  };

  const handleDelete = async () => {
    if (!selectedRouteId) return;
    try {
      await deleteRoute(selectedRouteId).unwrap();
      toast.success('Route deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedRouteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete route');
    }
  };

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        {
          city: '',
          state: '',
          stopOrder: formData.stops.length + 1,
          minutesFromStart: 0,
          stopType: 'both',
        },
      ],
    });
  };

  const removeStop = (index: number) => {
    const newStops = formData.stops.filter((_, i) => i !== index).map((stop, idx) => ({ ...stop, stopOrder: idx + 1 }));
    setFormData({ ...formData, stops: newStops });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load routes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Route Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage travel routes and stops</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
          <ArrowLeft className="w-4 h-4 dark:text-gray-300" />
          Back to Dashboard
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Routes ({totalResults})</CardTitle>
          <Button
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setDialogOpen(true);
            }}
          >
            + Add Route
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Search route, origin, destination"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Showing {routes.length} loaded routes
            </div>
            <Button variant="outline" onClick={() => setFilters({ search: '' })}>
              Reset Filters
            </Button>
          </div>

          {(() => {
            const filtered = routes.filter((route: any) => {
              if (!filters.search) return true;
              const query = filters.search.toLowerCase();
              return (
                route.routeName.toLowerCase().includes(query) ||
                route.origin.city.toLowerCase().includes(query) ||
                route.destination.city.toLowerCase().includes(query)
              );
            });

            if (filtered.length === 0) {
              return <p className="text-gray-500 dark:text-gray-400 text-center py-8">No routes match the filters</p>;
            }

            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Stops</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((route: any) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.routeName}</TableCell>
                      <TableCell>
                        {route.origin.city}, {route.origin.state}
                      </TableCell>
                      <TableCell>
                        {route.destination.city}, {route.destination.state}
                      </TableCell>
                      <TableCell>{route.distance} km</TableCell>
                      <TableCell>
                        {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{route.stops?.length || 0} stops</Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditMode(true);
                            setSelectedRouteId(route.id);
                            setFormData({
                              routeName: route.routeName || '',
                              origin: route.origin || { city: '', state: '', landmark: '' },
                              destination: route.destination || { city: '', state: '', landmark: '' },
                              distance: route.distance || 0,
                              estimatedDuration: route.estimatedDuration || 0,
                              stops:
                                route.stops?.map((stop: any, idx: number) => ({
                                  city: stop.city || '',
                                  state: stop.state || '',
                                  stopOrder: stop.stopOrder || idx + 1,
                                  minutesFromStart: stop.minutesFromStart || 0,
                                  stopType: stop.stopType || 'both',
                                })) || [],
                            });
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedRouteId(route.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            );
          })()}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {routes.length} of {totalResults} routes
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    if (totalPages <= 5) return i + 1;
                    if (currentPage <= 3) return i + 1;
                    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                    return currentPage - 2 + i;
                  }).map((page) => (
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
        </CardContent>
      </Card>

      {/* Create Route Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Route' : 'Add New Route'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update route details, distance, duration, and stops'
                : 'Create a new bus route with origin, destination, and optional stops'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Route Name */}
            <div>
              <Label htmlFor="routeName" className="mb-1.5 block">
                Route Name *
              </Label>
              <Input
                id="routeName"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                placeholder="Hanoi - Ho Chi Minh"
              />
            </div>

            <Separator />

            {/* Origin Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Origin</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="originCity" className="mb-1.5 block">
                    City *
                  </Label>
                  <Input
                    id="originCity"
                    value={formData.origin.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        origin: { ...formData.origin, city: e.target.value },
                      })
                    }
                    placeholder="Hanoi"
                  />
                </div>
                <div>
                  <Label htmlFor="originState" className="mb-1.5 block">
                    State/Province *
                  </Label>
                  <Input
                    id="originState"
                    value={formData.origin.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        origin: { ...formData.origin, state: e.target.value },
                      })
                    }
                    placeholder="Hanoi"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="originLandmark" className="mb-1.5 block">
                  Landmark (optional)
                </Label>
                <Input
                  id="originLandmark"
                  value={formData.origin.landmark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      origin: { ...formData.origin, landmark: e.target.value },
                    })
                  }
                  placeholder="My Dinh Bus Station"
                />
              </div>
            </div>

            <Separator />

            {/* Destination Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Destination</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="destCity" className="mb-1.5 block">
                    City *
                  </Label>
                  <Input
                    id="destCity"
                    value={formData.destination.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destination: {
                          ...formData.destination,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="Ho Chi Minh"
                  />
                </div>
                <div>
                  <Label htmlFor="destState" className="mb-1.5 block">
                    State/Province *
                  </Label>
                  <Input
                    id="destState"
                    value={formData.destination.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destination: {
                          ...formData.destination,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="Ho Chi Minh City"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destLandmark" className="mb-1.5 block">
                  Landmark (optional)
                </Label>
                <Input
                  id="destLandmark"
                  value={formData.destination.landmark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destination: {
                        ...formData.destination,
                        landmark: e.target.value,
                      },
                    })
                  }
                  placeholder="Mien Dong Bus Station"
                />
              </div>
            </div>

            <Separator />

            {/* Route Information */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="distance" className="mb-1.5 block">
                  Distance (km) *
                </Label>
                <Input
                  id="distance"
                  type="number"
                  min={0}
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      distance: parseFloat(e.target.value),
                    })
                  }
                  placeholder="1700"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="mb-1.5 block">
                  Estimated Duration (minutes) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={0}
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDuration: parseInt(e.target.value),
                    })
                  }
                  placeholder="1800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1800 minutes = 30 hours</p>
              </div>
            </div>

            <Separator />

            {/* Intermediate Stops (Optional) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Intermediate Stops (Optional)</h3>
                <Button type="button" variant="outline" size="sm" onClick={addStop}>
                  + Add Stop
                </Button>
              </div>

              {formData.stops.map((stop, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stop #{index + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStop(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1.5 block">City *</Label>
                      <Input
                        value={stop.city}
                        onChange={(e) => {
                          const newStops = [...formData.stops];
                          newStops[index].city = e.target.value;
                          setFormData({ ...formData, stops: newStops });
                        }}
                        placeholder="Vinh"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block">State/Province *</Label>
                      <Input
                        value={stop.state}
                        onChange={(e) => {
                          const newStops = [...formData.stops];
                          newStops[index].state = e.target.value;
                          setFormData({ ...formData, stops: newStops });
                        }}
                        placeholder="Nghe An"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1.5 block">Minutes from Start</Label>
                      <Input
                        type="number"
                        value={stop.minutesFromStart}
                        onChange={(e) => {
                          const newStops = [...formData.stops];
                          newStops[index].minutesFromStart = parseInt(e.target.value);
                          setFormData({ ...formData, stops: newStops });
                        }}
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block">Stop Order</Label>
                      <Input
                        type="number"
                        value={stop.stopOrder}
                        onChange={(e) => {
                          const newStops = [...formData.stops];
                          newStops[index].stopOrder = parseInt(e.target.value);
                          setFormData({ ...formData, stops: newStops });
                        }}
                        placeholder={String(index + 1)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Stop Type</Label>
                    <Select
                      value={stop.stopType}
                      onValueChange={(value: 'pickup' | 'dropoff' | 'both') => {
                        const newStops = [...formData.stops];
                        newStops[index].stopType = value;
                        setFormData({ ...formData, stops: newStops });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">Pick-up Only</SelectItem>
                        <SelectItem value="dropoff">Drop-off Only</SelectItem>
                        <SelectItem value="both">Both Pick-up & Drop-off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {isEditMode ? (
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Route'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
