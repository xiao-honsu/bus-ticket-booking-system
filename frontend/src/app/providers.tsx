'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { setCredentials } from '@/lib/store/features/auth/authSlice';
import { getAuthCookies } from '@/lib/utils/cookies';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Hydrate auth state from cookies after mount (client-side only)
  useEffect(() => {
    const { token, refreshToken } = getAuthCookies();
    
    if (token && refreshToken && storeRef.current) {
      // Check if already authenticated
      const state = storeRef.current.getState();
      if (!state.auth.isAuthenticated) {
        // Restore tokens to Redux state
        storeRef.current.dispatch(
          setCredentials({
            user: null as any, // User will be fetched on first API call
            tokens: {
              access: { token },
              refresh: { token: refreshToken },
            },
          })
        );
      }
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
