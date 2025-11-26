import authReducer, {
  setCredentials,
  setUser,
  updateToken,
  logout,
  setLoading,
} from '@/lib/store/features/auth/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setCredentials', () => {
    it('should set user and tokens when login is successful', () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isEmailVerified: true,
      };

      const mockTokens = {
        access: { token: 'access-token-123' },
        refresh: { token: 'refresh-token-123' },
      };

      const action = setCredentials({ user: mockUser, tokens: mockTokens });
      const newState = authReducer(initialState, action);

      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('access-token-123');
      expect(newState.refreshToken).toBe('refresh-token-123');
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should update user information', () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isEmailVerified: true,
      };

      const action = setUser(mockUser);
      const newState = authReducer(initialState, action);

      expect(newState.user).toEqual(mockUser);
    });
  });

  describe('updateToken', () => {
    it('should update access and refresh tokens', () => {
      const mockTokens = {
        access: { token: 'new-access-token' },
        refresh: { token: 'new-refresh-token' },
      };

      const action = updateToken(mockTokens);
      const newState = authReducer(initialState, action);

      expect(newState.token).toBe('new-access-token');
      expect(newState.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      const authenticatedState = {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          isEmailVerified: true,
        },
        token: 'access-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
      };

      const action = logout();
      const newState = authReducer(authenticatedState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const action = setLoading(true);
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const loadingState = { ...initialState, isLoading: true };
      const action = setLoading(false);
      const newState = authReducer(loadingState, action);

      expect(newState.isLoading).toBe(false);
    });

    it('should toggle loading state multiple times', () => {
      let newState = authReducer(initialState, setLoading(true));
      expect(newState.isLoading).toBe(true);

      newState = authReducer(newState, setLoading(false));
      expect(newState.isLoading).toBe(false);

      newState = authReducer(newState, setLoading(true));
      expect(newState.isLoading).toBe(true);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle full authentication flow', () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isEmailVerified: true,
      };

      const mockTokens = {
        access: { token: 'access-token' },
        refresh: { token: 'refresh-token' },
      };

      // Set loading to true
      let newState = authReducer(initialState, setLoading(true));
      expect(newState.isLoading).toBe(true);

      // Set credentials
      newState = authReducer(newState, setCredentials({ user: mockUser, tokens: mockTokens }));
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(mockUser);

      // Set loading to false
      newState = authReducer(newState, setLoading(false));
      expect(newState.isLoading).toBe(false);

      // Logout
      newState = authReducer(newState, logout());
      expect(newState).toEqual(initialState);
    });

    it('should handle token refresh while authenticated', () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isEmailVerified: true,
      };

      const initialTokens = {
        access: { token: 'old-access' },
        refresh: { token: 'old-refresh' },
      };

      const newTokens = {
        access: { token: 'new-access' },
        refresh: { token: 'new-refresh' },
      };

      let newState = authReducer(initialState, setCredentials({ user: mockUser, tokens: initialTokens }));
      expect(newState.token).toBe('old-access');

      newState = authReducer(newState, updateToken(newTokens));
      expect(newState.token).toBe('new-access');
      expect(newState.refreshToken).toBe('new-refresh');
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should update user info while maintaining authentication', () => {
      const initialUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isEmailVerified: false,
      };

      const updatedUser = {
        ...initialUser,
        isEmailVerified: true,
      };

      const mockTokens = {
        access: { token: 'access' },
        refresh: { token: 'refresh' },
      };

      let newState = authReducer(initialState, setCredentials({ user: initialUser, tokens: mockTokens }));
      expect(newState.user?.isEmailVerified).toBe(false);

      newState = authReducer(newState, setUser(updatedUser));
      expect(newState.user?.isEmailVerified).toBe(true);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.token).toBe('access');
    });
  });
});
