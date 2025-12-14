'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import TripFilters, { TripFilterValues } from '@/components/TripFilters';
import { useSearchTripsQuery } from '@/lib/store/services/api';
import { Calendar, ArrowRight, Users, Clock, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchForm, setSearchForm] = useState({
    origin: searchParams.get('origin') || '',
    originDisplay: '',
    destination: searchParams.get('destination') || '',
    destinationDisplay: '',
    departureDate: searchParams.get('date') || '',
  });

  const [filters, setFilters] = useState<TripFilterValues>({
    priceRange: [0, 2000000],
    timeRange: { from: '', to: '' },
    busType: '',
    amenities: [],
    minAvailableSeats: 0,
    sortBy: 'departureTime',
    sortOrder: 'asc',
  });

  // Extract values before useMemo for proper dependency tracking
  const minPrice = filters.priceRange[0];
  const maxPrice = filters.priceRange[1];
  const amenitiesStr = filters.amenities.join(',');
  const amenitiesLength = filters.amenities.length;

  // Build query params - memoized to trigger re-fetch when dependencies change
  const queryParams = useMemo(() => {
    const params: any = {};

    // Add search criteria if present
    if (searchForm.origin) params.origin = searchForm.origin;
    if (searchForm.destination) params.destination = searchForm.destination;
    if (searchForm.departureDate) params.departureDate = searchForm.departureDate;

    // Add filters - only if they differ from defaults
    if (minPrice > 0) params.minPrice = minPrice;
    if (maxPrice < 2000000) params.maxPrice = maxPrice;
    if (filters.timeRange.from) params.departureTimeFrom = filters.timeRange.from;
    if (filters.timeRange.to) params.departureTimeTo = filters.timeRange.to;
    if (filters.busType) params.busType = filters.busType;
    if (amenitiesLength) params.amenities = amenitiesStr;
    if (filters.minAvailableSeats > 0) params.minAvailableSeats = filters.minAvailableSeats;

    // Always include sorting
    params.sortBy = filters.sortBy;
    params.sortOrder = filters.sortOrder;

    console.log('🔍 Search Query Params:', params);
    return params;
  }, [
    searchForm.origin,
    searchForm.destination,
    searchForm.departureDate,
    minPrice,
    maxPrice,
    filters.timeRange.from,
    filters.timeRange.to,
    filters.busType,
    amenitiesStr,
    amenitiesLength,
    filters.minAvailableSeats,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Reactive query - automatically fetches when queryParams change
  const { data, isLoading, error, refetch } = useSearchTripsQuery(queryParams);

  const trips = data?.results || [];

  const handleSearch = () => {
    // Force refetch with current params when button is clicked
    refetch();
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 2000000],
      timeRange: { from: '', to: '' },
      busType: '',
      amenities: [],
      minAvailableSeats: 0,
      sortBy: 'departureTime',
      sortOrder: 'asc',
    });
  };

  return (
    <>
      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LocationAutocomplete
            label="From"
            placeholder="Select origin city"
            value={searchForm.origin}
            onSelect={(cityName, displayName) =>
              setSearchForm({ ...searchForm, origin: cityName, originDisplay: displayName })
            }
          />
          <LocationAutocomplete
            label="To"
            placeholder="Select destination city"
            value={searchForm.destination}
            onSelect={(cityName, displayName) =>
              setSearchForm({ ...searchForm, destination: cityName, destinationDisplay: displayName })
            }
          />
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Departure Date</label>
            <Input
              type="date"
              value={searchForm.departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full" size="lg">
              Search Buses
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {searchForm.origin || searchForm.destination ? 'Search Results' : 'All Available Trips'}
        </h1>
        {searchForm.originDisplay && searchForm.destinationDisplay ? (
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-medium">{searchForm.originDisplay}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium">{searchForm.destinationDisplay}</span>
            {searchForm.departureDate && (
              <>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(searchForm.departureDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="text-muted-foreground">Browse all available bus trips or use filters to narrow your search</p>
        )}
        {trips.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {trips.length} trip{trips.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <TripFilters filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
        </aside>

        {/* Trip List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-600 mb-2">Failed to load trips</p>
              <p className="text-sm text-gray-600">Please try again later</p>
            </Card>
          ) : trips.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-2">No trips found</p>
              <p className="text-sm text-gray-500">Try adjusting your search criteria or filters</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {trips.map((trip: any) => (
                <TripCard key={trip.id || trip._id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Enhanced Trip Card Component
function TripCard({ trip }: { trip: any }) {
  const router = useRouter();

  const departureTime = new Date(trip.departureTime);
  const arrivalTime = new Date(trip.arrivalTime);
  const duration = Math.floor((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));
  const tripId = trip.id || trip._id;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/trip-detail/${tripId}`)}
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Left: Operator & Bus Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{trip.operator?.name || 'Bus Operator'}</h3>
              {trip.operator?.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {typeof trip.operator.rating === 'number' ? trip.operator.rating : trip.operator.rating.overall}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({trip.operator.rating.totalReviews || trip.operator.totalReviews || 0} reviews)
                  </span>
                </div>
              )}
            </div>
            <Badge variant={trip.bus?.busType === 'sleeper' ? 'default' : 'secondary'} className="capitalize">
              {trip.bus?.busType || 'Standard'}
            </Badge>
          </div>

          {/* Route & Time */}
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-600">{trip.route?.origin?.city}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">{duration}h journey</p>
              <div className="w-full h-px bg-gray-300 relative">
                <ArrowRight className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-600">{trip.route?.destination?.city}</p>
            </div>
          </div>

          {/* Amenities */}
          {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.bus.amenities.slice(0, 4).map((amenity: string) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity.replace('_', ' ')}
                </Badge>
              ))}
              {trip.bus.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{trip.bus.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right: Pricing & CTA */}
        <div className="md:w-48 flex flex-col justify-between items-end text-right">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {trip.pricePerSeat?.toLocaleString() || trip.price?.toLocaleString()} ₫
            </p>
            <p className="text-xs text-gray-600">per seat</p>
          </div>

          <div className="space-y-2 w-full">
            <div className="flex items-center justify-end gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className={trip.availableSeats < 5 ? 'text-red-600 font-medium' : 'text-green-600'}>
                {trip.availableSeats} seats left
              </span>
            </div>
            <Button className="w-full" size="lg">
              Select Seats
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Skeleton className="h-96" />
              <div className="lg:col-span-3 space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
