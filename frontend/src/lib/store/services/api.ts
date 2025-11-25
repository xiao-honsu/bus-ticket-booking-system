import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as RootState).auth.token;
    
    // If we have a token, include it in the headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'User', 'Bus', 'Route', 'Trip', 'Booking'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (userData: { name: string; email: string; password: string; phone?: string }) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { refreshToken },
      }),
      invalidatesTags: ['Auth'],
    }),
    refreshTokens: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/auth/refresh-tokens',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email: string) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { token: string; password: string }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // User endpoints
    getUser: builder.query({
      query: (userId: string) => `/users/${userId}`,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Trip endpoints
    searchTrips: builder.query({
      query: (params: {
        origin?: string;
        destination?: string;
        date?: string;
        page?: number;
        limit?: number;
      }) => ({
        url: '/trips',
        params,
      }),
      providesTags: ['Trip'],
    }),
    getTrip: builder.query({
      query: (tripId: string) => `/trips/${tripId}`,
      providesTags: ['Trip'],
    }),

    // Booking endpoints
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking', 'Trip'],
    }),
    getBookings: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    getBooking: builder.query({
      query: (bookingId: string) => `/bookings/${bookingId}`,
      providesTags: ['Booking'],
    }),
    updateBooking: builder.mutation({
      query: ({ bookingId, ...data }) => ({
        url: `/bookings/${bookingId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation({
      query: (bookingId: string) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Booking', 'Trip'],
    }),

    // Bus endpoints (Admin)
    getBuses: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/buses',
        params,
      }),
      providesTags: ['Bus'],
    }),
    getBus: builder.query({
      query: (busId: string) => `/buses/${busId}`,
      providesTags: ['Bus'],
    }),
    createBus: builder.mutation({
      query: (busData) => ({
        url: '/buses',
        method: 'POST',
        body: busData,
      }),
      invalidatesTags: ['Bus'],
    }),
    updateBus: builder.mutation({
      query: ({ busId, ...data }) => ({
        url: `/buses/${busId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Bus'],
    }),
    deleteBus: builder.mutation({
      query: (busId: string) => ({
        url: `/buses/${busId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bus'],
    }),

    // Route endpoints (Admin)
    getRoutes: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/routes',
        params,
      }),
      providesTags: ['Route'],
    }),
    getRoute: builder.query({
      query: (routeId: string) => `/routes/${routeId}`,
      providesTags: ['Route'],
    }),
    createRoute: builder.mutation({
      query: (routeData) => ({
        url: '/routes',
        method: 'POST',
        body: routeData,
      }),
      invalidatesTags: ['Route'],
    }),
    updateRoute: builder.mutation({
      query: ({ routeId, ...data }) => ({
        url: `/routes/${routeId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Route'],
    }),
    deleteRoute: builder.mutation({
      query: (routeId: string) => ({
        url: `/routes/${routeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Route'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokensMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useSearchTripsQuery,
  useGetTripQuery,
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetBookingQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useGetBusesQuery,
  useGetBusQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useGetRoutesQuery,
  useGetRouteQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} = api;
