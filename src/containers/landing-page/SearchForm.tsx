'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { setSearchParams } from '@/lib/store/features/trip/tripSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LocationCombobox from '@/components/LocationCombobox';
import DepartureDatePicker from '@/components/DepartureDatePicker';
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
      // Build search params with filled fields (using exact city names from combobox)
      const searchParamsObj: Record<string, string> = {};
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

  return (
    <Card className="shadow-lg -mt-10 relative z-10 max-w-4xl mx-auto border-border bg-card">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <LocationCombobox
            label="From"
            placeholder="Select origin city"
            value={searchData.origin}
            onSelect={(cityName, displayName) =>
              setSearchData({ ...searchData, origin: cityName, originDisplay: displayName })
            }
            excludeCity={searchData.destination}
          />
          <LocationCombobox
            label="To"
            placeholder="Select destination city"
            value={searchData.destination}
            onSelect={(cityName, displayName) =>
              setSearchData({ ...searchData, destination: cityName, destinationDisplay: displayName })
            }
            excludeCity={searchData.origin}
          />
          <DepartureDatePicker
            label="Date"
            placeholder="Select date"
            value={searchData.date}
            onChange={(dateString) => setSearchData({ ...searchData, date: dateString })}
          />
          <div className="flex items-end">
            <Button type="submit" className="w-full gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
