'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface SearchFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Departure Time</Label>
          <Select defaultValue="any">
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
              <SelectItem value="evening">Evening (6PM - 12AM)</SelectItem>
              <SelectItem value="night">Night (12AM - 6AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Bus Type</Label>
          <div className="space-y-3">
            {['Standard', 'Deluxe', 'Sleeper', 'VIP'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type.toLowerCase()} />
                <label
                  htmlFor={type.toLowerCase()}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Price Range</Label>
          <Select defaultValue="any">
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any price</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Amenities</Label>
          <div className="space-y-3">
            {['WiFi', 'AC', 'Restroom', 'Charging Port'].map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox id={amenity.toLowerCase().replace(' ', '-')} />
                <label
                  htmlFor={amenity.toLowerCase().replace(' ', '-')}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
