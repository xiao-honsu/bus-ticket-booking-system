# Phase 3: Polish & Testing Implementation

## Context
This is **Phase 3** (final phase) of the backend issues fixing plan. Phases 1 and 2 must be completed before starting this phase. You are now polishing the implementation, adding missing fields, and conducting comprehensive testing.

## Prerequisites
- ✅ Phase 1 completed (role system, guest booking, email notifications)
- ✅ Phase 2 completed (operator management, reviews, payment, seat locking, chatbot)
- Read `bus_ticket_proposal.md` for requirements context
- Review `plan-backendIssuesFixing.prompt.md` for overall analysis

## Current State After Phase 2
The backend now has:
- ✅ All critical features implemented
- ✅ Guest booking with email notifications
- ✅ Payment gateway integrated
- ✅ Review and rating system
- ✅ Seat locking mechanism
- ✅ Basic chatbot functionality
- ❌ Some minor fields missing
- ❌ Needs comprehensive testing

## Tasks to Complete in This Phase

### Task 3.1: Add Missing Fields & Endpoints (Priority: ⚠️ MEDIUM, Effort: 1-2 hours)

#### Subtask 3.1.1: Add `isActive` to Route Model

**Problem:** Routes should have an active/inactive status for admin to control visibility.

**Files to Modify:**
1. `Source/backend/src/models/route.model.ts`

**Implementation:**

```typescript
// Source/backend/src/models/route.model.ts

// Add to schema definition
isActive: {
  type: Boolean,
  default: true,
},

// Add to IRoute interface
export interface IRoute extends Document {
  // ... existing fields
  isActive: boolean;
}
```

#### Subtask 3.1.2: Add Route Activation Endpoints

**Files to Modify:**
1. `Source/backend/src/controllers/route.controller.ts`
2. `Source/backend/src/services/route.service.ts`
3. `Source/backend/src/routes/v1/route.route.ts`

**Implementation:**

```typescript
// Source/backend/src/services/route.service.ts

/**
 * Toggle route active status
 */
const toggleRouteStatus = async (routeId: mongoose.Types.ObjectId): Promise<IRoute | null> => {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Route not found');
  }

  route.isActive = !route.isActive;
  await route.save();
  return route;
};

export default {
  // ... existing exports
  toggleRouteStatus,
};
```

```typescript
// Source/backend/src/controllers/route.controller.ts

const toggleStatus = catchAsync(async (req, res) => {
  const route = await routeService.toggleRouteStatus(new mongoose.Types.ObjectId(req.params.routeId));
  res.send(route);
});

export default {
  // ... existing exports
  toggleStatus,
};
```

```typescript
// Source/backend/src/routes/v1/route.route.ts

router
  .route('/:routeId/toggle-status')
  .patch(auth('manageRoutes'), routeController.toggleStatus);
```

**Verification:**
- [ ] `isActive` field exists in Route model
- [ ] Admin can toggle route status
- [ ] Inactive routes can be filtered out in queries

---

#### Subtask 3.1.3: Integrate Search History Logging

**Problem:** Search history model exists but not integrated with trip search.

**Files to Modify:**
1. `Source/backend/src/controllers/trip.controller.ts` or wherever trip search is handled

**Implementation:**

```typescript
// In trip search controller/service

import SearchHistory from '../models/searchhistory.model';

// After successful trip search
if (req.user) {
  // Log search for authenticated users
  await SearchHistory.create({
    user: req.user._id,
    origin: req.query.origin,
    destination: req.query.destination,
    date: req.query.date,
  });
}
```

Optional endpoint to get user's search history:
```typescript
// Source/backend/src/controllers/user.controller.ts

const getSearchHistory = catchAsync(async (req, res) => {
  const history = await SearchHistory.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(10);
  res.send(history);
});
```

**Verification:**
- [ ] Search history saved for logged-in users
- [ ] Can retrieve user's search history

---

### Task 3.2: Comprehensive Testing (Priority: 🚨 CRITICAL, Effort: 2-3 hours)

**Note:** This task covers MANUAL testing with tools like Postman, Thunder Client, or curl. For automated testing with Jest, see Task 3.4.

#### Test Suite 1: Authentication & Authorization

**Test Cases:**

```typescript
// Manual testing checklist or write automated tests

describe('Authentication', () => {
  it('should register a new user', async () => {
    // POST /v1/auth/register
    // Verify: 201 status, user created, tokens returned
  });

  it('should login with correct credentials', async () => {
    // POST /v1/auth/login
    // Verify: 200 status, tokens returned
  });

  it('should reject login with wrong password', async () => {
    // POST /v1/auth/login with wrong password
    // Verify: 401 status
  });

  it('should refresh tokens', async () => {
    // POST /v1/auth/refresh-tokens
    // Verify: new tokens returned
  });
});

describe('Authorization', () => {
  it('should allow admin to manage operators', async () => {
    // POST /v1/operators with admin token
    // Verify: 201 status
  });

  it('should deny user from managing operators', async () => {
    // POST /v1/operators with user token
    // Verify: 403 status
  });
});
```

**Manual Test Steps:**
1. Register new user → Check email verification email sent
2. Login → Check tokens returned
3. Try accessing admin endpoints as user → Should be denied
4. Login as admin → Try admin operations → Should succeed

**Expected Results:**
- [ ] User registration works
- [ ] Email verification works
- [ ] Login returns valid tokens
- [ ] Token refresh works
- [ ] Role-based access control works
- [ ] Unauthorized access is blocked

---

#### Test Suite 2: Guest Booking Flow (CRITICAL)

**Test Scenario:** Complete guest checkout from search to payment

**Steps:**
1. Search for trips (no auth required)
   ```bash
   GET /v1/trips?origin=Hanoi&destination=HCM&date=2025-12-01
   ```
   ✅ Should return available trips

2. Create guest booking (no auth required)
   ```bash
   POST /v1/bookings/guest
   {
     "trip": "trip_id",
     "seats": ["A1", "A2"],
     "guestEmail": "test@example.com",
     "guestPhone": "0123456789",
     "passengers": [
       { "name": "John Doe", "age": 30, "gender": "male" }
     ]
   }
   ```
   ✅ Should create booking
   ✅ Should send confirmation email
   ✅ Booking status should be "pending"

3. Create payment link
   ```bash
   POST /v1/payments/create
   { "bookingId": "booking_id" }
   ```
   ✅ Should return PayOS checkout URL

4. Simulate payment webhook
   ```bash
   POST /v1/payments/webhook
   {
     "data": {
       "orderCode": "order_code",
       "code": "00",
       "id": "transaction_id"
     }
   }
   ```
   ✅ Booking status should update to "confirmed"
   ✅ Payment status should be "paid"
   ✅ Confirmation email should be sent

**Expected Results:**
- [ ] Guest can book without authentication
- [ ] Email notifications work for guests
- [ ] Payment integration works end-to-end
- [ ] Booking status updates correctly after payment

---

#### Test Suite 3: Email Notifications

**Test Cases:**

1. **Booking Confirmation Email**
   - Create a booking → Check email received
   - Verify email contains correct booking details
   - Verify email template renders properly

2. **Booking Cancellation Email**
   - Cancel a booking → Check email received
   - Verify refund information is correct

3. **Trip Update Email** (if implemented)
   - Update trip details → Check email sent to affected bookings

**Expected Results:**
- [ ] All email types send successfully
- [ ] Email templates display correctly
- [ ] Dynamic data (booking ID, prices, etc.) populates correctly
- [ ] Emails received in both Gmail and Outlook

---

#### Test Suite 4: Review System

**Test Scenario:** User leaves a review and others vote on it

**Steps:**
1. Create booking and complete it (set status to "confirmed")
2. Create review
   ```bash
   POST /v1/reviews
   {
     "booking": "booking_id",
     "trip": "trip_id",
     "rating": 5,
     "comment": "Great service!"
   }
   ```
   ✅ Should create review

3. Try creating duplicate review → Should fail
4. Another user upvotes the review
   ```bash
   POST /v1/reviews/:reviewId/vote
   { "voteType": "upvote" }
   ```
   ✅ Upvote count should increase

5. Same user changes vote to downvote
   ✅ Upvote should decrease, downvote should increase

6. User removes vote (clicks same button again)
   ✅ Vote should be removed

**Expected Results:**
- [ ] Can only review completed bookings
- [ ] Cannot review same trip twice
- [ ] Vote system works correctly
- [ ] Can update/delete own reviews
- [ ] Cannot modify others' reviews

---

#### Test Suite 5: Payment Integration

**Test Scenario:** End-to-end payment flow

**Steps:**
1. Create a booking
2. Create payment link → Should get PayOS URL
3. Open payment link in browser
4. Complete payment in sandbox mode
5. Check webhook received
6. Verify booking status updated
7. Verify payment status updated
8. Verify confirmation email sent

**Expected Results:**
- [ ] Payment link generates correctly
- [ ] PayOS sandbox payment works
- [ ] Webhook updates booking correctly
- [ ] Email sent after successful payment
- [ ] Can check payment status via API

---

#### Test Suite 6: Seat Locking Mechanism

**Test Scenario:** Prevent double booking

**Steps:**
1. User A locks seats A1, A2 for a trip
2. User B tries to book same seats → Should fail with error
3. Wait 10+ minutes for lock to expire
4. User B tries again → Should succeed

**Alternative Test:**
1. User A locks seats
2. User A completes booking → Locks should be released
3. User B can now book same seats for different trip

**Expected Results:**
- [ ] Seats are locked when selected
- [ ] Locked seats cannot be booked by others
- [ ] Locks expire after 10 minutes
- [ ] Locks release after successful booking
- [ ] Can view locked seats for a trip

---

#### Test Suite 7: Chatbot Functionality

**Test Scenario:** User interacts with chatbot

**Steps:**
1. Create chat session
   ```bash
   POST /v1/chatbot/sessions
   ```
   ✅ Should create session with welcome message

2. Send message: "search trips"
   ```bash
   POST /v1/chatbot/sessions/:sessionId/messages
   { "message": "search trips" }
   ```
   ✅ Should respond with search instructions

3. Send message: "my bookings"
   ✅ Should show user's bookings (if logged in)

4. Send message: "help"
   ✅ Should show available commands

**Expected Results:**
- [ ] Chat session creates successfully
- [ ] Bot responds to common intents
- [ ] Chat history persists
- [ ] Works for both guest and logged-in users

---

#### Test Suite 8: Operator Management

**Test Cases:**

1. **Create Operator** (admin only)
   ```bash
   POST /v1/operators
   {
     "name": "VIP Bus Line",
     "email": "contact@vipbus.com",
     "phone": "0123456789",
     "address": "123 Main St, Hanoi",
     "licenseNumber": "BUS123456"
   }
   ```
   ✅ Admin can create
   ✅ User cannot create (403)

2. **List Operators** (public)
   ```bash
   GET /v1/operators
   ```
   ✅ Anyone can view

3. **Update Operator** (admin only)
   ✅ Admin can update
   ✅ User cannot update

4. **Delete Operator** (admin only)
   ✅ Can delete if no active buses
   ✅ Cannot delete if has active buses

**Expected Results:**
- [ ] CRUD operations work correctly
- [ ] Permissions enforced properly
- [ ] Cannot delete operator with active buses

---

### Task 3.3: Error Handling & Edge Cases (Priority: ⚠️ HIGH, Effort: 1-2 hours)

**Test Edge Cases:**

1. **Invalid IDs**
   - Try accessing non-existent booking → 404 error
   - Try with invalid MongoDB ObjectId → 400 error

2. **Concurrent Bookings**
   - Two users try booking same seat simultaneously
   - Only one should succeed

3. **Payment Failures**
   - Simulate payment webhook with failure code
   - Booking should remain "pending"
   - No confirmation email sent

4. **Email Failures**
   - Disconnect email server
   - Booking should still succeed but log email error

5. **Token Expiry**
   - Use expired access token → 401 error
   - Refresh token should work

**Expected Results:**
- [ ] All errors handled gracefully
- [ ] Appropriate HTTP status codes returned
- [ ] Error messages are clear and helpful
- [ ] System doesn't crash on errors

---

### Task 3.4: Automated Testing with Jest (Priority: 🚨 CRITICAL)

**Objective:** Write comprehensive unit and integration tests using Jest to ensure code quality and prevent regressions.

**Prerequisites:**
- Jest already installed in `package.json` ✅
- TypeScript configuration ready (`ts-jest`)
- Test scripts available: `npm test`, `npm run test:watch`, `npm run coverage`

---

#### Subtask 3.4.1: Setup Jest Configuration

**Files to Create/Modify:**

1. **Create `Source/backend/jest.config.js`**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

2. **Create `Source/backend/tests/setup.ts`**

```typescript
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Setup: Connect to in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown: Disconnect and stop MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

3. **Install additional test dependencies:**

```bash
npm install --save-dev mongodb-memory-server @types/jest
```

**Verification:**
- [ ] Jest config file created
- [ ] Test setup file created
- [ ] Dependencies installed
- [ ] Can run `npm test` without errors

---

#### Subtask 3.4.2: Unit Tests - Services Layer

**Create `Source/backend/tests/unit/services/auth.service.test.ts`**

```typescript
import authService from '../../../src/services/auth.service';
import User from '../../../src/models/user.model';
import tokenService from '../../../src/services/token.service';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

describe('Auth Service - Unit Tests', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: faker.internet.email().toLowerCase(),
        password: 'Password123!',
        name: faker.person.fullName(),
      };

      const user = await authService.register(userData.email, userData.password, userData.name);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe('user');
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: faker.internet.email().toLowerCase(),
        password: 'Password123!',
        name: faker.person.fullName(),
      };

      const user = await authService.register(userData.email, userData.password, userData.name);
      
      expect(user.password).not.toBe(userData.password);
      const isMatch = await bcrypt.compare(userData.password, user.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      const email = faker.internet.email().toLowerCase();
      await authService.register(email, 'Password123!', faker.person.fullName());

      await expect(
        authService.register(email, 'Password123!', faker.person.fullName())
      ).rejects.toThrow('Email already taken');
    });
  });

  describe('loginUserWithEmailAndPassword', () => {
    it('should login with correct credentials', async () => {
      const password = 'Password123!';
      const email = faker.internet.email().toLowerCase();
      await authService.register(email, password, faker.person.fullName());

      const user = await authService.loginUserWithEmailAndPassword(email, password);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    it('should throw error with incorrect password', async () => {
      const email = faker.internet.email().toLowerCase();
      await authService.register(email, 'Password123!', faker.person.fullName());

      await expect(
        authService.loginUserWithEmailAndPassword(email, 'WrongPassword')
      ).rejects.toThrow('Incorrect email or password');
    });

    it('should throw error with non-existent email', async () => {
      await expect(
        authService.loginUserWithEmailAndPassword('nonexistent@example.com', 'Password123!')
      ).rejects.toThrow('Incorrect email or password');
    });
  });
});
```

**Create `Source/backend/tests/unit/services/booking.service.test.ts`**

```typescript
import bookingService from '../../../src/services/booking.service';
import Booking from '../../../src/models/booking.model';
import Trip from '../../../src/models/trip.model';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

describe('Booking Service - Unit Tests', () => {
  let mockTrip: any;

  beforeEach(async () => {
    // Create a mock trip for testing
    mockTrip = await Trip.create({
      bus: new mongoose.Types.ObjectId(),
      route: new mongoose.Types.ObjectId(),
      departureTime: new Date(Date.now() + 86400000), // Tomorrow
      arrivalTime: new Date(Date.now() + 90000000),
      price: 150000,
      availableSeats: ['A1', 'A2', 'B1', 'B2'],
    });
  });

  describe('createBooking', () => {
    it('should create a booking for authenticated user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const bookingData = {
        trip: mockTrip._id,
        seats: ['A1'],
        passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
      };

      const booking = await bookingService.createBooking(userId, bookingData);

      expect(booking).toBeDefined();
      expect(booking.user.toString()).toBe(userId.toString());
      expect(booking.seats).toEqual(['A1']);
      expect(booking.status).toBe('pending');
    });

    it('should create a guest booking without user', async () => {
      const bookingData = {
        trip: mockTrip._id,
        seats: ['A1'],
        guestEmail: 'guest@example.com',
        guestPhone: '0123456789',
        passengers: [{ name: 'Jane Doe', age: 25, gender: 'female' }],
      };

      const booking = await bookingService.createGuestBooking(bookingData);

      expect(booking).toBeDefined();
      expect(booking.guestEmail).toBe('guest@example.com');
      expect(booking.guestPhone).toBe('0123456789');
      expect(booking.user).toBeUndefined();
    });

    it('should calculate total price correctly', async () => {
      const bookingData = {
        trip: mockTrip._id,
        seats: ['A1', 'A2'], // 2 seats
        guestEmail: 'guest@example.com',
        guestPhone: '0123456789',
        passengers: [
          { name: 'John Doe', age: 30, gender: 'male' },
          { name: 'Jane Doe', age: 25, gender: 'female' },
        ],
      };

      const booking = await bookingService.createGuestBooking(bookingData);

      expect(booking.totalPrice).toBe(mockTrip.price * 2);
    });

    it('should throw error if seats not available', async () => {
      // Book first
      await bookingService.createGuestBooking({
        trip: mockTrip._id,
        seats: ['A1'],
        guestEmail: 'guest1@example.com',
        guestPhone: '0123456789',
        passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
      });

      // Try to book same seat
      await expect(
        bookingService.createGuestBooking({
          trip: mockTrip._id,
          seats: ['A1'],
          guestEmail: 'guest2@example.com',
          guestPhone: '0987654321',
          passengers: [{ name: 'Jane Doe', age: 25, gender: 'female' }],
        })
      ).rejects.toThrow('Seat A1 is not available');
    });
  });
});
```

**Create `Source/backend/tests/unit/services/seatlock.service.test.ts`**

```typescript
import seatlockService from '../../../src/services/seatlock.service';
import SeatLock from '../../../src/models/seatlock.model';
import mongoose from 'mongoose';

describe('SeatLock Service - Unit Tests', () => {
  let tripId: mongoose.Types.ObjectId;
  let sessionId: string;

  beforeEach(() => {
    tripId = new mongoose.Types.ObjectId();
    sessionId = 'test-session-123';
  });

  describe('lockSeats', () => {
    it('should lock seats successfully', async () => {
      const seats = ['A1', 'A2'];

      await seatlockService.lockSeats(tripId.toString(), seats, sessionId);

      const locks = await SeatLock.find({ trip: tripId });
      expect(locks).toHaveLength(2);
      expect(locks.map(l => l.seatNumber)).toEqual(expect.arrayContaining(seats));
    });

    it('should throw error if seat already locked by another session', async () => {
      await seatlockService.lockSeats(tripId.toString(), ['A1'], 'session-1');

      await expect(
        seatlockService.lockSeats(tripId.toString(), ['A1'], 'session-2')
      ).rejects.toThrow('Seat A1 is already locked');
    });

    it('should allow same session to lock already locked seat', async () => {
      await seatlockService.lockSeats(tripId.toString(), ['A1'], sessionId);

      // Should not throw
      await expect(
        seatlockService.lockSeats(tripId.toString(), ['A1'], sessionId)
      ).resolves.not.toThrow();
    });

    it('should set expiration time to 10 minutes', async () => {
      await seatlockService.lockSeats(tripId.toString(), ['A1'], sessionId);

      const lock = await SeatLock.findOne({ trip: tripId, seatNumber: 'A1' });
      expect(lock).toBeDefined();

      const now = new Date();
      const expiresAt = new Date(lock!.expiresAt);
      const diffMinutes = (expiresAt.getTime() - now.getTime()) / 1000 / 60;

      expect(diffMinutes).toBeGreaterThan(9);
      expect(diffMinutes).toBeLessThanOrEqual(10);
    });
  });

  describe('releaseSeats', () => {
    it('should release locked seats', async () => {
      await seatlockService.lockSeats(tripId.toString(), ['A1', 'A2'], sessionId);

      await seatlockService.releaseSeats(sessionId);

      const locks = await SeatLock.find({ sessionId });
      expect(locks).toHaveLength(0);
    });
  });

  describe('getLockedSeats', () => {
    it('should return locked seats for a trip', async () => {
      await seatlockService.lockSeats(tripId.toString(), ['A1', 'A2'], 'session-1');
      await seatlockService.lockSeats(tripId.toString(), ['B1'], 'session-2');

      const lockedSeats = await seatlockService.getLockedSeats(tripId.toString());

      expect(lockedSeats).toEqual(expect.arrayContaining(['A1', 'A2', 'B1']));
      expect(lockedSeats).toHaveLength(3);
    });

    it('should not return expired locks', async () => {
      // Create an expired lock manually
      await SeatLock.create({
        trip: tripId,
        seatNumber: 'A1',
        sessionId,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });

      const lockedSeats = await seatlockService.getLockedSeats(tripId.toString());

      expect(lockedSeats).toHaveLength(0);
    });
  });
});
```

**Verification:**
- [ ] Auth service tests pass (register, login, validation)
- [ ] Booking service tests pass (create booking, guest booking, pricing)
- [ ] Seat lock service tests pass (lock, release, expiration)
- [ ] Test coverage > 80% for services

---

#### Subtask 3.4.3: Integration Tests - API Endpoints

**Create `Source/backend/tests/integration/auth.test.ts`**

```typescript
import request from 'supertest';
import app from '../../src/app';
import { faker } from '@faker-js/faker';

describe('Auth API - Integration Tests', () => {
  describe('POST /v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const userData = {
        email: faker.internet.email().toLowerCase(),
        password: 'Password123!',
        name: faker.person.fullName(),
      };

      const res = await request(app)
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.user).toMatchObject({
        email: userData.email,
        name: userData.name,
        role: 'user',
      });
      expect(res.body.tokens).toBeDefined();
      expect(res.body.tokens.access).toBeDefined();
      expect(res.body.tokens.refresh).toBeDefined();
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(400);

      expect(res.body.message).toContain('email');
    });

    it('should return 400 if password is too weak', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: '123', // Too weak
          name: 'Test User',
        })
        .expect(400);

      expect(res.body.message).toContain('password');
    });

    it('should return 400 if email already exists', async () => {
      const email = faker.internet.email().toLowerCase();
      
      await request(app)
        .post('/v1/auth/register')
        .send({ email, password: 'Password123!', name: 'User 1' });

      const res = await request(app)
        .post('/v1/auth/register')
        .send({ email, password: 'Password123!', name: 'User 2' })
        .expect(400);

      expect(res.body.message).toContain('already taken');
    });
  });

  describe('POST /v1/auth/login', () => {
    const userCredentials = {
      email: faker.internet.email().toLowerCase(),
      password: 'Password123!',
      name: 'Test User',
    };

    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/register')
        .send(userCredentials);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(res.body.user.email).toBe(userCredentials.email);
      expect(res.body.tokens).toBeDefined();
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword',
        })
        .expect(401);

      expect(res.body.message).toContain('Incorrect');
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Register and login
      const registerRes = await request(app)
        .post('/v1/auth/register')
        .send({
          email: faker.internet.email().toLowerCase(),
          password: 'Password123!',
          name: 'Test User',
        });

      const refreshToken = registerRes.body.tokens.refresh.token;

      // Refresh tokens
      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.access).toBeDefined();
      expect(res.body.refresh).toBeDefined();
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});
```

**Create `Source/backend/tests/integration/booking.test.ts`**

```typescript
import request from 'supertest';
import app from '../../src/app';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Trip from '../../src/models/trip.model';
import Route from '../../src/models/route.model';
import Bus from '../../src/models/bus.model';

describe('Booking API - Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testTrip: any;

  beforeAll(async () => {
    // Create admin
    const adminRes = await request(app)
      .post('/v1/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!',
        name: 'Admin User',
      });
    adminToken = adminRes.body.tokens.access.token;

    // Create regular user
    const userRes = await request(app)
      .post('/v1/auth/register')
      .send({
        email: 'user@test.com',
        password: 'User123!',
        name: 'Regular User',
      });
    userToken = userRes.body.tokens.access.token;

    // Create test trip
    const route = await Route.create({
      origin: 'Hanoi',
      destination: 'Ho Chi Minh',
      distance: 1700,
      duration: 30,
    });

    const bus = await Bus.create({
      busNumber: 'BUS001',
      capacity: 40,
      type: 'sleeper',
      operator: new mongoose.Types.ObjectId(),
    });

    testTrip = await Trip.create({
      bus: bus._id,
      route: route._id,
      departureTime: new Date(Date.now() + 86400000),
      arrivalTime: new Date(Date.now() + 90000000),
      price: 200000,
      availableSeats: ['A1', 'A2', 'A3', 'B1', 'B2'],
    });
  });

  describe('POST /v1/bookings/guest', () => {
    it('should create guest booking without authentication', async () => {
      const res = await request(app)
        .post('/v1/bookings/guest')
        .send({
          trip: testTrip._id.toString(),
          seats: ['A1'],
          guestEmail: 'guest@example.com',
          guestPhone: '0123456789',
          passengers: [
            { name: 'John Doe', age: 30, gender: 'male' },
          ],
        })
        .expect(201);

      expect(res.body.guestEmail).toBe('guest@example.com');
      expect(res.body.seats).toEqual(['A1']);
      expect(res.body.status).toBe('pending');
      expect(res.body.totalPrice).toBe(200000);
    });

    it('should return 400 if guest email is missing', async () => {
      const res = await request(app)
        .post('/v1/bookings/guest')
        .send({
          trip: testTrip._id.toString(),
          seats: ['A2'],
          guestPhone: '0123456789',
          passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
        })
        .expect(400);

      expect(res.body.message).toContain('guestEmail');
    });

    it('should return 400 if trying to book unavailable seat', async () => {
      // Book seat first
      await request(app)
        .post('/v1/bookings/guest')
        .send({
          trip: testTrip._id.toString(),
          seats: ['A3'],
          guestEmail: 'guest1@example.com',
          guestPhone: '0123456789',
          passengers: [{ name: 'User 1', age: 30, gender: 'male' }],
        });

      // Try to book same seat
      const res = await request(app)
        .post('/v1/bookings/guest')
        .send({
          trip: testTrip._id.toString(),
          seats: ['A3'],
          guestEmail: 'guest2@example.com',
          guestPhone: '0987654321',
          passengers: [{ name: 'User 2', age: 25, gender: 'female' }],
        })
        .expect(400);

      expect(res.body.message).toContain('not available');
    });
  });

  describe('POST /v1/bookings', () => {
    it('should create booking for authenticated user', async () => {
      const res = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trip: testTrip._id.toString(),
          seats: ['B1'],
          passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
        })
        .expect(201);

      expect(res.body.seats).toEqual(['B1']);
      expect(res.body.user).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/v1/bookings')
        .send({
          trip: testTrip._id.toString(),
          seats: ['B2'],
          passengers: [{ name: 'John Doe', age: 30, gender: 'male' }],
        })
        .expect(401);
    });
  });

  describe('GET /v1/bookings', () => {
    it('should get user\'s own bookings', async () => {
      // Create a booking first
      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          trip: testTrip._id.toString(),
          seats: ['B2'],
          passengers: [{ name: 'Test User', age: 30, gender: 'male' }],
        });

      const res = await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.results).toBeInstanceOf(Array);
      expect(res.body.results.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/v1/bookings')
        .expect(401);
    });
  });
});
```

**Create `Source/backend/tests/integration/seatlock.test.ts`**

```typescript
import request from 'supertest';
import app from '../../src/app';
import mongoose from 'mongoose';
import Trip from '../../src/models/trip.model';
import SeatLock from '../../src/models/seatlock.model';

describe('SeatLock API - Integration Tests', () => {
  let testTrip: any;

  beforeEach(async () => {
    testTrip = await Trip.create({
      bus: new mongoose.Types.ObjectId(),
      route: new mongoose.Types.ObjectId(),
      departureTime: new Date(Date.now() + 86400000),
      arrivalTime: new Date(Date.now() + 90000000),
      price: 150000,
      availableSeats: ['A1', 'A2', 'A3'],
    });
  });

  describe('POST /v1/seatlock/lock', () => {
    it('should lock seats successfully', async () => {
      const res = await request(app)
        .post('/v1/seatlock/lock')
        .send({
          tripId: testTrip._id.toString(),
          seats: ['A1', 'A2'],
          sessionId: 'test-session-123',
        })
        .expect(200);

      expect(res.body.message).toContain('locked');
    });

    it('should return 400 if seat already locked', async () => {
      // Lock first
      await request(app)
        .post('/v1/seatlock/lock')
        .send({
          tripId: testTrip._id.toString(),
          seats: ['A1'],
          sessionId: 'session-1',
        });

      // Try to lock same seat with different session
      const res = await request(app)
        .post('/v1/seatlock/lock')
        .send({
          tripId: testTrip._id.toString(),
          seats: ['A1'],
          sessionId: 'session-2',
        })
        .expect(400);

      expect(res.body.message).toContain('already locked');
    });
  });

  describe('GET /v1/seatlock/locked/:tripId', () => {
    it('should return locked seats for a trip', async () => {
      await request(app)
        .post('/v1/seatlock/lock')
        .send({
          tripId: testTrip._id.toString(),
          seats: ['A1', 'A2'],
          sessionId: 'test-session',
        });

      const res = await request(app)
        .get(`/v1/seatlock/locked/${testTrip._id}`)
        .expect(200);

      expect(res.body.lockedSeats).toEqual(expect.arrayContaining(['A1', 'A2']));
    });

    it('should not include expired locks', async () => {
      // Create expired lock
      await SeatLock.create({
        trip: testTrip._id,
        seatNumber: 'A1',
        sessionId: 'expired-session',
        expiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(app)
        .get(`/v1/seatlock/locked/${testTrip._id}`)
        .expect(200);

      expect(res.body.lockedSeats).not.toContain('A1');
    });
  });

  describe('DELETE /v1/seatlock/release/:sessionId', () => {
    it('should release locked seats', async () => {
      const sessionId = 'release-test-session';

      await request(app)
        .post('/v1/seatlock/lock')
        .send({
          tripId: testTrip._id.toString(),
          seats: ['A1', 'A2'],
          sessionId,
        });

      await request(app)
        .delete(`/v1/seatlock/release/${sessionId}`)
        .expect(200);

      const locks = await SeatLock.find({ sessionId });
      expect(locks).toHaveLength(0);
    });
  });
});
```

**Verification:**
- [ ] All integration tests pass
- [ ] Auth endpoints tested (register, login, refresh)
- [ ] Booking endpoints tested (guest, authenticated)
- [ ] Seat lock endpoints tested (lock, release, get)
- [ ] Test coverage > 70% overall

---

#### Subtask 3.4.4: Run Tests and Generate Coverage Report

**Commands:**

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run tests in watch mode (during development):**
   ```bash
   npm run test:watch
   ```

3. **Generate coverage report:**
   ```bash
   npm run coverage
   ```

4. **View coverage report:**
   - Open `coverage/lcov-report/index.html` in browser

**Expected Coverage Targets:**
- **Overall coverage:** > 70%
- **Services layer:** > 80%
- **Controllers layer:** > 60%
- **Models layer:** > 50%

**Verification:**
- [ ] All tests pass (`npm test`)
- [ ] Coverage report generated
- [ ] Coverage meets minimum targets
- [ ] No failing tests
- [ ] CI/CD ready (tests can run in pipeline)

---

#### Subtask 3.4.5: Test Additional Features

**Create tests for remaining features:**

1. **Review System Tests:** `tests/integration/review.test.ts`
   - Create review
   - Upvote/downvote review
   - Prevent duplicate reviews
   - Only review completed bookings

2. **Payment Integration Tests:** `tests/integration/payment.test.ts`
   - Create payment link
   - Handle webhook
   - Update booking status after payment
   - Handle payment failures

3. **Operator Management Tests:** `tests/integration/operator.test.ts`
   - Admin can CRUD operators
   - Users cannot manage operators
   - Public can view operators

4. **Email Service Tests:** `tests/unit/services/email.service.test.ts`
   - Mock nodemailer
   - Test email template generation
   - Test email sending

**Example: Review Tests**

```typescript
describe('Review API - Integration Tests', () => {
  let userToken: string;
  let completedBooking: any;

  beforeAll(async () => {
    // Setup user and completed booking
    const userRes = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'user@test.com', password: 'Pass123!', name: 'User' });
    userToken = userRes.body.tokens.access.token;

    // Create and complete booking
    completedBooking = await Booking.create({
      user: userRes.body.user.id,
      trip: testTrip._id,
      seats: ['A1'],
      status: 'confirmed',
      totalPrice: 200000,
      passengers: [{ name: 'Test', age: 30, gender: 'male' }],
    });
  });

  it('should create review for completed booking', async () => {
    const res = await request(app)
      .post('/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        booking: completedBooking._id.toString(),
        trip: testTrip._id.toString(),
        rating: 5,
        comment: 'Excellent service!',
      })
      .expect(201);

    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe('Excellent service!');
  });

  it('should prevent duplicate reviews', async () => {
    // Create first review
    await request(app)
      .post('/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        booking: completedBooking._id.toString(),
        trip: testTrip._id.toString(),
        rating: 5,
        comment: 'Great!',
      });

    // Try to create second review
    const res = await request(app)
      .post('/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        booking: completedBooking._id.toString(),
        trip: testTrip._id.toString(),
        rating: 4,
        comment: 'Good!',
      })
      .expect(400);

    expect(res.body.message).toContain('already reviewed');
  });
});
```

**Verification:**
- [ ] Review tests pass
- [ ] Payment tests pass
- [ ] Operator tests pass
- [ ] Email tests pass (with mocked SMTP)
- [ ] All features have test coverage

---

### Task 3.5: Performance Testing (Optional but Recommended)

**Test Scenarios:**

1. **Load Testing**
   - 100 concurrent trip searches
   - 50 concurrent bookings
   - Measure response times

2. **Database Queries**
   - Check for N+1 query problems
   - Ensure indexes are used
   - Optimize slow queries

3. **Memory Leaks**
   - Run server for extended period
   - Monitor memory usage

**Tools:**
- Artillery for load testing
- MongoDB explain() for query analysis
- Node.js memory profiler

---

### Task 3.6: Documentation Updates

**Update API Documentation:**

1. Add new endpoints to Swagger/OpenAPI docs
2. Document all request/response formats
3. Add example requests for each endpoint
4. Document error codes and messages

**Update README:**

1. Add setup instructions for Phase 1-3 features
2. Document environment variables needed
3. Add testing instructions
4. Document payment gateway setup

**Testing Documentation:**

Add to README.md:

```markdown
## Testing

This project uses Jest for unit and integration testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run coverage
```

### Test Structure

- `tests/unit/` - Unit tests for services and utilities
- `tests/integration/` - Integration tests for API endpoints
- `tests/setup.ts` - Test configuration and database setup

### Coverage Targets

- Overall: > 70%
- Services: > 80%
- Controllers: > 60%

### Writing Tests

Example unit test:
\```typescript
import myService from '../src/services/myService';

describe('MyService', () => {
  it('should do something', async () => {
    const result = await myService.doSomething();
    expect(result).toBeDefined();
  });
});
\```

Example integration test:
\```typescript
import request from 'supertest';
import app from '../src/app';

describe('GET /v1/endpoint', () => {
  it('should return 200', async () => {
    const res = await request(app)
      .get('/v1/endpoint')
      .expect(200);
    
    expect(res.body).toBeDefined();
  });
});
\```
```

---

## Final Testing Checklist

### Core Features
- [ ] User registration and login work
- [ ] Guest booking works without authentication
- [ ] Email notifications sent correctly
- [ ] Payment integration works end-to-end
- [ ] Review system functional
- [ ] Seat locking prevents double booking
- [ ] Chatbot responds appropriately

### Admin Features
- [ ] Admin can manage operators
- [ ] Admin can manage routes
- [ ] Admin can view all bookings
- [ ] Admin can manage trips and buses

### Security
- [ ] Passwords are hashed
- [ ] JWT tokens work correctly
- [ ] Role-based access control enforced
- [ ] API rate limiting works
- [ ] Input validation prevents injection

### Performance
- [ ] API response times < 500ms for most requests
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Handles concurrent requests

### User Experience
- [ ] Error messages are clear
- [ ] Email templates look professional
- [ ] All features accessible via API
- [ ] Documentation complete

### Automated Testing (NEW)
- [ ] Jest configuration complete
- [ ] Unit tests written for all services
- [ ] Integration tests written for all endpoints
- [ ] Test coverage > 70% overall
- [ ] Test coverage > 80% for services
- [ ] All tests pass (`npm test`)
- [ ] Coverage report generated (`npm run coverage`)
- [ ] Tests can run in CI/CD pipeline

---

## Expected Outcome

After Phase 3 completion:
- ✅ **All features fully implemented and tested**
- ✅ **All missing fields added**
- ✅ **Comprehensive manual testing completed**
- ✅ **Automated tests with Jest completed (NEW)**
  - Unit tests for services
  - Integration tests for API endpoints
  - Test coverage > 70%
- ✅ **System ready for production**
- ✅ **Can achieve 8.5/10.0 score (Criteria 1)**
- ✅ **Total effort: ~48 hours completed** (42h + 6h for Jest tests)

---

## Deployment Preparation

### Environment Variables Checklist
```env
# Database
MONGODB_URL=mongodb://localhost:27017/bus-booking

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@busticket.com

# Payment (PayOS)
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Frontend URL (for payment redirects)
FRONTEND_URL=http://localhost:3000
```

### Pre-Deployment Steps
1. Run all tests and ensure they pass
   ```bash
   npm test
   npm run coverage  # Ensure > 70% coverage
   ```
2. Check all environment variables are set
3. Verify database indexes created
4. Test email delivery in production environment
5. Test payment gateway in production mode
6. Review security settings
7. Enable CORS for frontend domain
8. Set up logging and monitoring
9. Review test coverage report
10. Ensure no failing or skipped tests

---

## Success Criteria

Phase 3 is complete when:
- [ ] All manual test suites pass
- [ ] All automated Jest tests pass
- [ ] Test coverage > 70% overall
- [ ] Test coverage > 80% for services
- [ ] No critical bugs remain
- [ ] All features work as specified in proposal
- [ ] Documentation is complete and includes testing guide
- [ ] Code is clean and well-organized
- [ ] Coverage report generated and reviewed
- [ ] Ready for demo/presentation

---

## Next Steps After Phase 3

1. **Code Review**: Have team review all changes
2. **Integration**: Connect frontend to new backend features
3. **User Testing**: Get feedback from real users
4. **Optimization**: Profile and optimize slow areas
5. **Deployment**: Deploy to production server
6. **Monitoring**: Set up error tracking and analytics

---

## Need Help?

Reference files:
- `bus_ticket_proposal.md` - Original requirements
- `plan-backendIssuesFixing.prompt.md` - Full analysis
- `phase1-critical-fixes.prompt.md` - Phase 1 implementation
- `phase2-feature-completion.prompt.md` - Phase 2 implementation
