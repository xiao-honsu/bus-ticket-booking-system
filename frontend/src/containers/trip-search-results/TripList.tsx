'use client';

import { useSearchTripsQuery } from '@/lib/store/services/api';
import TripCard from './TripCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface TripListProps {
  origin: string;
  destination: string;
  date: string;
}

export default function TripList({ origin, destination, date }: TripListProps) {
  const [sortBy, setSortBy] = useState('departure');
  
  const { data, isLoading, isError, error } = useSearchTripsQuery(
    { origin, destination, date },
    { skip: !origin || !destination || !date }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">
          Failed to load trips. {(error as any)?.data?.message || 'Please try again.'}
        </p>
      </div>
    );
  }

  let trips = [...(data?.results || [])];

  // Sort trips based on selection
  trips.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration':
        const durationA = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const durationB = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return durationA - durationB;
      default:
        return 0;
    }
  });

  if (trips.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No trips found for your search criteria.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your search parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">Available Trips</h2>
          <p className="text-gray-600 text-sm">{trips.length} trips found</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="departure">Departure Time</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="duration">Duration: Shortest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {trips.map((trip: any) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
