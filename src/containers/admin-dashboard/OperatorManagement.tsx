'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetOperatorsQuery,
  useCreateOperatorMutation,
  useDeleteOperatorMutation,
  useGetBusesByOperatorQuery,
} from '@/lib/store/services/api';

export default function OperatorManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useGetOperatorsQuery({
    page: currentPage,
    limit,
  });
  const [createOperator, { isLoading: isCreating }] = useCreateOperatorMutation();
  const [deleteOperator, { isLoading: isDeleting }] = useDeleteOperatorMutation();

  const operators = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [busesDialogOpen, setBusesDialogOpen] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    description: '',
  });

  const handleCreate = async () => {
    try {
      // Validation
      if (!formData.companyName || !formData.email || !formData.phoneNumber || !formData.licenseNumber) {
        toast.error('All required fields must be filled');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Invalid email format');
        return;
      }

      // Phone validation (basic)
      if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
        toast.error('Phone number must have at least 10 digits');
        return;
      }

      const operatorData = {
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        licenseNumber: formData.licenseNumber,
        description: formData.description || undefined,
      };

      await createOperator(operatorData).unwrap();
      toast.success('Operator created successfully');
      setDialogOpen(false);
      setFormData({
        companyName: '',
        email: '',
        phoneNumber: '',
        licenseNumber: '',
        description: '',
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create operator');
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedOperatorId) return;
      await deleteOperator(selectedOperatorId).unwrap();
      toast.success('Operator deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedOperatorId(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete operator');
    }
  };

  const handleViewBuses = (operatorId: string) => {
    console.log('Opening buses dialog for operator:', operatorId);
    setSelectedOperatorId(operatorId);
    setBusesDialogOpen(true);
  };

  // Fetch buses for selected operator
  const {
    data: busesData,
    isLoading: isBusesLoading,
    error: busesError,
    refetch: refetchBuses,
  } = useGetBusesByOperatorQuery(
    { operatorId: selectedOperatorId || '', page: 1, limit: 100 },
    { skip: !selectedOperatorId || !busesDialogOpen }
  );

  // Refetch when dialog opens
  React.useEffect(() => {
    if (busesDialogOpen && selectedOperatorId) {
      refetchBuses();
    }
  }, [busesDialogOpen, selectedOperatorId, refetchBuses]);

  console.log('Buses data:', busesData);
  console.log('Buses loading:', isBusesLoading);
  console.log('Buses error:', busesError);

  const operatorBuses = busesData?.results || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Operator Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage bus operators and approve applications</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
          <ArrowLeft className="w-4 h-4 dark:text-gray-300" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Operators ({totalResults})</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>+ Add Operator</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-8">Failed to load operators</p>
          ) : operators.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No operators yet</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator: any) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">{operator.companyName}</TableCell>
                      <TableCell>{operator.email}</TableCell>
                      <TableCell>{operator.phoneNumber}</TableCell>
                      <TableCell className="text-sm">{operator.licenseNumber}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBuses(operator.id)}
                            className="gap-1"
                          >
                            <Bus className="w-3 h-3" />
                            View Buses
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedOperatorId(operator.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Operator</DialogTitle>
            <DialogDescription>Create a new bus operator account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g., Hanoi Express"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                placeholder="0123456789"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                placeholder="LICENSE123456"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Company description or notes"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Operator'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Operator</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this operator? This action cannot be undone.
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

      {/* View Buses Dialog */}
      <Dialog open={busesDialogOpen} onOpenChange={setBusesDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Operator Buses
            </DialogTitle>
            <DialogDescription>
              {selectedOperatorId && operators.find((op: any) => op.id === selectedOperatorId)?.companyName
                ? `List of buses for ${operators.find((op: any) => op.id === selectedOperatorId)?.companyName}`
                : 'List of buses for this operator'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!selectedOperatorId ? (
              <div className="text-center py-8 text-gray-500">
                <p>No operator selected</p>
              </div>
            ) : isBusesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : busesError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading buses</p>
                <p className="text-sm mt-2">{JSON.stringify(busesError)}</p>
              </div>
            ) : operatorBuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No buses found for this operator</p>
                <div className="mt-4 text-xs text-left max-w-md mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="mb-1">
                    <strong>Debug Info:</strong>
                  </p>
                  <p>Operator ID: {selectedOperatorId}</p>
                  <p>Total Results: {busesData?.totalResults || 0}</p>
                  <p>Response: {JSON.stringify(busesData)}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {operatorBuses.map((bus: any) => (
                  <div
                    key={bus.id}
                    className="p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{bus.busNumber}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {bus.busType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">License:</span> {bus.licensePlate}
                          </div>
                          <div>
                            <span className="font-medium">Seats:</span> {bus.totalSeats}
                          </div>
                          {bus.model && (
                            <div>
                              <span className="font-medium">Model:</span> {bus.model}
                            </div>
                          )}
                          {bus.yearOfManufacture && (
                            <div>
                              <span className="font-medium">Year:</span> {bus.yearOfManufacture}
                            </div>
                          )}
                        </div>
                        {bus.amenities && bus.amenities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {bus.amenities.map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBusesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
