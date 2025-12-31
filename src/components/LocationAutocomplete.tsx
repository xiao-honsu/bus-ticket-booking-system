'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchLocationsQuery } from '@/lib/store/services/api';
import { Input } from '@/components/ui/input';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  city: string;
  state: string;
  country?: string;
  code?: string;
}

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value?: string;
  onSelect: (locationId: string, locationName: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function LocationAutocomplete({
  label,
  placeholder = 'Search city...',
  value,
  onSelect,
  disabled = false,
  className,
}: LocationAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with external value prop - initialize from URL params
  useEffect(() => {
    if (value && value !== '' && value !== searchQuery) {
      // If we have a value from URL/parent, show it
      setSearchQuery(value);
    } else if (!value || value === '') {
      setSelectedLocation(null);
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch locations
  const { data, isLoading, isFetching } = useSearchLocationsQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const locations: Location[] = data?.results || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (location: Location) => {
      setSelectedLocation(location);
      // Pass exact city name for API, and display name for UI
      onSelect(location.city, `${location.city}, ${location.state}`);
      setShowDropdown(false);
      // Keep the display text instead of clearing
      setSearchQuery(`${location.city}, ${location.state}`);
    },
    [onSelect]
  );

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setShowDropdown(false);
    onSelect('', '');
  };

  // Handle manual input - update parent when user finishes typing
  const handleBlur = () => {
    if (searchQuery && !selectedLocation) {
      // User typed something but didn't select from dropdown
      // Pass the typed value as-is to parent
      onSelect(searchQuery, searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery && !selectedLocation) {
      // User pressed Enter with typed text
      onSelect(searchQuery, searchQuery);
      setShowDropdown(false);
    }
  };

  return (
    <div className={cn('flex flex-col space-y-2 relative', className)} ref={wrapperRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
            // Clear selection when user types
            if (selectedLocation) {
              setSelectedLocation(null);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {(selectedLocation || searchQuery) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto min-w-[300px] w-max max-w-xl">
          {isLoading || isFetching ? (
            <div className="py-4 text-center text-sm text-gray-500">Searching...</div>
          ) : locations.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">No cities found</div>
          ) : (
            <ul>
              {locations.map((location) => (
                <li
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className={cn(
                    'px-4 py-4 cursor-pointer hover:bg-blue-50 flex items-start gap-3',
                    selectedLocation?.id === location.id && 'bg-blue-100'
                  )}
                >
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 whitespace-nowrap text-base">{location.city}</div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {location.state}
                      {location.country && `, ${location.country}`}
                      {location.code && ` (${location.code})`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showDropdown && searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-4 text-center text-sm text-gray-500 min-w-[300px] w-max max-w-xl">
          Type at least 2 characters to search
        </div>
      )}
    </div>
  );
}
