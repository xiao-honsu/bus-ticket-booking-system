'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Filter,
  ArrowUpDown,
  Clock,
  Bus,
  Users,
  Wifi,
  Snowflake,
  Zap,
  Tv,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'charging_port', label: 'Charging Port', icon: Zap },
  { id: 'entertainment', label: 'Entertainment', icon: Tv },
  { id: 'blanket', label: 'Blanket', icon: null },
  { id: 'water', label: 'Water', icon: null },
  { id: 'snacks', label: 'Snacks', icon: null },
  { id: 'reading_light', label: 'Reading Light', icon: null },
];

const BUS_TYPES = [
  { value: 'sleeper', label: 'Sleeper', emoji: '🛏️' },
  { value: 'seater', label: 'Seater', emoji: '💺' },
  { value: 'semi-sleeper', label: 'Semi-Sleeper', emoji: '🪑' },
];

const SORT_OPTIONS = [
  { value: 'departureTime', label: 'Departure Time', icon: Clock },
  { value: 'price', label: 'Price', icon: null },
  { value: 'duration', label: 'Duration', icon: null },
  { value: 'rating', label: 'Rating', icon: null },
];

export default function TripFilters({ filters, onFiltersChange, onReset }: TripFiltersProps) {
  const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false);

  const updateFilter = (key: keyof TripFilterValues, value: unknown) => {
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

  const activeFilterCount = [
    filters.busType !== '',
    filters.amenities.length > 0,
    filters.timeRange.from !== '' || filters.timeRange.to !== '',
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000000,
    filters.minAvailableSeats > 0,
  ].filter(Boolean).length;

  return (
    <Card className="sticky top-4 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort By Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            Sort By
          </Label>
          <div className="flex gap-2">
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="flex-1 min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      {option.icon && <option.icon className="h-4 w-4 text-muted-foreground" />}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className={cn('', filters.sortOrder === 'asc' ? 'bg-secondary' : 'bg-secondary')}
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Price Range Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Price Range</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {(filters.priceRange[0] / 1000).toFixed(0)}K - {(filters.priceRange[1] / 1000).toFixed(0)}K
            </Badge>
          </div>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              min={0}
              max={2000000}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0₫</span>
              <span>2,000,000₫</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Departure Time Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Departure Time
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="time"
                value={filters.timeRange.from}
                onChange={(e) =>
                  updateFilter('timeRange', {
                    ...filters.timeRange,
                    from: e.target.value,
                  })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="time"
                value={filters.timeRange.to}
                onChange={(e) =>
                  updateFilter('timeRange', {
                    ...filters.timeRange,
                    to: e.target.value,
                  })
                }
                className="h-10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Bus Type Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bus className="h-4 w-4 text-muted-foreground" />
              Bus Type
            </Label>
            {filters.busType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('busType', '')}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {BUS_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={filters.busType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('busType', filters.busType === type.value ? '' : type.value)}
                className="justify-start h-10"
              >
                <span className="mr-2">{type.emoji}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Minimum Available Seats Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Min. Seats
            </Label>
            <Badge variant={filters.minAvailableSeats > 0 ? 'default' : 'outline'}>
              {filters.minAvailableSeats === 0 ? 'Any' : `${filters.minAvailableSeats}+`}
            </Badge>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.minAvailableSeats]}
              onValueChange={(value) => updateFilter('minAvailableSeats', value[0])}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Any</span>
              <span>10+ seats</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenities Section */}
        <Collapsible open={isAmenitiesExpanded} onOpenChange={setIsAmenitiesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
              <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                Amenities
                {filters.amenities.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.amenities.length}
                  </Badge>
                )}
              </Label>
              {isAmenitiesExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 gap-2">
              {AMENITIES.map((amenity) => {
                const isChecked = filters.amenities.includes(amenity.id);
                return (
                  <div
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all',
                      isChecked
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <Checkbox
                      id={amenity.id}
                      checked={isChecked}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {amenity.icon ? (
                        <amenity.icon className={cn('h-4 w-4', isChecked ? 'text-primary' : 'text-muted-foreground')} />
                      ) : (
                        <span className="text-sm">•</span>
                      )}
                      <label
                        htmlFor={amenity.id}
                        className={cn(
                          'text-sm cursor-pointer select-none',
                          isChecked ? 'font-medium text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {amenity.label}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
