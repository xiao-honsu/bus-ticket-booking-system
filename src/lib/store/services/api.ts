'use client';

import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';
import { setCredentials, setAccessToken, logout as logoutAction } from '../features/auth/authSlice';
import { Mutex } from 'async-mutex';
import { clearAuthCookies } from '@/lib/utils/cookies';
import {
  ApiSuccessResponse,
  AuthResponse,
  LoginRequest,
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/lib/types';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create a mutex to prevent multiple simultaneous refresh token calls
const mutex = new Mutex();

// Build base URL - handle both absolute URLs and relative paths
const getBaseUrl = () => {
  if (BASE_URL.startsWith('http')) {
    return new URL('/api/v1', BASE_URL).toString();
  }
  // For relative paths like '/api/mock', append '/api/v1' path
  return BASE_URL === '/api/mock' ? BASE_URL : `${BASE_URL}/api/v1`;
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as unknown as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with automatic token refresh on 401 errors
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 Unauthorized error, try to refresh the token
  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        // Attempt to refresh the access token
        const refreshResult: any = await baseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Token refresh successful - update accessToken in Redux
          const newAccessToken = refreshResult.data?.data?.tokens?.access?.token;
          api.dispatch(setAccessToken(newAccessToken));

          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh token is invalid or expired, logout user
          api.dispatch(logoutAction());

          // Clear client-side cookies
          if (typeof document !== 'undefined') {
            clearAuthCookies();
          }

          // Redirect to login with session expired message
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?session_expired=true';
          }
        }
      } finally {
        release();
      }
    } else {
      // Wait for the ongoing refresh to complete
      await mutex.waitForUnlock();
      // Retry the original request (token should be refreshed now)
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Bus', 'Route', 'Trip', 'Booking', 'Operator', 'SeatLock', 'Promotion', 'UserPromotion'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials: { email: string; password: string }) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformErrorResponse: (response) => response.data,
      transformResponse: (response: ApiSuccessResponse<AuthResponse>) => response.data,
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (userData: { name: string; email: string; password: string; phone?: string }) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      // transformResponse: (response: { user: any; message?: string }) => response.user,
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        // No body needed - refreshToken is in httpOnly cookie
      }),
      invalidatesTags: ['Auth'],
    }),
    refreshTokens: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        // No body needed - refreshToken is in httpOnly cookie
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
        url: `/auth/reset-password?token=${data.token}`,
        method: 'POST',
        body: { password: data.password },
      }),
    }),
    verifyEmail: builder.mutation({
      query: (token: string) => ({
        url: `/auth/verify-email?token=${token}`,
        method: 'POST',
      }),
    }),

    // User endpoints
    getUsers: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/users',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return {
            results: response,
            page: 1,
            limit: response.length,
            totalPages: 1,
            totalResults: response.length,
          };
        }
        return {
          results: response.docs || response.results || [],
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalResults: response.totalDocs || response.totalResults,
        };
      },
      providesTags: ['User'],
    }),
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
    resetUserPassword: builder.mutation({
      query: ({ userId, password }) => ({
        url: `/users/${userId}/reset-password`,
        method: 'PATCH',
        body: { password },
      }),
      invalidatesTags: ['User'],
    }),
    blockUser: builder.mutation({
      query: (userId: string) => ({
        url: `/users/${userId}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    // Trip endpoints
    searchTrips: builder.query({
      query: (params: {
        origin?: string;
        destination?: string;
        departureDate?: string;
        minPrice?: number;
        maxPrice?: number;
        departureTimeFrom?: string;
        departureTimeTo?: string;
        busType?: string;
        amenities?: string;
        minAvailableSeats?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
      }) => ({
        url: '/trips/search',
        params,
      }),
      transformResponse: (response: any) => {
        // Return full paginated response
        if (response.docs) {
          return {
            results: response.docs,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            totalResults: response.totalDocs,
          };
        }
        if (response.results) {
          return response;
        }
        // Handle plain array response
        return {
          results: Array.isArray(response) ? response : [],
          page: 1,
          limit: response.length || 0,
          totalPages: 1,
          totalResults: response.length || 0,
        };
      },
      providesTags: ['Trip'],
    }),
    getTrip: builder.query({
      query: (tripId: string) => `/trips/${tripId}`,
      providesTags: ['Trip'],
    }),
    createTrip: builder.mutation({
      query: (tripData) => ({
        url: '/trips',
        method: 'POST',
        body: tripData,
      }),
      invalidatesTags: ['Trip'],
    }),
    deleteTrip: builder.mutation({
      query: (tripId: string) => ({
        url: `/trips/${tripId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Trip'],
    }),
    updateTripSeatPricing: builder.mutation({
      query: ({ tripId, seatPricing }) => ({
        url: `/trips/${tripId}/seatpricing`,
        method: 'PATCH',
        body: { seatPricing },
      }),
      invalidatesTags: ['Trip'],
    }),

    // Booking endpoints
    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking', 'Trip'],
      // transformResponse: Extract data from success response wrapper
      // transformResponse: (response: ApiSuccessResponse<CreateBookingResponse>) => {
      //   // Backend returns { code: 201, message: '...', data: {...} }
      //   // We extract just the data object
      //   return response.data;
      // },
      // transformErrorResponse: Extract error message from error response
      transformErrorResponse: (response: any) => {
        // Backend returns { code: 400, message: 'Error message', stack?: '...' }
        // Extract the message for display
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),
    getBookings: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/bookings',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return {
            results: response,
            page: 1,
            limit: response.length,
            totalPages: 1,
            totalResults: response.length,
          };
        }
        return {
          results: response.docs || response.results || [],
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalResults: response.totalDocs || response.totalResults,
        };
      },
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
      transformResponse: (response: any) => {
        // Convert mongoose-paginate format to frontend format
        return {
          results: response.docs || response.results || [],
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalResults: response.totalDocs || response.totalResults,
        };
      },
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
    updateBusSeatMap: builder.mutation({
      query: ({ busId, seatMapData }) => ({
        url: `/buses/${busId}/seatmap`,
        method: 'PATCH',
        body: seatMapData,
      }),
      invalidatesTags: ['Bus'],
    }),

    // Route endpoints (Admin)
    getRoutes: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/routes',
        params,
      }),
      transformResponse: (response: any) => {
        // Convert mongoose-paginate format to frontend format
        return {
          results: response.docs || response.results || [],
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalResults: response.totalDocs || response.totalResults,
        };
      },
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

    // Operator endpoints (Admin)
    getOperators: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/operators',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return {
            results: response,
            page: 1,
            limit: response.length,
            totalPages: 1,
            totalResults: response.length,
          };
        }
        return {
          results: response.docs || response.results || [],
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
          totalResults: response.totalDocs || response.totalResults,
        };
      },
      providesTags: ['Operator'],
    }),

    createOperator: builder.mutation({
      query: (operatorData: any) => ({
        url: '/operators',
        method: 'POST',
        body: operatorData,
      }),
      invalidatesTags: ['Operator'],
    }),

    updateOperator: builder.mutation({
      query: ({ id, ...operatorData }: any) => ({
        url: `/operators/${id}`,
        method: 'PATCH',
        body: operatorData,
      }),
      invalidatesTags: ['Operator'],
    }),

    deleteOperator: builder.mutation({
      query: (id: string) => ({
        url: `/operators/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Operator'],
    }),

    // Location endpoints
    searchLocations: builder.query({
      query: (searchQuery: string) => ({
        url: '/locations/search',
        params: { q: searchQuery },
      }),
    }),

    // Seat Lock endpoints - Updated for Socket.IO integration
    lockSeats: builder.mutation<
      {
        id: string;
        trip: string;
        seatNumbers: string[];
        sessionId: string;
        expiresAt: string;
        createdAt: string;
        updatedAt: string;
      },
      { tripId: string; seatNumbers: string[]; sessionId?: string }
    >({
      query: (data) => ({
        url: '/seat-locks/lock',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SeatLock', 'Trip'],
    }),

    getTripSeatMap: builder.query({
      query: (params: string | { tripId: string; sessionId?: string }) => {
        if (typeof params === 'string') {
          return `/trips/${params}/seat-map`;
        }
        const { tripId, sessionId } = params;
        const queryParams = sessionId ? `?sessionId=${sessionId}` : '';
        return `/trips/${tripId}/seat-map${queryParams}`;
      },
      providesTags: ['Trip', 'SeatLock'],
    }),

    releaseLocks: builder.mutation<
      {
        message: string;
        releasedCount: number;
      },
      string
    >({
      query: (sessionId) => ({
        url: '/seat-locks/release',
        method: 'POST',
        body: { sessionId },
      }),
      invalidatesTags: ['SeatLock', 'Trip'],
    }),

    extendLocks: builder.mutation<
      {
        message: string;
        extendedCount: number;
        newExpiresAt: string;
      },
      { sessionId: string; minutes?: number }
    >({
      query: (data) => ({
        url: '/seat-locks/extend',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SeatLock'],
    }),

    // Universal Search endpoints
    universalSearch: builder.query<
      {
        trips: any[];
        operators: any[];
        routes: any[];
        suggestions: string[];
        matchType: 'route' | 'operator' | 'tripCode' | 'boardingPoint' | 'mixed' | 'none';
      },
      { q: string; limit?: number }
    >({
      query: ({ q, limit = 10 }) => ({
        url: '/search',
        params: { q, limit },
      }),
    }),

    getSearchSuggestions: builder.query<{ suggestions: string[] }, { q: string; limit?: number }>({
      query: ({ q, limit = 8 }) => ({
        url: '/search/suggestions',
        params: { q, limit },
      }),
    }),

    // Promotion endpoints
    // Admin
    createPromotion: builder.mutation({
      query: (data) => ({
        url: '/promotions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Promotion'],
    }),

    getPromotionsAdmin: builder.query({
      query: (params?: { page?: number; limit?: number; isActive?: boolean }) => ({
        url: '/promotions/admin',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.docs) {
          return {
            results: response.docs,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            totalResults: response.totalDocs,
          };
        }
        return response;
      },
      providesTags: ['Promotion'],
    }),

    getPromotion: builder.query({
      query: (promotionId: string) => `/promotions/${promotionId}`,
      providesTags: ['Promotion'],
    }),

    updatePromotion: builder.mutation({
      query: ({ promotionId, ...data }) => ({
        url: `/promotions/${promotionId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Promotion'],
    }),

    deletePromotion: builder.mutation({
      query: (promotionId: string) => ({
        url: `/promotions/${promotionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promotion'],
    }),

    // User
    getActivePromotions: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: '/promotions/active',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.docs) {
          return {
            results: response.docs,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            totalResults: response.totalDocs,
          };
        }
        return response;
      },
      providesTags: ['Promotion'],
    }),

    collectPromotion: builder.mutation({
      query: (promotionId: string) => ({
        url: `/promotions/${promotionId}/collect`,
        method: 'POST',
      }),
      invalidatesTags: ['Promotion', 'UserPromotion'],
    }),

    getMyPromotions: builder.query({
      query: (params?: { status?: 'available' | 'used' | 'expired' | 'all'; page?: number; limit?: number }) => ({
        url: '/promotions/my-promotions',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.docs) {
          return {
            results: response.docs,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            totalResults: response.totalDocs,
          };
        }
        return response;
      },
      providesTags: ['UserPromotion'],
    }),

    validatePromotion: builder.mutation({
      query: (data: { code: string; orderAmount: number }) => ({
        url: '/promotions/validate',
        method: 'POST',
        body: data,
      }),
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
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
  useBlockUserMutation,
  useSearchTripsQuery,
  useLazySearchTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useDeleteTripMutation,
  useUpdateTripSeatPricingMutation,
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
  useUpdateBusSeatMapMutation,
  useGetRoutesQuery,
  useGetRouteQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetOperatorsQuery,
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
  useSearchLocationsQuery,
  useLockSeatsMutation,
  useGetTripSeatMapQuery,
  useReleaseLocksMutation,
  useExtendLocksMutation,
  useUniversalSearchQuery,
  useLazyUniversalSearchQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useCreatePromotionMutation,
  useGetPromotionsAdminQuery,
  useGetPromotionQuery,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetActivePromotionsQuery,
  useCollectPromotionMutation,
  useGetMyPromotionsQuery,
  useValidatePromotionMutation,
} = api;
