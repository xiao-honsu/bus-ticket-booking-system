# WebSocket Real-time Debugging Guide

## 🎯 Mục Đích

Guide này giúp debug vấn đề WebSocket real-time sync không hoạt động giữa 2 browsers.

---

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. **Enhanced Logging System**

- ✅ Global event listeners để catch TẤT CẢ events
- ✅ Detailed connection status logs
- ✅ Room join/leave verification logs
- ✅ Event listener setup/cleanup logs
- ✅ Handler configuration logs

### 2. **Fixed Listener Dependencies**

- ✅ Sửa dependency array trong useEffect để tránh re-register listeners
- ✅ Stable handler refs với `useCallback`
- ✅ Proper cleanup on unmount

### 3. **UI Indicators**

- ✅ Real-time connection status indicator
- ✅ Visual feedback (green/yellow/red dot)

### 4. **Debug Utilities**

- ✅ `window.__testSeatLocked()` - Manual event trigger
- ✅ `window.__getSocket()` - Socket inspection

### 5. **RTK Query Error Handling** 🆕

- ✅ Fixed error extraction for RTK Query error structure
- ✅ RTK Query errors have format: `{ status: 409, data: { message, ... } }`
- ✅ Proper fallback chain: `error.data.message` → `error.data.error.message` → fallbacks
- ✅ Detailed error logging with `JSON.stringify(error, null, 2)`

### 6. **Deselect Feature** 🆕

- ✅ Click vào ghế đã selected để deselect
- ✅ Visual feedback: hover effect + scale animation
- ✅ Tooltip: "Click to deselect"
- ✅ Helper text hiện khi có ghế selected

---

## 🧪 Testing Procedure

### **Setup: 2 Browsers**

- Browser 1: Chrome (hoặc bất kỳ)
- Browser 2: Firefox/Edge (khác browser hoặc Incognito)

---

## 📋 Step-by-Step Testing

### **STEP 1: Browser 2 - Mở Trang Seat Selection**

**Expected Console Logs (theo thứ tự):**

```bash
# 1. Environment & Connection
[Socket.IO] API URL: http://localhost:4000
[Socket.IO] Connecting to: http://localhost:4000

# 2. Socket Connected
✅ [Socket.IO] Connected: abc123xyz
✅ [Socket.IO] Transport: websocket

# 3. Server Handshake
✅ [Socket.IO] Server handshake complete
   Socket ID: abc123xyz
   Server time: 2025-12-28T...

# 4. Joining Room
📤 [Socket.IO] Joining trip room: { tripId: '675d...', sessionId: 'guest-456' }

# 5. Joined Successfully
✅ [Socket.IO] Joined trip room: 675d...
   Current status: { availableSeats: 40, lockedSeats: 0, bookedSeats: 0 }
📌 [Socket.IO] Room joined, listeners should be active now

# 6. Listener Setup
🎯 [Socket.IO] Setting up event listeners for trip: 675d...
   ✅ Registered listener: seatLocked
   ✅ Registered listener: seatReleased
   ✅ Registered listener: seatBooked

# 7. Handler Configuration
🎯 [SeatMap] Socket handlers configured: {
  hasLockHandler: true,
  hasReleaseHandler: true,
  hasBookedHandler: true
}

# 8. Connection Status
🔌 [WebSocket] Connection status: {
  isConnected: true,
  isInRoom: true,
  tripId: '675d...',
  sessionId: 'guest-456'
}
✅ [WebSocket] Ready to receive events!
```

**UI Indicator:**

- 🟢 Green dot + "Real-time sync active"

---

### **STEP 2: Backend Terminal - Verify Room Join**

**Expected Backend Logs:**

```bash
Socket abc123xyz connected: abc123xyz
Socket abc123xyz joined trip room: trip:675d8fee9d61ad3be0ed45f5 (now 2 clients in room)
```

**⚠️ Nếu thấy `(now 1 clients)`:**

- Browser 1 chưa mở hoặc đã disconnect
- Mở Browser 1 và verify

---

### **STEP 3: Browser 1 - Lock Ghế B1**

**Browser 1 Actions:**

1. Click vào ghế B1
2. Wait for success message

**Expected Browser 1 Logs:**

```bash
# API call successful
Lock successful
```

**Expected Backend Terminal Logs:**

```bash
[Lock Request] Trip: 675d..., Seats: B1, Session: guest-123
[Lock Success] Seats B1 locked, expires at 2025-12-28T10:35:00.000Z
[Socket.IO] ✅ Emitted seatLocked to room trip:675d... (2 clients): {
  seatNumbers: [ 'B1' ],
  sessionId: 'guest-123',
  expiresAt: '2025-12-28T10:35:00.000Z',
  ...
}
```

**Key metric:** `(2 clients)` - Confirm có 2 browsers trong room

---

### **STEP 4: Browser 2 - Verify Event Received**

**Expected Browser 2 Console Logs (IMMEDIATELY after Browser 1 locks):**

```bash
# 1. Global listener catches event FIRST
🔔 [Global Listener] SEAT_LOCKED event received: {
  tripId: '675d...',
  seatNumbers: [ 'B1' ],
  sessionId: 'guest-123',
  expiresAt: '2025-12-28T10:35:00.000Z',
  ...
}

# 2. Generic onAny listener
📨 [Socket.IO] Received event: seatLocked [ {...} ]

# 3. Component handler fires
🔒 [Seat Event] Seat locked event received: { ... }
   Locked seats: [ 'B1' ]
   Session ID: guest-123
   Current user session: guest-456
⚠️ [Seat Event] Another user locked seats, refreshing...
```

**Expected UI Changes:**

- 🔴 Toast notification: "Seats B1 locked by another user"
- Ghế B1 đổi màu sang locked/disabled

---

### **STEP 5: Browser 2 - Click Ghế B1 (Expect 409)**

**Expected Console Logs:**

```bash
Failed to lock seat: { ... }
Lock error details: {
  fullError: { ... },
  extractedMessage: 'Seats B1 are already locked by another user',
  statusCode: 409,
  data: { success: false, message: '...', statusCode: 409 }
}
```

**Expected UI:**

- 🔴 Toast: "This seat was just locked by another user"

---

## ❌ Troubleshooting

### **Issue 1: Không thấy log `[Socket.IO] Connecting to`**

**Problem:** Environment variable không load

**Solution:**

```bash
# Check .env.local file exists
# Add:
NEXT_PUBLIC_API_URL=http://localhost:4000

# Restart dev server
npm run dev
```

---

### **Issue 2: Không thấy `✅ Connected`**

**Problem:** Backend không chạy hoặc CORS issue

**Solution:**

1. Check backend running: `http://localhost:4000/health`
2. Check Network tab → WS connection status
3. Verify backend CORS config allows `http://localhost:3000`

---

### **Issue 3: Connected nhưng KHÔNG join room**

**Problem:** `socket.emit('joinTrip')` không được gọi

**Solution:**

1. Verify `useTripRoom` hook được gọi
2. Check `tripId` không null
3. Check `isConnected` state

---

### **Issue 4: Joined room NHƯNG không nhận event**

**Symptoms:**

- Backend log: `(2 clients in room)`
- Browser 2 KHÔNG thấy `🔔 [Global Listener] SEAT_LOCKED`

**Problem:** Event listener không được register hoặc event name sai

**Debug Steps:**

**A. Test với Global Listener:**

```javascript
// Browser 2 console
const socket = window.__getSocket();
// Should show: { connected: true, listeners: 1+ }
```

**B. Manual Test Event:**

```javascript
// Browser 2 console - Trigger test event locally
window.__testSeatLocked('675d...', ['B1', 'B2']);

// Should see:
// 🔔 [Global Listener] SEAT_LOCKED event received
// 🔒 [Seat Event] Seat locked event received
```

**C. Verify Event Name:**

```javascript
// Check backend emits 'seatLocked' (camelCase)
// Frontend listens to SOCKET_EVENTS.SEAT_LOCKED = 'seatLocked'
```

---

### **Issue 5: Global Listener nhận NHƯNG Component handler KHÔNG fire**

**Problem:** Handler dependency issue hoặc removed

**Solution:**

1. Check console có log `🎯 [SeatMap] Socket handlers configured`
2. Verify tất cả `hasXxxHandler: true`
3. Check không có cleanup được gọi sớm

---

### **Issue 7: Error Message Hiển Thị `{}` Thay Vì Message** 🆕

**Symptoms:**

- Console log: `Failed to lock seat: {}`
- Hoặc toast hiển thị "Failed to lock seat" thay vì message cụ thể

**Problem:** RTK Query error structure khác với expected

**RTK Query Error Structure:**

```typescript
{
  status: 409,              // HTTP status code
  data: {                   // Backend response
    success: false,
    statusCode: 409,
    message: "Seats B1 are already locked by another user",
    error: {
      code: 409,
      message: "..."
    }
  }
}
```

**Solution:**

Check console log `Lock error details:` để xem full error structure:

```javascript
Lock error details: {
  fullError: "{ status: 409, data: {...} }",  // Full JSON
  extractedMessage: "Seats B1 are already locked by another user",
  statusCode: 409,
  errorData: { success: false, message: "..." }
}
```

**Nếu vẫn thấy `{}`:**

1. Check backend có trả về proper error response không
2. Verify CORS headers (có thể block error response body)
3. Check Network tab → Response của API call bị fail

---

### **Issue 8: Click Ghế Selected Không Deselect** 🆕

**Symptoms:**

- Click vào ghế đã selected (màu cam) nhưng không deselect

**Problem:** Logic check hoặc state sync issue

**Debug:**

```javascript
// Console khi click ghế selected
🔄 [Seat Action] Deselecting seat: B1

// Nếu KHÔNG thấy log này → handleSeatClick không fire hoặc bị block
```

**Solution:**

1. Verify `seat.status === 'selected'` hoặc `localSelectedSeats.includes(seat.seatNumber)`
2. Check không có error trong try-catch block
3. Verify `seat.selectable === true`

---

### **Issue 6: Backend emit nhưng Frontend KHÔNG nhận**

**Symptoms:**

- Backend: `[Socket.IO] ✅ Emitted seatLocked to room ... (2 clients)`
- Browser 2: KHÔNG có bất kỳ log nào

**Debug:**

**A. Verify Socket ID:**

```javascript
// Browser 2 console
window.__getSocket();
// Note the socket ID
```

**B. Check Backend có broadcast đúng không:**

```typescript
// Backend should use:
io.to(`trip:${tripId}`).emit('seatLocked', data);

// NOT:
socket.emit('seatLocked', data); // Only to sender
```

---

## 🔧 Debug Commands (Browser Console)

### **1. Check Socket Status**

```javascript
window.__getSocket();
// Returns: { id, connected, listeners }
```

### **2. Test Manual Event**

```javascript
// Simulate another user locking seats
window.__testSeatLocked('675d8fee9d61ad3be0ed45f5', ['B1', 'B2']);
```

### **3. Inspect Listeners**

```javascript
const socket = window.__getSocket();
console.log('Listeners:', {
  seatLocked: socket.listeners('seatLocked').length,
  seatReleased: socket.listeners('seatReleased').length,
  seatBooked: socket.listeners('seatBooked').length,
});
```

---

## 📊 Expected Flow Diagram

```
Browser 1                  Backend                   Browser 2
    |                         |                          |
    |-- Lock B1 ------------>|                          |
    |                         |-- Lock in DB            |
    |<----- 200 OK -----------|                          |
    |                         |                          |
    |                         |-- emit('seatLocked') -->|
    |                         |   to room (2 clients)    |
    |                         |                          |
    |                         |                          |-- 🔔 Global Listener
    |                         |                          |-- 🔒 Component Handler
    |                         |                          |-- Refetch seat map
    |                         |                          |-- Update UI
```

---

## 📞 Escalation Checklist

**Nếu sau khi làm theo guide vẫn không work, share:**

### **Frontend Logs (Browser 2):**

1. Full console log từ khi load trang
2. Network tab → WS tab → Connection status & messages
3. `window.__getSocket()` output

### **Backend Logs:**

1. Room join logs
2. Lock success logs
3. Socket emit logs với client count

### **Code Snippets:**

1. `useTripRoom` implementation
2. `handleSeatLocked` handler
3. Backend socket emit code

---

## ✅ Success Criteria

**Test PASS khi:**

- ✅ Browser 2 thấy `🔔 [Global Listener] SEAT_LOCKED`
- ✅ Browser 2 thấy `🔒 [Seat Event] Seat locked event received`
- ✅ Browser 2 UI update ngay lập tức (ghế B1 → locked)
- ✅ Backend log `(2 clients in room)`

---

**Last Updated:** 2025-12-28  
**Version:** Frontend Debug v2.0
