import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BusFormData {
  plateNumber?: string;
  busType?: string;
  seatCapacity?: number;
  amenities?: string[];
  status?: string;
}

interface BusState {
  selectedBusId: string | null;
  formData: BusFormData;
  isFormOpen: boolean;
}

const initialState: BusState = {
  selectedBusId: null,
  formData: {},
  isFormOpen: false,
};

const busSlice = createSlice({
  name: 'bus',
  initialState,
  reducers: {
    setSelectedBusId: (state, action: PayloadAction<string | null>) => {
      state.selectedBusId = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<BusFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {};
    },
    setFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isFormOpen = action.payload;
    },
    resetBusState: () => {
      return initialState;
    },
  },
});

export const { setSelectedBusId, updateFormData, clearFormData, setFormOpen, resetBusState } = busSlice.actions;

export default busSlice.reducer;
