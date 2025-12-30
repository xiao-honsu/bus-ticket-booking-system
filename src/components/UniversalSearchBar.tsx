'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2, MapPin, Building2, Hash, TrendingUp } from 'lucide-react';
import { useLazyUniversalSearchQuery, useLazyGetSearchSuggestionsQuery } from '@/lib/store/services/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UniversalSearchBarProps {
  onRouteSelect?: (origin: string, destination: string) => void;
  onOperatorSelect?: (operatorName: string) => void;
  onTripSelect?: (tripId: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
}

const MATCH_TYPE_CONFIG = {
  route: { icon: MapPin, label: 'Routes', color: 'text-blue-600' },
  operator: { icon: Building2, label: 'Operators', color: 'text-purple-600' },
  tripCode: { icon: Hash, label: 'Trip', color: 'text-green-600' },
  boardingPoint: { icon: MapPin, label: 'Boarding Points', color: 'text-orange-600' },
  mixed: { icon: Search, label: 'All Results', color: 'text-gray-600' },
  none: { icon: Search, label: 'No Results', color: 'text-gray-400' },
};

export default function UniversalSearchBar({
  onRouteSelect,
  onOperatorSelect,
  onTripSelect,
  placeholder = 'Search: Hà Nội - Sài Gòn, operator, or trip code...',
  className,
  autoFocus = false,
  showRecentSearches = true,
}: UniversalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [triggerSearch, { data: searchResults, isLoading: isSearching, isFetching }] = useLazyUniversalSearchQuery();
  const [triggerSuggestions, { data: suggestionsData, isLoading: isSuggestionsLoading }] =
    useLazyGetSearchSuggestionsQuery();

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches && typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [showRecentSearches]);

  // Save to recent searches
  const saveToRecentSearches = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim() || !showRecentSearches) return;

      setRecentSearches((prev) => {
        const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 5);
        if (typeof window !== 'undefined') {
          localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
        return updated;
      });
    },
    [showRecentSearches]
  );

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      // Trigger both full search and suggestions
      triggerSearch({ q: query, limit: 8 });
      triggerSuggestions({ q: query, limit: 6 });
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, triggerSearch, triggerSuggestions]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    saveToRecentSearches(query);
    triggerSearch({ q: query, limit: 10 });
    setShowDropdown(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveToRecentSearches(suggestion);
    triggerSearch({ q: suggestion, limit: 10 });
  };

  const handleRouteClick = (route: any) => {
    const origin = route.origin?.city || '';
    const destination = route.destination?.city || '';

    if (onRouteSelect) {
      onRouteSelect(origin, destination);
    }

    saveToRecentSearches(`${origin} - ${destination}`);
    setShowDropdown(false);
    setQuery('');
  };

  const handleOperatorClick = (operator: any) => {
    if (onOperatorSelect) {
      onOperatorSelect(operator.companyName);
    } else {
      // Default: navigate to search with operator filter
      router.push(`/search?operator=${encodeURIComponent(operator.companyName)}`);
    }

    saveToRecentSearches(operator.companyName);
    setShowDropdown(false);
    setQuery('');
  };

  const handleTripClick = (trip: any) => {
    const tripId = trip._id || trip.id;

    if (onTripSelect) {
      onTripSelect(tripId);
    } else {
      // Default: navigate to trip detail
      router.push(`/trip-detail/${tripId}`);
    }

    setShowDropdown(false);
    setQuery('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  };

  const matchConfig = searchResults?.matchType ? MATCH_TYPE_CONFIG[searchResults.matchType] : MATCH_TYPE_CONFIG.none;
  const Icon = matchConfig.icon;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-10 pr-24 h-12 text-base border-2 focus:border-purple-500 transition-colors"
          autoFocus={autoFocus}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="sm"
          >
            {isSearching || isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 max-h-[500px] overflow-y-auto z-50 shadow-2xl border-2 border-purple-200"
        >
          <div className="p-4 space-y-4">
            {/* Loading State */}
            {(isSearching || isSuggestionsLoading) && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="h-6 text-xs">
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm text-gray-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults && !isSearching && (
              <>
                {/* Match Type Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-2">
                    <Icon className={cn('h-3 w-3 mr-1', matchConfig.color)} />
                    {matchConfig.label}
                  </Badge>
                  {searchResults.trips.length + searchResults.operators.length + searchResults.routes.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {searchResults.trips.length + searchResults.operators.length + searchResults.routes.length}{' '}
                      results
                    </span>
                  )}
                </div>

                {/* Suggestions */}
                {suggestionsData && suggestionsData.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Suggestions</h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestionsData.suggestions.map((suggestion, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-purple-100 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Routes */}
                {searchResults.routes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Routes</h3>
                    <div className="space-y-1">
                      {searchResults.routes.map((route: any) => (
                        <button
                          key={route._id}
                          onClick={() => handleRouteClick(route)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">
                              {route.origin.city} → {route.destination.city}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-6">
                            {route.distance}km • {Math.floor(route.estimatedDuration / 60)}h
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operators */}
                {searchResults.operators.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Operators</h3>
                    <div className="space-y-1">
                      {searchResults.operators.map((operator: any) => (
                        <button
                          key={operator._id}
                          onClick={() => handleOperatorClick(operator)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-sm">{operator.companyName}</span>
                            </div>
                            {operator.rating?.overall && (
                              <Badge variant="secondary" className="text-xs">
                                ⭐ {operator.rating.overall}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trips */}
                {searchResults.trips.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Available Trips</h3>
                    <div className="space-y-2">
                      {searchResults.trips.slice(0, 5).map((trip: any) => {
                        const departureTime = new Date(trip.departureTime);
                        return (
                          <button
                            key={trip._id || trip.id}
                            onClick={() => handleTripClick(trip)}
                            className="w-full text-left px-3 py-3 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {trip.route?.origin?.city} → {trip.route?.destination?.city}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {trip.operator?.companyName} •{' '}
                                  {departureTime.toLocaleDateString('vi-VN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-sm text-purple-600">
                                  {trip.pricePerSeat?.toLocaleString()}₫
                                </div>
                                <div className="text-xs text-gray-500">{trip.availableSeats} seats</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchResults.trips.length === 0 &&
                  searchResults.operators.length === 0 &&
                  searchResults.routes.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔍</div>
                      <p className="text-gray-600 font-medium">No results found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
                    </div>
                  )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
