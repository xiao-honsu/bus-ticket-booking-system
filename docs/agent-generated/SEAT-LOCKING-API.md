# Seat Locking API Documentation

## Overview
The Seat Locking feature prevents double bookings by temporarily reserving seats for users during the booking process. Locks automatically expire after 10 minutes.

---

## Endpoints

### 1. Lock Seats
**POST** `/v1/seat-locks/lock`

Lock specific seats for a trip. This should be called when a user selects seats before completing the booking.

**Request Body:**
```json
{
  "tripId": "507f1f77bcf86cd799439011",
  "seatNumbers": ["A1", "A2", "B3"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Seats locked successfully",
  "data": {
    "id": "507f1f77bcf86cd799439022",
    "trip": "507f1f77bcf86cd799439011",
    "seatNumbers": ["A1", "A2", "B3"],
    "sessionId": "guest-1234567890-abc123",
    "expiresAt": "2025-11-26T10:10:00.000Z",
    "createdAt": "2025-11-26T10:00:00.000Z",
    "updatedAt": "2025-11-26T10:00:00.000Z"
  },
  "sessionId": "guest-1234567890-abc123"
}
```

**Notes:**
- Authentication is optional
- If authenticated, `sessionId` will be the user's ID
- If not authenticated, a unique guest session ID is generated
- **Store the returned `sessionId`** - you'll need it for booking and releasing locks
- Seats are locked for 10 minutes
- Returns 409 Conflict if seats are already locked or booked

---

### 2. Get Locked Seats for a Trip
**GET** `/v1/seat-locks/:tripId`

Retrieve all currently locked seats for a specific trip. Useful for displaying unavailable seats in the seat map.

**Parameters:**
- `tripId` (path parameter) - Trip ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tripId": "507f1f77bcf86cd799439011",
    "lockedSeats": ["A1", "A2", "B3", "C5"],
    "count": 4
  }
}
```

**Notes:**
- No authentication required
- Only returns currently active locks (not expired)
- Combine with trip's `bookedSeats` to get all unavailable seats

---

### 3. Release Locks
**POST** `/v1/seat-locks/release`

Release all seat locks associated with a session. Call this when a user cancels seat selection or leaves the booking page.

**Request Body:**
```json
{
  "sessionId": "guest-1234567890-abc123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 seat lock(s) released",
  "data": {
    "releasedCount": 3
  }
}
```

**Notes:**
- If authenticated, `sessionId` is optional (will use user ID)
- For guest users, `sessionId` is required
- Returns count of released locks
- Safe to call even if locks don't exist

---

### 4. Extend Lock Duration
**POST** `/v1/seat-locks/extend`

Extend the expiration time of existing locks. Useful if user needs more time to complete booking.

**Request Body:**
```json
{
  "sessionId": "guest-1234567890-abc123",
  "minutes": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 seat lock(s) extended",
  "data": {
    "extendedCount": 3
  }
}
```

**Notes:**
- `minutes` defaults to 10 if not provided
- Maximum extension: 30 minutes
- If authenticated, `sessionId` is optional
- Only extends locks that haven't expired yet

---

## Integration with Booking Flow

### Standard Booking Flow (Authenticated User)

```javascript
// 1. User selects seats
const lockResponse = await fetch('/v1/seat-locks/lock', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    tripId: '507f1f77bcf86cd799439011',
    seatNumbers: ['A1', 'A2']
  })
});

const { sessionId } = await lockResponse.json();
// Store sessionId in component state or local storage

// 2. User fills in booking details and confirms
const bookingResponse = await fetch('/v1/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    trip: '507f1f77bcf86cd799439011',
    passengers: [
      { name: 'John Doe', seatNumber: 'A1' },
      { name: 'Jane Doe', seatNumber: 'A2' }
    ],
    sessionId: sessionId // Include sessionId to verify lock ownership
  })
});

// Locks are automatically released after successful booking
```

### Guest Booking Flow

```javascript
// 1. Guest selects seats (no auth token)
const lockResponse = await fetch('/v1/seat-locks/lock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tripId: '507f1f77bcf86cd799439011',
    seatNumbers: ['A1', 'A2']
  })
});

const { sessionId } = await lockResponse.json();
// IMPORTANT: Store sessionId - guest users need this for booking

// 2. Guest completes booking
const bookingResponse = await fetch('/v1/bookings/guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    trip: '507f1f77bcf86cd799439011',
    guestEmail: 'guest@example.com',
    guestPhone: '+84901234567',
    passengers: [
      { name: 'John Doe', seatNumber: 'A1' },
      { name: 'Jane Doe', seatNumber: 'A2' }
    ],
    sessionId: sessionId // Required for guests
  })
});
```

### Canceling Seat Selection

```javascript
// User clicks "Cancel" or navigates away
await fetch('/v1/seat-locks/release', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId
  })
});
```

### Displaying Unavailable Seats

```javascript
// Fetch trip details and locked seats
const [tripResponse, locksResponse] = await Promise.all([
  fetch(`/v1/trips/${tripId}`),
  fetch(`/v1/seat-locks/${tripId}`)
]);

const trip = await tripResponse.json();
const locks = await locksResponse.json();

// Combine booked and locked seats
const unavailableSeats = [
  ...trip.bookedSeats,
  ...locks.data.lockedSeats
];

// Disable these seats in seat map UI
```

---

## Error Codes

| Status Code | Error Message | Description |
|------------|---------------|-------------|
| 400 | Invalid seat numbers | Requested seats don't exist in the trip |
| 404 | Trip not found | The specified trip doesn't exist |
| 409 | Seats already locked | One or more seats are locked by another user |
| 409 | Seats already booked | One or more seats are permanently booked |
| 409 | One or more seats are locked by another user | During booking, seats are locked by different session |

---

## Backend Service Methods

The seat locking service provides the following methods:

```typescript
// Lock seats
await seatLockService.lockSeats(
  tripId: mongoose.Types.ObjectId,
  seatNumbers: string[],
  sessionId: string,
  userId?: mongoose.Types.ObjectId
);

// Release locks by session
await seatLockService.releaseLocks(sessionId: string);

// Release specific seat locks
await seatLockService.releaseSpecificLocks(
  tripId: mongoose.Types.ObjectId,
  seatNumbers: string[],
  sessionId: string
);

// Check if seats are locked
await seatLockService.areSeatsLocked(
  tripId: mongoose.Types.ObjectId,
  seatNumbers: string[]
);

// Get all locked seats for a trip
await seatLockService.getLockedSeatsForTrip(
  tripId: mongoose.Types.ObjectId
);

// Extend lock duration
await seatLockService.extendLocks(
  sessionId: string,
  additionalMinutes?: number
);

// Check lock ownership
await seatLockService.doesSessionOwnLock(
  tripId: mongoose.Types.ObjectId,
  seatNumbers: string[],
  sessionId: string
);

// Manual cleanup (TTL index handles automatic cleanup)
await seatLockService.cleanupExpiredLocks();
```

---

## Database Schema

```typescript
interface ISeatLock {
  trip: ObjectId;           // Reference to Trip
  seatNumbers: string[];    // Array of seat identifiers (e.g., ["A1", "B2"])
  user?: ObjectId;          // Optional reference to User (for authenticated users)
  sessionId: string;        // Unique session identifier
  expiresAt: Date;          // Lock expiration timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- TTL index on `expiresAt` - automatically deletes expired locks
- Compound unique index on `(trip, seatNumbers)` - prevents duplicate locks
- Index on `sessionId` - fast lookup by session
- Index on `trip` - fast lookup by trip

---

## Best Practices

### Frontend Implementation

1. **Store sessionId**: Always store the returned sessionId after locking seats
2. **Show timer**: Display countdown timer to user (10 minutes)
3. **Auto-extend**: Consider extending locks if user is still active
4. **Release on exit**: Release locks when user leaves booking page
5. **Handle conflicts**: Show user-friendly message when seats are taken

### Backend Integration

1. **Always check locks**: Booking service automatically checks lock ownership
2. **Release after booking**: Locks are automatically released on successful booking
3. **Cleanup failures**: If booking fails, locks remain until expiry (prevents abuse)
4. **Monitor TTL**: Ensure MongoDB TTL index is working for automatic cleanup

### Testing Checklist

- [ ] Can lock available seats
- [ ] Cannot lock already booked seats
- [ ] Cannot lock already locked seats (by different session)
- [ ] Locks expire after 10 minutes
- [ ] Can extend lock duration
- [ ] Can release locks manually
- [ ] Booking succeeds with valid lock
- [ ] Booking fails with invalid/expired lock
- [ ] Locks release after successful booking
- [ ] Guest users can lock and book seats
- [ ] Authenticated users can lock and book seats

---

## Configuration

Default lock duration: **10 minutes**

To change, update `LOCK_DURATION_MINUTES` in `services/seatlock.service.ts`:

```typescript
const LOCK_DURATION_MINUTES = 10; // Change to desired value
```

---

## Monitoring

Monitor these metrics in production:

1. **Lock creation rate** - Track concurrent lock attempts
2. **Lock expiry rate** - How many locks expire without booking
3. **Lock conflicts** - How often users encounter locked seats
4. **Average lock duration** - Time from lock to booking completion

---

**Last Updated:** 2025-11-26
**Version:** 1.0.0
