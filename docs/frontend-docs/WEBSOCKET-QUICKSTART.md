# 🚀 Quick Start - WebSocket Integration

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install `socket.io-client: ^4.8.1` that was added to `package.json`.

---

## 2. Environment Setup

Ensure your `.env.local` has the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 3. Start Backend

Make sure your backend server is running:

```bash
# In backend directory
npm run dev
# Backend should run on http://localhost:4000
```

---

## 4. Start Frontend

```bash
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 5. Test Real-time Features

### Test 1: Multi-user Seat Locking

1. Open `http://localhost:3000/booking/[tripId]` in **2 browser tabs**
2. Select different seats in each tab
3. ✅ You should see seats lock in real-time across both tabs
4. Try selecting the same seat → One tab should show error

### Test 2: Socket Connection

1. Open Browser Console (F12)
2. You should see:
   ```
   ✅ Socket connected: <socket-id>
   ✅ Joined trip room: <trip-id>
   ```

### Test 3: Real-time Events

1. Select a seat in Tab 1
2. Tab 2 should show toast: "Seats A3 locked by another user"
3. Seat should turn yellow instantly

---

## 📋 New Features

### Real-time Seat Status

- ✅ **Instant updates** - No more 30s polling delay
- ✅ **Toast notifications** when seats are locked/released/booked
- ✅ **Multi-user awareness** - See what others are doing
- ✅ **Connection status** - Auto-reconnect on network issues

### API Changes

- ❌ Removed `checkSeatAvailability` endpoint
- ❌ Removed `getLockedSeats` endpoint
- ✅ Updated response types for `lockSeats`, `extendLocks`
- ✅ `getTripSeatMap` now accepts `sessionId` parameter

---

## 🔍 Debugging

### Check Socket Connection

```javascript
// Browser Console
import { getSocket } from '@/lib/services/socket';
const socket = getSocket();
console.log('Connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### Listen to All Socket Events

```javascript
socket.onAny((eventName, ...args) => {
  console.log(`[Socket] ${eventName}:`, args);
});
```

---

## ⚠️ Known Issues

### TypeScript Errors (Expected - will resolve after npm install)

```
Cannot find module 'socket.io-client'
```

**Solution:** Run `npm install` to install dependencies.

### Tailwind Warnings

```
The class `bg-gradient-to-r` can be written as `bg-linear-to-r`
```

**Status:** Cosmetic warnings only - functionality not affected. Will be fixed in future Tailwind v4 update.

---

## 📖 Documentation

- **Full Guide:** [WEBSOCKET-INTEGRATION.md](./WEBSOCKET-INTEGRATION.md)
- **Backend API:** Check backend docs for Socket.IO events

---

## 🎯 Key Files

| File                                        | Purpose                      |
| ------------------------------------------- | ---------------------------- |
| `src/lib/services/socket.ts`                | Socket.IO connection & hooks |
| `src/lib/types/socket.ts`                   | TypeScript types for events  |
| `src/containers/seat-selection/SeatMap.tsx` | Real-time seat map updates   |
| `src/app/booking/[tripId]/page.tsx`         | Socket cleanup on page leave |

---

**Ready to test!** 🎉
