import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchParams {
  origin: string;
  destination: string;
  date: string;
}

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  departureTimeRange?: {
    start: string;
    end: string;
  };
  seatType?: string[];
  operators?: string[];
  amenities?: string[];
}

interface TripState {
  searchParams: SearchParams | null;
  filters: Filters;
  sortBy: 'price' | 'departure' | 'duration' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const initialState: TripState = {
  searchParams: null,
  filters: {},
  sortBy: 'departure',
  sortOrder: 'asc',
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<SearchParams>) => {
      state.searchParams = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSortBy: (state, action: PayloadAction<'price' | 'departure' | 'duration' | 'rating'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    resetSearch: (state) => {
      return initialState;
    },
  },
});

export const {
  setSearchParams,
  updateFilters,
  clearFilters,
  setSortBy,
  setSortOrder,
  resetSearch,
} = tripSlice.actions;

export default tripSlice.reducer;
