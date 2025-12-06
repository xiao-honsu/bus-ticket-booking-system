import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RouteFormData {
  name?: string;
  origin?: string;
  destination?: string;
  distance?: number;
  estimatedDuration?: number;
  stops?: Array<{
    name: string;
    sequence: number;
    arrivalOffset: number;
  }>;
}

interface RouteState {
  selectedRouteId: string | null;
  formData: RouteFormData;
  isFormOpen: boolean;
}

const initialState: RouteState = {
  selectedRouteId: null,
  formData: {},
  isFormOpen: false,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setSelectedRouteId: (state, action: PayloadAction<string | null>) => {
      state.selectedRouteId = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<RouteFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {};
    },
    setFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isFormOpen = action.payload;
    },
    resetRouteState: (state) => {
      return initialState;
    },
  },
});

export const { setSelectedRouteId, updateFormData, clearFormData, setFormOpen, resetRouteState } = routeSlice.actions;

export default routeSlice.reducer;
