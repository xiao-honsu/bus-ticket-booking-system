# Seat Map Mock Data - Testing Guide

This directory contains comprehensive mock data for testing the seat selection and booking features without a backend.

## 📁 Files

- **`seatMapData.ts`** - Mock data structures and scenario generators
- **`seatMapHandlers.ts`** - MSW API handlers for intercepting requests
- **`browser.ts`** - MSW browser setup for development

## 🎭 Test Scenarios

### Scenario 1: Nearly Empty Bus (`trip-001`)

- **Type**: Single-deck, 40 seats
- **Configuration**: 2-2 layout
- **Booked**: 3 seats (A1, A4, B2)
- **Locked**: 2 seats (C1, C2)
- **Use case**: Testing seat selection flow with minimal competition

### Scenario 2: Half-Full Bus (`trip-002`)

- **Type**: Single-deck, 40 seats
- **Booked**: 20 seats (first 5 rows)
- **Locked**: 3 seats (F1, F2, F3)
- **Use case**: Testing availability display and filtering

### Scenario 3: Almost Full Bus (`trip-003`)

- **Type**: Single-deck, 40 seats
- **Booked**: 33 seats
- **Locked**: 2 seats (I2, I3)
- **Available**: Only 5 seats
- **Use case**: Testing scarcity and urgency messaging

### Scenario 4: Double-Deck Bus (`trip-004`)

- **Type**: Double-deck, 56 seats (28 per deck)
- **Configuration**: 2-2 layout, upper and lower decks
- **Booked**: 10 seats (mixed across decks)
- **Locked**: 4 seats
- **Use case**: Testing deck-based layout and navigation

### Scenario 5: Sleeper Bus (`trip-005`)

- **Type**: Double-deck sleeper, 30 beds
- **Configuration**: 1-1-1 layout (3 columns)
- **Booked**: 7 beds
- **Locked**: 2 beds
- **Use case**: Testing sleeper-specific UI and pricing

### Scenario 6: Empty Bus (`trip-006`)

- **Type**: Single-deck, 40 seats
- **Booked**: 0 seats
- **Locked**: 0 seats
- **Use case**: Testing initial state and bulk selection

## 🚀 How to Use

### Method 1: Enable MSW (Recommended for Development)

1. **Install MSW** (if not already installed):

```bash
npm install msw --save-dev
```

2. **Initialize MSW**:

```bash
npx msw init public/
```

3. **Enable mocking in your app** by adding to `src/app/providers.tsx` or `layout.tsx`:

```typescript
// Add at the top
if (process.env.NODE_ENV === 'development') {
  const { enableMocking } = await import('@/mock/browser');
  await enableMocking();
}
```

4. **Navigate to booking pages**:
   - http://localhost:3000/booking/trip-001 (nearly empty)
   - http://localhost:3000/booking/trip-002 (half full)
   - http://localhost:3000/booking/trip-003 (almost full)
   - http://localhost:3000/booking/trip-004 (double deck)
   - http://localhost:3000/booking/trip-005 (sleeper)
   - http://localhost:3000/booking/trip-006 (empty)

### Method 2: Direct Import (For Testing)

Import and use the mock data directly in your components:

```typescript
import { mockSeatMapScenario1, getMockSeatMap } from '@/mock/seatMapData';

// Use in tests or Storybook
const seatMap = getMockSeatMap('trip-001');
console.log(seatMap);
```

### Method 3: Create Custom Scenarios

```typescript
import { generateSingleDeckSeatMap, generateDoubleDeckSeatMap } from '@/mock/seatMapData';

// Custom single-deck bus
const customSeatMap = generateSingleDeckSeatMap(
  'custom-trip-id',
  450000, // base price in VND
  ['A1', 'B2', 'C3'], // booked seats
  ['D1', 'E2'] // locked seats
);

// Custom double-deck bus
const doubleDeckMap = generateDoubleDeckSeatMap('double-deck-trip', 600000, ['LA1', 'UA1'], ['LB2']);
```

## 🎨 Seat Status Colors

The mock data includes all seat statuses that match your UI design:

- **Available**: White background, green border (`status: 'available'`)
- **Selected**: Orange background (`status: 'selected'`)
- **Booked**: Red background (`status: 'booked'`)
- **Locked**: Yellow background (`status: 'locked'`)

## 💰 Pricing Logic

Base prices are automatically calculated with modifiers:

- **VIP seats**: +50% (1.5x base price)
- **Sleeper beds**: +100% (2x base price)
- **Window seats**: +20% (1.2x)
- **Standard seats**: Base price

Example:

- Base: 500,000₫
- Standard window: 600,000₫
- VIP window: 900,000₫
- Sleeper window: 1,200,000₫

## 🧪 Testing Checklist

Use these scenarios to test:

- [ ] **Visual Layout**
  - [ ] Seats display in correct grid
  - [ ] Colors match status (green/orange/red/yellow)
  - [ ] Window indicators (blue dots) show correctly
  - [ ] Deck badges show available counts

- [ ] **Selection Flow**
  - [ ] Can select available seats
  - [ ] Cannot select booked seats
  - [ ] Cannot select locked seats
  - [ ] Selected seats toggle on/off
  - [ ] Multiple seats can be selected

- [ ] **Lock Management**
  - [ ] Locks expire after 10 minutes
  - [ ] Timer shows countdown
  - [ ] Locks refresh on seat selection
  - [ ] Locks release on navigation away

- [ ] **Availability Display**
  - [ ] Available seat count updates
  - [ ] Fare details calculate correctly
  - [ ] Selected seats show in badges
  - [ ] Total price updates dynamically

- [ ] **Edge Cases**
  - [ ] Empty bus (all available)
  - [ ] Almost full (scarcity)
  - [ ] Double-deck navigation
  - [ ] Sleeper bed layout
  - [ ] Price modifiers (VIP, window)

## 🔧 Troubleshooting

**Mock API not working?**

1. Check browser console for `[MSW] Mocking enabled` message
2. Verify `public/mockServiceWorker.js` exists (run `npx msw init public/`)
3. Clear browser cache and reload
4. Check that `NODE_ENV` is `development`

**Seats not displaying?**

1. Check tripId matches one of the scenarios
2. Open DevTools Network tab to see API calls
3. Verify the response structure matches expected format

**Want to add more scenarios?**

1. Open `src/mock/seatMapData.ts`
2. Use generator functions to create new scenarios
3. Add to `mockSeatMapScenarios` object
4. Update handlers if needed

## 📝 API Response Format

The mock data follows this structure:

```typescript
{
  success: true,
  data: {
    tripId: string,
    busId: string,
    totalSeats: number,
    availableSeats: number,
    bookedSeats: number,
    lockedSeats: number,
    layout: {
      type: 'single-deck' | 'double-deck',
      rows: number,
      columns: number,
      decks?: ['upper', 'lower'],
      configuration: string // '2-2', '1-1-1'
    },
    seats: Array<{
      seatNumber: string,
      row: number,
      column: number,
      deck?: 'upper' | 'lower',
      type: 'standard' | 'vip' | 'sleeper',
      price: number,
      status: 'available' | 'booked' | 'locked',
      position: {
        isWindow: boolean,
        isAisle: boolean
      },
      lockedUntil?: string,
      lockedBy?: string
    }>,
    lastUpdated: string
  }
}
```

## 🎯 Quick Test URLs

After enabling MSW, visit these URLs directly:

```
Nearly Empty:  http://localhost:3000/booking/trip-001
Half Full:     http://localhost:3000/booking/trip-002
Almost Full:   http://localhost:3000/booking/trip-003
Double Deck:   http://localhost:3000/booking/trip-004
Sleeper:       http://localhost:3000/booking/trip-005
Empty:         http://localhost:3000/booking/trip-006
```

## 📚 Additional Resources

- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
- [Seat Selection API Documentation](../../docs/agent-generated/SEAT-LOCKING-API.md)

---

**Need help?** Check the main project README or create an issue with the `mock-data` label.
