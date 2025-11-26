'use client';

import { useAuthSync } from '@/lib/hooks';

/**
 * Client component to handle auth synchronization
 * This fetches user data when we have tokens but no user info (after reload)
 */
export default function AuthSync() {
  useAuthSync();
  return null;
}
