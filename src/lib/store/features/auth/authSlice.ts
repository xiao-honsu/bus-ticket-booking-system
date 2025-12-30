import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// SessionStorage utilities for caching user data (NOT tokens)
const saveUserToSession = (user: User) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          profilePictureUrl: user.profilePictureUrl,
          status: user.status,
          oauthProviders: user.oauthProviders,
          notificationPreferences: user.notificationPreferences,
          stats: user.stats,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      );
    } catch (error) {
      console.error('[SessionStorage] Failed to save user:', error);
    }
  }
};

export const loadUserFromSession = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('[SessionStorage] Failed to load user:', error);
      return null;
    }
  }
  return null;
};

const clearUserSession = () => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('auth_user');
    } catch (error) {
      console.error('[SessionStorage] Failed to clear user:', error);
    }
  }
};

interface IOAuthProvider {
  provider: 'google' | 'facebook';
  providerId: string;
  providerData?: any;
  connectedAt: Date;
}

interface INotificationPreferences {
  email: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
    promotional: boolean;
  };
  sms: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
  };
  push: {
    enabled: boolean;
    bookingConfirmations: boolean;
    tripReminders: boolean;
    tripUpdates: boolean;
  };
}

interface IUserStats {
  totalBookings: number;
  completedTrips: number;
  cancelledBookings: number;
  totalSpent: number;
}

// User interface with optional fields to support partial SSR state
// During SSR, only id and role are available from the decoded JWT
// Full user data (name, email, etc.) is fetched via background sync
interface User {
  id: string;
  name?: string; // Optional for SSR partial state
  email?: string; // Optional for SSR partial state
  role: string;
  phone?: string;
  isEmailVerified?: boolean;
  profilePictureUrl?: string;
  status?: 'active' | 'suspended' | 'deleted';
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  oauthProviders?: IOAuthProvider[];
  notificationPreferences?: INotificationPreferences;
  stats?: IUserStats;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null; // Stored in memory (Redux state)
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Hybrid approach: accessToken in memory, refreshToken in httpOnly cookie
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;

      // // Cache user data to sessionStorage for instant restore on reload
      // if (action.payload.user) {
      //   saveUserToSession(action.payload.user);
      // }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // // Clear cached user data from sessionStorage
      // clearUserSession();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, setAccessToken, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
