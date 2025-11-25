import { configureStore } from '@reduxjs/toolkit';
import { api } from './store/services/api';
import authReducer from './store/features/auth/authSlice';
import bookingReducer from './store/features/booking/bookingSlice';
import tripReducer from './store/features/trip/tripSlice';
import busReducer from './store/features/bus/busSlice';
import routeReducer from './store/features/route/routeSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      booking: bookingReducer,
      trip: tripReducer,
      bus: busReducer,
      route: routeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
