'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setSearchParams } from '@/lib/store/features/trip/tripSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { toast } from 'sonner';

export default function SearchForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchData, setSearchData] = useState({
    origin: '',
    originDisplay: '',
    destination: '',
    destinationDisplay: '',
    date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Always allow navigation to search page
    // If all fields are empty, show all trips
    try {
      // Build search params with filled fields (using exact city names from autocomplete)
      const searchParamsObj: any = {};
      if (searchData.origin && searchData.origin.trim()) searchParamsObj.origin = searchData.origin.trim();
      if (searchData.destination && searchData.destination.trim())
        searchParamsObj.destination = searchData.destination.trim();
      if (searchData.date && searchData.date.trim()) searchParamsObj.date = searchData.date.trim();

      // Store in Redux
      dispatch(
        setSearchParams({
          origin: searchData.origin || '',
          destination: searchData.destination || '',
          date: searchData.date || '',
        })
      );

      // Navigate with only filled fields
      const searchParams = new URLSearchParams(searchParamsObj);
      const hasAnyFilter = Object.keys(searchParamsObj).length > 0;

      router.push(`/search?${searchParams.toString()}`);
      toast.success(hasAnyFilter ? 'Searching for trips...' : 'Showing all available trips...');
    } catch (error) {
      toast.error('Failed to search trips. Please try again.');
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 -mt-10 relative z-10 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LocationAutocomplete
          label="From"
          placeholder="Select origin city"
          value={searchData.origin}
          onSelect={(cityName, displayName) =>
            setSearchData({ ...searchData, origin: cityName, originDisplay: displayName })
          }
        />
        <LocationAutocomplete
          label="To"
          placeholder="Select destination city"
          value={searchData.destination}
          onSelect={(cityName, displayName) =>
            setSearchData({ ...searchData, destination: cityName, destinationDisplay: displayName })
          }
        />
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            value={searchData.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
