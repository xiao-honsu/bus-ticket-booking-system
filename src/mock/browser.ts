/**
 * MSW Browser Setup for Development
 * This file sets up Mock Service Worker for browser-based API mocking
 *
 * Usage in development:
 * 1. Uncomment the import in src/app/layout.tsx or providers.tsx
 * 2. The mock API will intercept all requests matching the handlers
 * 3. Check browser console for "[MSW] Mocking enabled" message
 */

import { setupWorker } from 'msw/browser';
import seatMapHandlers from './seatMapHandlers';

// Create the worker with all handlers
export const worker = setupWorker(...seatMapHandlers);

// Start the worker
export const enableMocking = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  await worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  });

  console.log('[MSW] 🎭 Mock API enabled for seat map testing');
  console.log('[MSW] Available mock trips:', [
    'trip-001 (Nearly empty)',
    'trip-002 (Half full)',
    'trip-003 (Almost full)',
    'trip-004 (Double deck)',
    'trip-005 (Sleeper)',
    'trip-006 (Empty)',
  ]);
};

// Export for conditional enabling
export default worker;
