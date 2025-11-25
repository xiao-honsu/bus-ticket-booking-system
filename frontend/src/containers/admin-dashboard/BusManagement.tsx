'use client';

import {
  useGetBusesQuery,
  useCreateBusMutation,
  useDeleteBusMutation,
} from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BusManagement() {
  const { data, isLoading, error } = useGetBusesQuery({ page: 1, limit: 20 });
  const [createBus, { isLoading: isCreating }] = useCreateBusMutation();
  const [deleteBus, { isLoading: isDeleting }] = useDeleteBusMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'standard',
    totalSeats: 40,
    operatorId: '',
  });

  const handleCreate = async () => {
    try {
      await createBus(formData).unwrap();
      toast.success('Bus created successfully');
      setDialogOpen(false);
      setFormData({ plateNumber: '', type: 'standard', totalSeats: 40, operatorId: '' });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create bus');
    }
  };

  const handleDelete = async () => {
    if (!selectedBusId) return;

    try {
      await deleteBus(selectedBusId).unwrap();
      toast.success('Bus deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedBusId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete bus');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bus Management</CardTitle>
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
          <CardTitle>Bus Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load buses</p>
        </CardContent>
      </Card>
    );
  }

  const buses = data?.results || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bus Management</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>+ Add Bus</Button>
        </CardHeader>
        <CardContent>
          {buses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No buses yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus: any) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.plateNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{bus.type}</Badge>
                    </TableCell>
                    <TableCell>{bus.totalSeats} seats</TableCell>
                    <TableCell>{bus.operator?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedBusId(bus.id);
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
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
            <DialogDescription>Enter bus details to add a new bus to the fleet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="51B-12345"
              />
            </div>
            <div>
              <Label htmlFor="type">Bus Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="sleeper">Sleeper</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input
                id="totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Bus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bus</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bus? This action cannot be undone.
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
