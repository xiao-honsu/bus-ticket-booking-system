'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

export interface TripFilterValues {
  priceRange: [number, number];
  timeRange: { from: string; to: string };
  busType: string;
  amenities: string[];
  minAvailableSeats: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TripFiltersProps {
  filters: TripFilterValues;
  onFiltersChange: (filters: TripFilterValues) => void;
  onReset: () => void;
}

const AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'charging_port', label: 'Charging Port' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'blanket', label: 'Blanket' },
  { id: 'water', label: 'Water' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'reading_light', label: 'Reading Light' },
];

const BUS_TYPES = [
  { value: 'sleeper', label: 'Sleeper' },
  { value: 'seater', label: 'Seater' },
  { value: 'semi-sleeper', label: 'Semi-Sleeper' },
];

const SORT_OPTIONS = [
  { value: 'departureTime', label: 'Departure Time' },
  { value: 'price', label: 'Price' },
  { value: 'duration', label: 'Duration' },
  { value: 'rating', label: 'Rating' },
];

export default function TripFilters({ filters, onFiltersChange, onReset }: TripFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof TripFilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter((a) => a !== amenityId)
      : [...filters.amenities, amenityId];
    updateFilter('amenities', newAmenities);
  };

  const hasActiveFilters =
    filters.busType !== '' ||
    filters.amenities.length > 0 ||
    filters.timeRange.from !== '' ||
    filters.timeRange.to !== '' ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 2000000 ||
    filters.minAvailableSeats > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sort By</Label>
          <div className="flex gap-2">
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Price Range</Label>
            <span className="text-xs text-gray-600">
              {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} VND
            </span>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Min Price</Label>
              <input
                type="range"
                min={0}
                max={2000000}
                step={50000}
                value={filters.priceRange[0]}
                onChange={(e) =>
                  updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]] as [number, number])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Max Price</Label>
              <input
                type="range"
                min={0}
                max={2000000}
                step={50000}
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)] as [number, number])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Time Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Departure Time</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">From</Label>
              <Input
                type="time"
                value={filters.timeRange.from}
                onChange={(e) =>
                  updateFilter('timeRange', {
                    ...filters.timeRange,
                    from: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">To</Label>
              <Input
                type="time"
                value={filters.timeRange.to}
                onChange={(e) =>
                  updateFilter('timeRange', {
                    ...filters.timeRange,
                    to: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Bus Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Bus Type</Label>
            {filters.busType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('busType', '')}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <Select value={filters.busType || undefined} onValueChange={(value) => updateFilter('busType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All bus types" />
            </SelectTrigger>
            <SelectContent>
              {BUS_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Available Seats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Min. Available Seats</Label>
            <span className="text-xs text-gray-600">{filters.minAvailableSeats}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={filters.minAvailableSeats}
            onChange={(e) => updateFilter('minAvailableSeats', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Amenities</Label>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 px-2 text-xs">
              {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
          <div className="space-y-2">
            {AMENITIES.slice(0, isExpanded ? AMENITIES.length : 4).map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={filters.amenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
