'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LocationCombobox from '@/components/LocationCombobox';
import DepartureDatePicker from '@/components/DepartureDatePicker';
import TripFilters, { TripFilterValues } from '@/components/TripFilters';
import { useSearchTripsQuery } from '@/lib/store/services/api';
import { ArrowRight, Users, Clock, Star, Search, Bus, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LiquidEther from '@/components/ui/liquid-ether';

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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

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

    // Add pagination
    params.page = currentPage;
    params.limit = ITEMS_PER_PAGE;

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
    currentPage,
  ]);

  // Reactive query - automatically fetches when queryParams change
  const { data, isLoading, error, refetch } = useSearchTripsQuery(queryParams);

  const trips = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

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
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative min-h-screen">
      {/* LiquidEther Background */}
      <LiquidEther className="opacity-40" />

      <div className="relative z-10">
        {/* Search Header Card */}
        <Card className="mb-8 border-none shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Bus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Find Your Perfect Journey</CardTitle>
                <p className="text-muted-foreground mt-1">Book comfortable bus tickets at the best prices</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <LocationCombobox
                label="From"
                placeholder="Select origin city"
                value={searchForm.origin}
                onSelect={(cityName, displayName) =>
                  setSearchForm({ ...searchForm, origin: cityName, originDisplay: displayName })
                }
                excludeCity={searchForm.destination}
              />
              <LocationCombobox
                label="To"
                placeholder="Select destination city"
                value={searchForm.destination}
                onSelect={(cityName, displayName) =>
                  setSearchForm({ ...searchForm, destination: cityName, destinationDisplay: displayName })
                }
                excludeCity={searchForm.origin}
              />
              <DepartureDatePicker
                label="Departure Date"
                placeholder="Select date"
                value={searchForm.departureDate}
                onChange={(dateString) => setSearchForm({ ...searchForm, departureDate: dateString })}
              />
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full h-9" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Search Buses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <Card className="py-0 gap-0 mb-6 border-none bg-card/80 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {searchForm.origin || searchForm.destination ? 'Search Results' : 'All Available Trips'}
                </h1>
                {searchForm.originDisplay && searchForm.destinationDisplay ? (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{searchForm.originDisplay}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-medium">{searchForm.destinationDisplay}</span>
                    {searchForm.departureDate && (
                      <>
                        <Separator orientation="vertical" className="h-4 mx-2" />
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(searchForm.departureDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1">
                    Browse all available bus trips or use filters to narrow your search
                  </p>
                )}
              </div>
              {trips.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {totalResults} trip{totalResults !== 1 ? 's' : ''} found
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Grid */}
      <div className="relative z-10">
        <div className="flex flex-wrap gap-6">
          {/* Filters Sidebar */}
          <aside className="flex-[1_0_150px]">
            <TripFilters filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
          </aside>

          {/* Trip List */}
          <div className="flex-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="h-24 w-24 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-24 w-32" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-destructive/10">
                    <span className="text-4xl">😔</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-destructive">Failed to load trips</p>
                    <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
                  </div>
                  <Button onClick={handleSearch} variant="outline">
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : trips.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">No trips found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria or filters</p>
                  </div>
                  <Button onClick={handleResetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {trips.map((trip: any) => (
                    <TripCard key={trip.id || trip._id} trip={trip} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              className="min-w-9"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="flex items-center px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Trip Card Component
function TripCard({ trip }: { trip: any }) {
  const router = useRouter();

  const departureTime = new Date(trip.departureTime);
  const arrivalTime = new Date(trip.arrivalTime);
  const duration = Math.floor((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    ((arrivalTime.getTime() - departureTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
  );
  const tripId = trip.id || trip._id;

  return (
    <Card
      className="gap-0 py-0 group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 bg-card/80 backdrop-blur-sm"
      onClick={() => router.push(`/trip-detail/${tripId}`)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {/* Left: Operator & Route Info */}
          <div className="flex-1 space-y-4">
            {/* Operator Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {trip.operator?.name || 'Bus Operator'}
                  </h3>
                  {trip.operator?.rating && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {typeof trip.operator.rating === 'number' ? trip.operator.rating : trip.operator.rating.overall}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({trip.operator.rating.totalReviews || trip.operator.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {trip.bus?.busType || 'Standard'}
              </Badge>
            </div>

            {/* Route Timeline */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {/* Departure */}
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-foreground">
                    {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-sm font-medium mt-1">{trip.route?.origin?.city}</p>
                  <p className="text-xs text-muted-foreground">Departure</p>
                </div>

                {/* Duration */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">
                      {duration}h {durationMinutes > 0 ? `${durationMinutes}m` : ''}
                    </span>
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <span className="text-xs text-muted-foreground">{trip.route?.distance || 0} km</span>
                </div>

                {/* Arrival */}
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-foreground">
                    {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-sm font-medium mt-1">{trip.route?.destination?.city}</p>
                  <p className="text-xs text-muted-foreground">Arrival</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {trip.bus.amenities.slice(0, 4).map((amenity: string) => (
                  <Badge key={amenity} variant="outline" className="text-xs font-normal">
                    {amenity.replace('_', ' ')}
                  </Badge>
                ))}
                {trip.bus.amenities.length > 4 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{trip.bus.amenities.length - 4} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: Pricing & CTA */}
          <div className="lg:w-48 flex flex-col justify-between items-end gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Price per seat</p>
              <p className="text-3xl font-bold text-primary">{trip.pricePerSeat?.toLocaleString() || 0}₫</p>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-end gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span
                  className={`text-sm font-medium ${
                    trip.availableSeats < 5
                      ? 'text-destructive'
                      : trip.availableSeats < 10
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {trip.availableSeats} seats left
                </span>
              </div>
              <Button className="w-full" size="sm">
                Select Seats
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Global LiquidEther Background */}
      <LiquidEther className="fixed inset-0 opacity-30" />

      <div className="container relative z-10 mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-11" />
                </div>
              </Card>
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
      </div>
    </main>
  );
}
