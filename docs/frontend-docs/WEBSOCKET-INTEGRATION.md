# WebSocket Integration - Real-time Seat Reservation

**Date:** December 28, 2025  
**Status:** ✅ Completed

---

## 📋 Summary

Front-end đã được cập nhật để tích hợp **Socket.IO** cho tính năng đặt chỗ real-time, thay thế phương pháp polling cũ.

---

## 🔄 Changes Made

### 1. **Dependencies** - `package.json`

✅ Added `socket.io-client: ^4.8.1`

```bash
npm install
```

---

### 2. **TypeScript Types** - `src/lib/types/socket.ts` ✨ NEW

Định nghĩa đầy đủ types cho Socket.IO events:

- **Client → Server Events:**
  - `JoinTripPayload`, `LeaveTripPayload`, `PingResponse`
- **Server → Client Events:**
  - `SocketSeatLockedEvent`
  - `SocketSeatReleasedEvent`
  - `SocketSeatBookedEvent`
  - `SocketConnectedEvent`
- **Constants:** `SOCKET_EVENTS`
- **Type Guards:** `isSeatLockedEvent()`, `isSeatReleasedEvent()`, `isSeatBookedEvent()`

---

### 3. **Socket Service** - `src/lib/services/socket.ts` ✨ NEW

Quản lý Socket.IO connection & cung cấp React hooks:

#### Functions:

- `getSocket()` - Singleton socket instance
- `disconnectSocket()` - Cleanup connection

#### Hooks:

- **`useSocket()`** - Main hook, trả về `{ socket, isConnected }`
- **`useTripRoom(tripId, sessionId, handlers)`** - Join/leave room + listen events
  - Auto join khi `tripId` thay đổi
  - Auto leave khi component unmount
  - Handlers: `onSeatLocked`, `onSeatReleased`, `onSeatBooked`
- **`useSeatEvents(handlers)`** - Simplified event listener hook

**Configuration:**

```typescript
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

io(backendUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

---

### 4. **API Endpoints** - `src/lib/store/services/api.ts`

#### ❌ Removed:

- `checkSeatAvailability` - Không còn cần thiết với real-time
- `getLockedSeats` - Dữ liệu đã được gửi qua Socket events
- `useCheckSeatAvailabilityMutation`
- `useGetLockedSeatsQuery`

#### ✅ Updated:

**lockSeats:**

```typescript
// Response type
{
  id: string;
  trip: string;
  seatNumbers: string[];
  sessionId: string;
  expiresAt: string;  // ISO date
  createdAt: string;
  updatedAt: string;
}
```

**getTripSeatMap:**

```typescript
// Now accepts object with sessionId
query: (params: string | { tripId: string; sessionId?: string })
```

**extendLocks:**

```typescript
// Response type
{
  message: string;
  extendedCount: number;
  newExpiresAt: string; // ← NEW field
}
```

**releaseLocks:**

```typescript
// Response type
{
  message: string;
  releasedCount: number;
}
```

---

### 5. **SeatMap Component** - `src/containers/seat-selection/SeatMap.tsx`

#### Major Changes:

✅ **Removed polling:**

```typescript
// OLD
pollingInterval: 30000;

// NEW
pollingInterval: 0; // Disabled - rely on Socket.IO
```

✅ **Added Socket.IO integration:**

```typescript
const { isConnected, isInRoom } = useTripRoom(tripId, sessionId, {
  onSeatLocked: handleSeatLocked,
  onSeatReleased: handleSeatReleased,
  onSeatBooked: handleSeatBooked,
});
```

✅ **Event Handlers:**

**handleSeatLocked:**

- Check if it's our lock → skip (already in local state)
- Otherwise → show toast + refetch seat map

**handleSeatReleased:**

- If `reason === 'booked'` → toast "seats booked"
- Otherwise → toast "seats available"
- Refetch seat map

**handleSeatBooked:**

- Show toast notification
- Refetch seat map

✅ **Updated handleSeatClick:**

- Gọi `lockSeats` API ngay khi select/deselect
- Lưu `sessionId` từ response
- Lưu `expiresAt` vào Redux store
- Error handling cho 409 (Conflict)
- Auto refetch sau khi lock

---

### 6. **Booking Page** - `src/app/booking/[tripId]/page.tsx`

✅ **Added Socket cleanup:**

```typescript
import { getSocket } from '@/lib/services/socket';
import { SOCKET_EVENTS } from '@/lib/types/socket';

// In cleanup effect
const socket = getSocket();
if (socket) {
  socket.emit(SOCKET_EVENTS.LEAVE_TRIP, { tripId });
}
```

**Flow:**

1. User leaves page → release locks via API
2. Emit `LEAVE_TRIP` event
3. Socket disconnects gracefully

---

### 7. **SeatLockTimer** - `src/components/SeatLockTimer.tsx`

✅ **Updated extend lock handler:**

```typescript
// OLD
const newExpiryTime = new Date(Date.now() + 10 * 60 * 1000);
dispatch(setLockExpiresAt(newExpiryTime));

// NEW - Use response from API
const response = await extendLocks({ sessionId, minutes: 10 }).unwrap();
const newExpiryTime = new Date(response.newExpiresAt);
dispatch(setLockExpiresAt(newExpiryTime.toISOString()));
```

---

## 🔥 Real-time Features

### User Flow with Socket.IO:

1. **Join Trip Room:**

   ```
   User opens /booking/[tripId]
   → Socket connects
   → Emit joinTrip({ tripId, sessionId })
   → Backend confirms: { success: true, currentStatus }
   ```

2. **Select Seat:**

   ```
   User clicks seat
   → Call lockSeats API
   → Backend locks seat
   → Backend broadcasts seatLocked event to all users in room
   → All users see seat turn yellow/locked instantly
   ```

3. **Real-time Updates:**

   ```
   Another user locks seat
   → Your app receives seatLocked event
   → Toast notification: "Seat A3 locked by another user"
   → Seat map refreshes automatically
   ```

4. **Seat Released:**

   ```
   Lock expires / User cancels
   → Backend broadcasts seatReleased event
   → Toast: "Seat A3 is now available"
   → Seat map updates
   ```

5. **Seat Booked:**

   ```
   Booking confirmed
   → Backend broadcasts seatBooked event
   → Toast: "Seat A3 just got booked"
   → Seat turns red (booked)
   ```

6. **Leave Page:**
   ```
   User navigates away
   → Release locks via API
   → Emit leaveTrip event
   → Socket disconnects
   ```

---

## 🎨 UI Improvements

### Real-time Toast Notifications:

- 🔒 "Seats A3, B4 locked by another user"
- 🔓 "Seats A3, B4 are now available"
- 🎫 "Seats A3, B4 just got booked"
- ✅ "Seat A3 locked for you"

### No More Delays:

- ❌ **OLD:** Poll every 30 seconds → up to 30s delay
- ✅ **NEW:** Socket.IO events → **instant updates** (<100ms)

---

## ⚙️ Environment Variables

Make sure backend URL is configured:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🧪 Testing Guide

### Test Scenarios:

#### 1. **Multi-user Seat Locking:**

- Open 2 browser tabs (or incognito)
- Select same seat in both → One should get 409 error
- Select different seats → Both should see each other's locks in real-time

#### 2. **Lock Expiration:**

- Select seat
- Wait 10 minutes (or reduce timeout in backend for testing)
- Seat should auto-release and turn green

#### 3. **Seat Booking:**

- Complete payment flow
- Check that seat turns red (booked) in other users' views instantly

#### 4. **Network Disconnection:**

- Open DevTools → Network tab → Offline
- Wait a few seconds
- Go back online
- Socket should auto-reconnect

#### 5. **Page Navigation:**

- Select seats
- Navigate to another page
- Check backend logs → locks should be released
- `leaveTrip` event emitted

---

## 🐛 Debugging

### Check Socket Connection:

```javascript
// Browser console
const socket = getSocket();
console.log('Connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### Listen to All Events (Debug):

```javascript
socket.onAny((eventName, ...args) => {
  console.log(`[Socket Event] ${eventName}:`, args);
});
```

### Backend Logs:

```
✅ Socket connected: <socket-id>
✅ User joined trip room: <trip-id>
🔒 Seat locked: { tripId, seatNumbers, sessionId }
🔓 Seat released: { tripId, seatNumbers, reason }
```

---

## 📦 Files Modified

| File                                          | Status      | Description                      |
| --------------------------------------------- | ----------- | -------------------------------- |
| `package.json`                                | ✅ Modified | Added socket.io-client           |
| `src/lib/types/socket.ts`                     | ✨ NEW      | Socket event types               |
| `src/lib/services/socket.ts`                  | ✨ NEW      | Socket service & hooks           |
| `src/lib/store/services/api.ts`               | ✅ Modified | Updated API endpoints & types    |
| `src/containers/seat-selection/SeatMap.tsx`   | ✅ Modified | Socket integration + real-time   |
| `src/app/booking/[tripId]/page.tsx`           | ✅ Modified | Socket cleanup on unmount        |
| `src/components/SeatLockTimer.tsx`            | ✅ Modified | Use newExpiresAt from extend API |
| `docs/frontend-docs/WEBSOCKET-INTEGRATION.md` | ✨ NEW      | This documentation               |

---

## 🚀 Next Steps

### Optional Enhancements:

1. **Connection Status Indicator:**

   ```tsx
   {
     !isConnected && <Badge variant="destructive">Offline - Reconnecting...</Badge>;
   }
   ```

2. **Optimistic UI Updates:**
   - Update seat color immediately on click
   - Revert if API fails

3. **Sound Notifications:**

   ```javascript
   onSeatBooked: () => {
     new Audio('/notification.mp3').play();
   };
   ```

4. **User Count Display:**
   ```
   "15 people viewing this trip right now"
   ```

---

## 📞 Support

**Issues:**

- Check browser console for Socket errors
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend is running on port 4000

**Reference Docs:**

- [Backend API Docs](../agent-generated/SEAT-LOCKING-API.md)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)

---

**Last Updated:** December 28, 2025  
**Version:** 2.0.0 (WebSocket-enabled)
