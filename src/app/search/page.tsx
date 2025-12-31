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

    // Add search criteria if present - IMPORTANT: origin and destination are city names
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
    console.log(
      '📍 Origin:',
      searchForm.origin,
      '| Destination:',
      searchForm.destination,
      '| Date:',
      searchForm.departureDate
    );
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
  const { data, isLoading, error, refetch } = useSearchTripsQuery(queryParams, {
    // Skip initial query if no search criteria
    skip: false, // Always fetch to show all trips initially
  });

  const trips = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.totalResults || 0;

  const handleSearch = () => {
    console.log('🔍 Search button clicked');
    console.log('Search form state:', searchForm);

    // Reset to first page when new search is performed
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on page 1, manually trigger refetch
      refetch();
    }
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
    <div className="relative">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Enhanced Search Bar with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full -ml-28 -mb-28" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg flex items-center justify-center gap-3">
                <span className="text-5xl">🚍</span>
                Find Your Perfect Journey
              </h2>
              <p className="text-white/90 text-lg font-medium">Book comfortable bus tickets at the best prices</p>
            </div>

            {/* Search Form */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <LocationAutocomplete
                    label="From"
                    placeholder="Select origin city"
                    value={searchForm.origin}
                    onSelect={(cityName, displayName) =>
                      setSearchForm({ ...searchForm, origin: cityName, originDisplay: displayName })
                    }
                  />
                </div>
                <div className="transform transition-all duration-300 hover:scale-105">
                  <LocationAutocomplete
                    label="To"
                    placeholder="Select destination city"
                    value={searchForm.destination}
                    onSelect={(cityName, displayName) =>
                      setSearchForm({ ...searchForm, destination: cityName, destinationDisplay: displayName })
                    }
                  />
                </div>
                <div className="flex flex-col space-y-2 transform transition-all duration-300 hover:scale-105">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Departure Date
                  </label>
                  <Input
                    type="date"
                    value={searchForm.departureDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                    className="w-full h-11 border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    size="lg"
                  >
                    🔍 Search Buses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Results Header */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-100">
          <h1 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            {searchForm.origin || searchForm.destination ? (
              <>
                <span className="text-2xl">✨</span>
                Search Results
              </>
            ) : (
              <>
                <span className="text-2xl">🎫</span>
                All Available Trips
              </>
            )}
          </h1>
          {searchForm.originDisplay && searchForm.destinationDisplay ? (
            <div className="flex flex-wrap items-center gap-3 text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <span className="text-xl">📍</span>
                <span>{searchForm.originDisplay}</span>
                <ArrowRight className="h-5 w-5 text-purple-600 animate-pulse" />
                <span>{searchForm.destinationDisplay}</span>
              </div>
              {searchForm.departureDate && (
                <>
                  <span className="text-purple-400">•</span>
                  <div className="flex items-center gap-2 text-sm bg-white/80 px-4 py-2 rounded-full shadow-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {new Date(searchForm.departureDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-lg">
              🌟 Browse all available bus trips or use filters to narrow your search
            </p>
          )}
          {trips.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-base font-bold shadow-md">
                ✅ {totalResults} trip{totalResults !== 1 ? 's' : ''} found
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-2 border-blue-300">
                📄 Page {currentPage} of {totalPages}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <TripFilters filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
            </div>
          </aside>

          {/* Trip List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-red-200">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-red-600 text-xl font-bold mb-2">Failed to load trips</p>
                <p className="text-sm text-gray-600">Please try again later</p>
                <Button onClick={handleSearch} className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600">
                  🔄 Try Again
                </Button>
              </Card>
            ) : trips.length === 0 ? (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-yellow-200">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-700 text-xl font-bold mb-2">No trips found</p>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-2 border-purple-300 hover:bg-purple-50"
                >
                  🔄 Reset Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className="space-y-5">
                  {trips.map((trip: any, index: number) => (
                    <div
                      key={trip.id || trip._id}
                      className="animate-in slide-in-from-bottom-4 fade-in duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TripCard trip={trip} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="border-2 border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </Button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and adjacent pages
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <Button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              variant={currentPage === page ? 'default' : 'outline'}
                              className={
                                currentPage === page
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold min-w-[40px]'
                                  : 'border-2 border-blue-200 hover:bg-blue-50 min-w-[40px]'
                              }
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="flex items-center px-2 text-gray-400">
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
                      className="border-2 border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
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

// Enhanced Trip Card Component
function TripCard({ trip }: { trip: any }) {
  const router = useRouter();

  const departureTime = new Date(trip.departureTime);
  const arrivalTime = new Date(trip.arrivalTime);
  const duration = Math.floor((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));
  const tripId = trip.id || trip._id;

  return (
    <Card
      className="p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-blue-100 hover:border-purple-300 rounded-2xl transform hover:scale-[1.02] group relative overflow-hidden"
      onClick={() => router.push(`/trip-detail/${tripId}`)}
    >
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
        {/* Left: Operator & Bus Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <span className="text-2xl">🚌</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                  {trip.operator?.name || 'Bus Operator'}
                </h3>
              </div>
              {trip.operator?.rating && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200 w-fit">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">
                    {typeof trip.operator.rating === 'number' ? trip.operator.rating : trip.operator.rating.overall}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({trip.operator.rating.totalReviews || trip.operator.totalReviews || 0} reviews)
                  </span>
                </div>
              )}
            </div>
            <Badge
              variant={trip.bus?.busType === 'sleeper' ? 'default' : 'secondary'}
              className="capitalize text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md font-bold"
            >
              ✨ {trip.bus?.busType || 'Standard'}
            </Badge>
          </div>

          {/* Route & Time with Enhanced Design */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-inner">
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center flex-1">
                <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                  {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <p className="text-sm font-bold text-gray-700 mt-1">{trip.route?.origin?.city}</p>
                <p className="text-xs text-gray-500">Departure</p>
              </div>

              {/* Duration Indicator */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-bold text-gray-700">{duration}h</p>
                </div>
                <div className="w-full relative">
                  <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-md" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-lg">
                    <ArrowRight className="h-4 w-4 text-purple-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">{trip.route?.distance || 0}km</p>
              </div>

              {/* Arrival */}
              <div className="text-center flex-1">
                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                <p className="text-sm font-bold text-gray-700 mt-1">{trip.route?.destination?.city}</p>
                <p className="text-xs text-gray-500">Arrival</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.bus.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="text-xs border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-colors font-semibold animate-in fade-in-50"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  ✓ {amenity.replace('_', ' ')}
                </Badge>
              ))}
              {trip.bus.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs border-2 border-purple-200 bg-purple-50/50 font-semibold">
                  +{trip.bus.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right: Pricing & CTA */}
        <div className="md:w-64 flex flex-col justify-between items-end text-right space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border-2 border-purple-200">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-semibold">Price per seat</p>
            <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              {trip.pricePerSeat?.toLocaleString() || 0}₫
            </p>
          </div>

          <div className="space-y-3 w-full">
            <div className="flex items-center justify-end gap-2 bg-white/80 p-3 rounded-xl shadow-sm">
              <Users className="h-5 w-5 text-gray-500" />
              <span
                className={`font-bold text-sm ${
                  trip.availableSeats < 5
                    ? 'text-red-600 animate-pulse'
                    : trip.availableSeats < 10
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {trip.availableSeats < 5 && '⚠️ '}
                {trip.availableSeats} seats left
              </span>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group-hover:animate-pulse h-12 text-base">
              🎫 Select Seats →
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8">
                <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/20" />
                <Skeleton className="h-6 w-64 mx-auto bg-white/20" />
              </div>
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Skeleton className="h-96 rounded-2xl" />
                <div className="lg:col-span-3 space-y-4">
                  <Skeleton className="h-64 rounded-2xl" />
                  <Skeleton className="h-64 rounded-2xl" />
                  <Skeleton className="h-64 rounded-2xl" />
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
