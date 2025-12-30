'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, InitialAuthState } from '@/lib/store';
import { AuthSyncComponent } from '@/components/auth/AuthSyncComponent';

interface StoreProviderProps {
  children: React.ReactNode;
  initialAuth?: InitialAuthState;
}

export default function StoreProvider({ children, initialAuth }: StoreProviderProps) {
  const storeRef = useRef<AppStore | undefined>(undefined);

  if (!storeRef.current) {
    // Create store with initial auth state from server (cookie-based)
    storeRef.current = makeStore(initialAuth);
  }

  return (
    <Provider store={storeRef.current}>
      <AuthSyncComponent />
      {children}
    </Provider>
  );
}
