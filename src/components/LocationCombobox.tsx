'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useGetAllLocationsQuery } from '@/lib/store/services/api';

interface LocationComboboxProps {
  label: string;
  placeholder?: string;
  value?: string;
  onSelect: (cityName: string, displayName: string) => void;
  disabled?: boolean;
  className?: string;
  excludeCity?: string; // Exclude a city from the list (e.g., exclude origin from destination)
}

export default function LocationCombobox({
  label,
  placeholder = 'Select city...',
  value,
  onSelect,
  disabled = false,
  className,
  excludeCity,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);

  // Fetch all locations - RTK Query will cache this
  const { data: locations = [], isLoading } = useGetAllLocationsQuery();

  // Filter out excluded city and memoize
  const filteredLocations = useMemo(() => {
    if (!excludeCity) return locations;
    return locations.filter((loc) => loc.city.toLowerCase() !== excludeCity.toLowerCase());
  }, [locations, excludeCity]);

  // Find selected location for display
  const selectedLocation = useMemo(() => {
    if (!value) return null;
    return locations.find((loc) => loc.city.toLowerCase() === value.toLowerCase());
  }, [locations, value]);

  const handleSelect = (currentValue: string) => {
    const location = locations.find((loc) => loc.value.toLowerCase() === currentValue.toLowerCase());
    if (location) {
      // If same value is selected, deselect
      if (value?.toLowerCase() === currentValue.toLowerCase()) {
        onSelect('', '');
      } else {
        onSelect(location.city, location.label);
      }
    }
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <Label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedLocation ? (
              <span className="truncate">{selectedLocation.label}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search city..." />
            <CommandList>
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem key={location.value} value={location.value} onSelect={handleSelect}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.toLowerCase() === location.value.toLowerCase() ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{location.city}</span>
                      <span className="text-xs text-muted-foreground">{location.state}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
