'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function TripManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleSubmit = () => {
    // TODO: Implement API call
    setDialogOpen(false);
  };

  const checkConflicts = () => {
    if (formData.busId && formData.departureDate) {
      setHasConflict(false);
      setConflictMessage('✅ Bus is available for selected time slot');
    } else {
      setConflictMessage('Please select bus and departure time first');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trip Management</h2>
          <Button onClick={() => setDialogOpen(true)}>+ Add Trip</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Available Seats</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">HCM - Da Lat</td>
                <td className="px-4 py-3">Nov 25, 2025</td>
                <td className="px-4 py-3">08:00</td>
                <td className="px-4 py-3">25/40</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Scheduled
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
              <Label htmlFor="route" className="mb-1.5 block">Select Route *</Label>
              <Select value={formData.routeId} onValueChange={(value) => setFormData({ ...formData, routeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">No routes available - Connect API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bus Selection */}
            <div>
              <Label htmlFor="bus" className="mb-1.5 block">Select Bus *</Label>
              <Select value={formData.busId} onValueChange={(value) => setFormData({ ...formData, busId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">No buses available - Connect API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Departure Time */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Departure</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="depDate" className="mb-1.5 block">Date *</Label>
                  <Input
                    id="depDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="depTime" className="mb-1.5 block">Time *</Label>
                  <Input
                    id="depTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Arrival Time */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Arrival</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="arrDate" className="mb-1.5 block">Date *</Label>
                  <Input
                    id="arrDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="arrTime" className="mb-1.5 block">Time *</Label>
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
              <Label htmlFor="price" className="mb-1.5 block">Price per Seat (VND) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={formData.pricePerSeat}
                onChange={(e) => setFormData({ ...formData, pricePerSeat: parseFloat(e.target.value) })}
                placeholder="500000"
              />
              <p className="text-xs text-gray-500 mt-1">Base price, modifiers will apply based on seat type</p>
            </div>

            <Separator />

            {/* Driver Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Driver Information</h3>
              <div>
                <Label htmlFor="driverName">Driver Name *</Label>
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
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="driverName" className="mb-1.5 block">Driver Name *</Label>
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
                  <Label htmlFor="driverLicense" className="mb-1.5 block">License Number *</Label>
                  <Input
                    id="driverLicense"
                    value={formData.driver.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        driver: { ...formData.driver, licenseNumber: e.target.value },
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
              <Button type="button" variant="outline" className="w-full" onClick={checkConflicts}>
                🔍 Check Bus Availability
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
            <Button onClick={handleSubmit} disabled={hasConflict}>
              Create Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
