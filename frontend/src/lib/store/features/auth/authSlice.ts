import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isEmailVerified: boolean;
  profilePictureUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        tokens: { access: { token: string }; refresh: { token: string } };
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.tokens.access.token;
      state.refreshToken = action.payload.tokens.refresh.token;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateToken: (
      state,
      action: PayloadAction<{ access: { token: string }; refresh: { token: string } }>
    ) => {
      state.token = action.payload.access.token;
      state.refreshToken = action.payload.refresh.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, updateToken, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
