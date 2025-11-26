import tripReducer, {
  setSearchParams,
  updateFilters,
  clearFilters,
  setSortBy,
  setSortOrder,
  resetSearch,
} from '@/lib/store/features/trip/tripSlice';

describe('tripSlice', () => {
  const initialState = {
    searchParams: null,
    filters: {},
    sortBy: 'departure' as const,
    sortOrder: 'asc' as const,
  };

  it('should return the initial state', () => {
    expect(tripReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setSearchParams', () => {
    it('should set search parameters', () => {
      const searchParams = {
        origin: 'Hanoi',
        destination: 'Ho Chi Minh',
        date: '2025-12-01',
      };

      const action = setSearchParams(searchParams);
      const newState = tripReducer(initialState, action);

      expect(newState.searchParams).toEqual(searchParams);
    });

    it('should override previous search parameters', () => {
      const firstParams = {
        origin: 'Hanoi',
        destination: 'Da Nang',
        date: '2025-12-01',
      };

      const secondParams = {
        origin: 'Hanoi',
        destination: 'Ho Chi Minh',
        date: '2025-12-15',
      };

      let newState = tripReducer(initialState, setSearchParams(firstParams));
      newState = tripReducer(newState, setSearchParams(secondParams));

      expect(newState.searchParams).toEqual(secondParams);
    });
  });

  describe('updateFilters', () => {
    it('should add price range filter', () => {
      const filters = {
        minPrice: 100000,
        maxPrice: 500000,
      };

      const action = updateFilters(filters);
      const newState = tripReducer(initialState, action);

      expect(newState.filters).toEqual(filters);
    });

    it('should add departure time range filter', () => {
      const filters = {
        departureTimeRange: {
          start: '06:00',
          end: '12:00',
        },
      };

      const action = updateFilters(filters);
      const newState = tripReducer(initialState, action);

      expect(newState.filters).toEqual(filters);
    });

    it('should add seat type filter', () => {
      const filters = {
        seatType: ['VIP', 'Standard'],
      };

      const action = updateFilters(filters);
      const newState = tripReducer(initialState, action);

      expect(newState.filters).toEqual(filters);
    });

    it('should add operators filter', () => {
      const filters = {
        operators: ['Operator A', 'Operator B'],
      };

      const action = updateFilters(filters);
      const newState = tripReducer(initialState, action);

      expect(newState.filters).toEqual(filters);
    });

    it('should add amenities filter', () => {
      const filters = {
        amenities: ['WiFi', 'AC', 'TV'],
      };

      const action = updateFilters(filters);
      const newState = tripReducer(initialState, action);

      expect(newState.filters).toEqual(filters);
    });

    it('should merge multiple filters', () => {
      let newState = tripReducer(initialState, updateFilters({ minPrice: 100000 }));
      newState = tripReducer(newState, updateFilters({ maxPrice: 500000 }));
      newState = tripReducer(newState, updateFilters({ seatType: ['VIP'] }));

      expect(newState.filters).toEqual({
        minPrice: 100000,
        maxPrice: 500000,
        seatType: ['VIP'],
      });
    });

    it('should override existing filter values', () => {
      const firstFilters = {
        minPrice: 100000,
        maxPrice: 300000,
      };

      const secondFilters = {
        minPrice: 200000,
      };

      let newState = tripReducer(initialState, updateFilters(firstFilters));
      newState = tripReducer(newState, updateFilters(secondFilters));

      expect(newState.filters).toEqual({
        minPrice: 200000,
        maxPrice: 300000,
      });
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          minPrice: 100000,
          maxPrice: 500000,
          seatType: ['VIP'],
          operators: ['Operator A'],
        },
      };

      const action = clearFilters();
      const newState = tripReducer(stateWithFilters, action);

      expect(newState.filters).toEqual({});
    });

    it('should keep other state properties unchanged', () => {
      const stateWithData = {
        searchParams: {
          origin: 'Hanoi',
          destination: 'Ho Chi Minh',
          date: '2025-12-01',
        },
        filters: {
          minPrice: 100000,
        },
        sortBy: 'price' as const,
        sortOrder: 'desc' as const,
      };

      const newState = tripReducer(stateWithData, clearFilters());

      expect(newState.searchParams).toEqual(stateWithData.searchParams);
      expect(newState.sortBy).toBe('price');
      expect(newState.sortOrder).toBe('desc');
      expect(newState.filters).toEqual({});
    });
  });

  describe('setSortBy', () => {
    it('should set sort by price', () => {
      const action = setSortBy('price');
      const newState = tripReducer(initialState, action);

      expect(newState.sortBy).toBe('price');
    });

    it('should set sort by departure', () => {
      const action = setSortBy('departure');
      const newState = tripReducer(initialState, action);

      expect(newState.sortBy).toBe('departure');
    });

    it('should set sort by duration', () => {
      const action = setSortBy('duration');
      const newState = tripReducer(initialState, action);

      expect(newState.sortBy).toBe('duration');
    });

    it('should set sort by rating', () => {
      const action = setSortBy('rating');
      const newState = tripReducer(initialState, action);

      expect(newState.sortBy).toBe('rating');
    });

    it('should override previous sort by value', () => {
      let newState = tripReducer(initialState, setSortBy('price'));
      newState = tripReducer(newState, setSortBy('rating'));

      expect(newState.sortBy).toBe('rating');
    });
  });

  describe('setSortOrder', () => {
    it('should set sort order to ascending', () => {
      const action = setSortOrder('asc');
      const newState = tripReducer(initialState, action);

      expect(newState.sortOrder).toBe('asc');
    });

    it('should set sort order to descending', () => {
      const action = setSortOrder('desc');
      const newState = tripReducer(initialState, action);

      expect(newState.sortOrder).toBe('desc');
    });

    it('should toggle sort order', () => {
      let newState = tripReducer(initialState, setSortOrder('desc'));
      expect(newState.sortOrder).toBe('desc');

      newState = tripReducer(newState, setSortOrder('asc'));
      expect(newState.sortOrder).toBe('asc');
    });
  });

  describe('resetSearch', () => {
    it('should reset all state to initial values', () => {
      const filledState = {
        searchParams: {
          origin: 'Hanoi',
          destination: 'Ho Chi Minh',
          date: '2025-12-01',
        },
        filters: {
          minPrice: 100000,
          maxPrice: 500000,
          seatType: ['VIP'],
        },
        sortBy: 'price' as const,
        sortOrder: 'desc' as const,
      };

      const action = resetSearch();
      const newState = tripReducer(filledState, action);

      expect(newState).toEqual(initialState);
    });

    it('should clear search params', () => {
      const stateWithSearch = {
        ...initialState,
        searchParams: {
          origin: 'Hanoi',
          destination: 'Da Nang',
          date: '2025-12-01',
        },
      };

      const newState = tripReducer(stateWithSearch, resetSearch());

      expect(newState.searchParams).toBeNull();
    });

    it('should reset filters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          minPrice: 100000,
          maxPrice: 500000,
        },
      };

      const newState = tripReducer(stateWithFilters, resetSearch());

      expect(newState.filters).toEqual({});
    });

    it('should reset sort options', () => {
      const stateWithSort = {
        ...initialState,
        sortBy: 'price' as const,
        sortOrder: 'desc' as const,
      };

      const newState = tripReducer(stateWithSort, resetSearch());

      expect(newState.sortBy).toBe('departure');
      expect(newState.sortOrder).toBe('asc');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      let newState = tripReducer(initialState, setSearchParams({
        origin: 'Hanoi',
        destination: 'Ho Chi Minh',
        date: '2025-12-01',
      }));

      newState = tripReducer(newState, updateFilters({
        minPrice: 100000,
        maxPrice: 500000,
      }));

      newState = tripReducer(newState, updateFilters({
        seatType: ['VIP'],
      }));

      newState = tripReducer(newState, setSortBy('price'));
      newState = tripReducer(newState, setSortOrder('asc'));

      expect(newState.searchParams?.origin).toBe('Hanoi');
      expect(newState.filters.minPrice).toBe(100000);
      expect(newState.filters.seatType).toEqual(['VIP']);
      expect(newState.sortBy).toBe('price');
      expect(newState.sortOrder).toBe('asc');
    });

    it('should handle filter updates after clear', () => {
      let newState = tripReducer(initialState, updateFilters({
        minPrice: 100000,
        seatType: ['VIP'],
      }));

      newState = tripReducer(newState, clearFilters());
      expect(newState.filters).toEqual({});

      newState = tripReducer(newState, updateFilters({
        maxPrice: 300000,
      }));

      expect(newState.filters).toEqual({
        maxPrice: 300000,
      });
    });
  });
});
