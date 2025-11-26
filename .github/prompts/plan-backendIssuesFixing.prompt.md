# Backend Source Code Analysis vs Proposal Requirements

## MAJOR ISSUES FOUND

### 🚨 Issue 1: Role System Mismatch
**Location:** `Source/backend/src/config/roles.ts`

**Current Implementation:**
```typescript
const allRoles = {
  user: ['bookTicket', 'manageOwnBookings', 'getTrips', 'getBuses'],
  admin: ['getUsers', 'manageUsers', 'manageBuses', 'manageRoutes', 'manageTrips', 'manageBookings'],
  operator: ['manageBuses', 'manageTrips', 'getBookings'], // ❌ NOT IN PROPOSAL
};
```

**Proposal Requirement:**
- Only **2 roles**: `Passenger (User)` and `Administrator (Admin)`
- No `operator` role mentioned

**Fix Required:**
- Remove `operator` role completely
- Reassign operator permissions to `admin`
- Update all references to `operator` role in codebase

---

### 🚨 Issue 2: Missing Guest Checkout Flow
**Proposal Requirement (1.0/10.0):**
> "Allow user to book seats without register/login an account"

**Current Implementation:**
- `booking.model.ts` has `guestEmail` and `guestPhone` fields ✅
- But **no guest booking endpoints** in `booking.route.ts`
- All booking routes require authentication: `auth()` middleware ❌

**Fix Required:**
- Create separate guest booking endpoint: `POST /v1/bookings/guest`
- Remove `auth()` middleware for guest bookings
- Add validation for guest fields (`guestEmail`, `guestPhone`)

---

### 🚨 Issue 3: Missing Chatbot Feature
**Proposal Requirement (0.5/10.0):**
> "Allow user to interact with Chatbot to query trip/seat information and pay for a seat"

**Current Implementation:**
- Model exists: `chatsession.model.ts` ✅
- But **NO chatbot endpoints** in routes ❌
- No chatbot service implementation ❌

**Fix Required:**
- Create `src/routes/v1/chatbot.route.ts`
- Create `src/services/chatbot.service.ts`
- Implement endpoints:
  - `POST /v1/chatbot/sessions` - Create chat session
  - `POST /v1/chatbot/messages` - Send message
  - `GET /v1/chatbot/sessions/:sessionId` - Get chat history

---

### ⚠️ Issue 4: Missing Rating/Feedback System
**Proposal Requirement (0.25/10.0):**
> "Leave feedback and rate trips via 'My Bookings' dashboard"

**Current Implementation:**
- Model exists: `review.model.ts` ✅
- Model exists: `reviewvote.model.ts` ✅
- But **NO review endpoints** in routes ❌
- No review service implementation ❌

**Fix Required:**
- Create `src/routes/v1/review.route.ts`
- Create `src/services/review.service.ts`
- Implement endpoints:
  - `POST /v1/reviews` - Create review
  - `GET /v1/reviews` - Get reviews by trip/operator
  - `POST /v1/reviews/:reviewId/vote` - Upvote/downvote

---

### ⚠️ Issue 5: Missing Notification System
**Proposal Requirement (0.5/10.0):**
> "Send automatic email notifications for booking confirmation, cancellations and trip updates"

**Current Implementation:**
- Model exists: `notification.model.ts` ✅
- But **NO email service** ❌
- No notification endpoints ❌
- No email templates ❌

**Fix Required:**
- Install `nodemailer` (already in dependencies ✅)
- Create `src/services/email.service.ts`
- Create `src/services/notification.service.ts`
- Add email templates in `src/templates/`
- Integrate with booking flow:
  - Send confirmation email on booking creation
  - Send cancellation email
  - Send trip update notifications

---

### ⚠️ Issue 6: Operator Management Issues
**Current Implementation:**
- `operator.model.ts` exists ✅
- But **NO operator endpoints** in routes ❌
- Operator role exists but not in proposal ❌

**Proposal Context:**
- Proposal mentions "bus operators" and "bus companies"
- Admin should manage operators
- But no separate `operator` user role

**Fix Required:**
- Keep `Operator` as **data entity** (company/business)
- Remove `operator` as **user role**
- Create operator CRUD endpoints for admin:
  - `POST /v1/operators` (admin only)
  - `GET /v1/operators` (public)
  - `PATCH /v1/operators/:id` (admin only)
  - `DELETE /v1/operators/:id` (admin only)

---

### ⚠️ Issue 7: Missing Payment Integration Endpoints
**Proposal Requirement (1.0/10.0):**
> "Integrated payment functionality via any payment gateway or sandbox"

**Current Implementation:**
- Payment fields in `booking.model.ts` ✅
- Payment methods: `momo | zalopay | payos | card | bank_transfer` ✅
- But **NO payment processing endpoints** ❌
- No payment gateway integration ❌

**Fix Required:**
- Create `src/services/payment.service.ts`
- Implement payment gateway integration (PayOS/MoMo/ZaloPay)
- Create endpoints:
  - `POST /v1/payments/create` - Initiate payment
  - `POST /v1/payments/webhook` - Handle payment callback
  - `GET /v1/payments/:paymentId/status` - Check payment status

---

### ⚠️ Issue 8: Incomplete Route Management
**Proposal Requirement:**
> "Routes & Schedules: Defining all available routes, departure/arrival times, and pricing (0.5/10.0)"

**Current Implementation:**
- `route.model.ts` exists ✅
- `route.route.ts` exists ✅
- But missing `isActive` field in model (mentioned in proposal "active routes")

**Fix Required:**
- Add `isActive: boolean` field to Route model
- Add route activation/deactivation endpoints

---

### ⚠️ Issue 9: Missing Search History Feature
**Current Implementation:**
- Model exists: `searchhistory.model.ts` ✅
- But **NO search history endpoints** ❌
- Not integrated with trip search ❌

**Proposal Context:**
- Not explicitly required, but useful for UX
- Admin analytics might need this data

**Fix Required (Optional):**
- Integrate search logging in trip search
- Create endpoint: `GET /v1/users/search-history`

---

### ⚠️ Issue 10: Seat Locking Mechanism Incomplete
**Proposal Requirement:**
> "Select one or more available seats, which are then temporarily 'held'"

**Current Implementation:**
- Model exists: `seatlock.model.ts` ✅
- But **NO seat locking endpoints** ❌
- Not integrated with booking flow ❌

**Fix Required:**
- Create `src/services/seatlock.service.ts`
- Implement TTL-based seat locking (5-10 minutes)
- Integrate with booking flow:
  - Lock seats on selection
  - Release on booking completion/timeout
  - Check locks before booking

---

## IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Must Fix Before MVP)

#### 1.1 Fix Role System (2 hours)
```typescript
const allRoles = {
  user: [
    'bookTicket',
    'manageOwnBookings', 
    'getTrips',
    'getBuses',
    'getRoutes',
    'createReview',
    'manageOwnReviews'
  ],
  admin: [
    'getUsers',
    'manageUsers',
    'manageBuses',
    'manageRoutes', 
    'manageTrips',
    'manageBookings',
    'manageOperators', // Moved from operator role
    'viewAnalytics'
  ],
  // Remove operator role entirely
};
```

**Tasks:**
- [ ] Update `Source/backend/src/config/roles.ts`
- [ ] Remove `operator` from User model role enum
- [ ] Update all middleware checks
- [ ] Update route guards

---

#### 1.2 Implement Guest Booking (4 hours)
```typescript
router
  .route('/guest')
  .post(
    validate(bookingValidation.createGuestBooking), // No auth()
    bookingController.createGuestBooking
  );
```

**Tasks:**
- [ ] Create `bookingValidation.createGuestBooking`
- [ ] Create `bookingController.createGuestBooking`
- [ ] Update `bookingService.createBooking` to handle guest bookings
- [ ] Ensure `guestEmail` and `guestPhone` are required for guest bookings

---

#### 1.3 Implement Email Notifications (6 hours)
```typescript
const sendBookingConfirmation = async (booking: IBooking) => {
  const emailTemplate = generateBookingConfirmationEmail(booking);
  await transporter.sendMail({
    to: booking.user ? booking.user.email : booking.guestEmail,
    subject: 'Booking Confirmation',
    html: emailTemplate
  });
};
```

**Tasks:**
- [ ] Create `src/services/email.service.ts`
- [ ] Create email templates in `src/templates/`
  - `booking-confirmation.html`
  - `booking-cancellation.html`
  - `trip-update.html`
- [ ] Integrate with booking flow
- [ ] Add email config to `.env`

---

### Phase 2: Feature Completion (Before Submission)

#### 2.1 Implement Operator Management (4 hours)
```typescript
router
  .route('/')
  .post(auth('manageOperators'), validate(operatorValidation.createOperator), operatorController.createOperator)
  .get(validate(operatorValidation.getOperators), operatorController.getOperators);
```

**Tasks:**
- [ ] Create `src/controllers/operator.controller.ts`
- [ ] Create `src/services/operator.service.ts`
- [ ] Create `src/validations/operator.validation.ts`
- [ ] Create operator CRUD routes

---

#### 2.2 Implement Review System (5 hours)
```typescript
router
  .route('/')
  .post(auth('createReview'), validate(reviewValidation.createReview), reviewController.createReview)
  .get(validate(reviewValidation.getReviews), reviewController.getReviews);
```

**Tasks:**
- [ ] Create `src/controllers/review.controller.ts`
- [ ] Create `src/services/review.service.ts`
- [ ] Create `src/validations/review.validation.ts`
- [ ] Implement review voting system

---

#### 2.3 Implement Payment Integration (8 hours)
```typescript
const createPayment = async (bookingId: string, method: string) => {
  const booking = await Booking.findById(bookingId);
  
  switch(method) {
    case 'momo':
      return await processMomoPayment(booking);
    case 'payos':
      return await processPayOSPayment(booking);
    // ... other gateways
  }
};
```

**Tasks:**
- [ ] Create `src/services/payment.service.ts`
- [ ] Integrate PayOS/MoMo SDK
- [ ] Create payment routes
- [ ] Implement webhook handler
- [ ] Add payment config to `.env`

---

#### 2.4 Implement Seat Locking (4 hours)
```typescript
const lockSeats = async (tripId: string, seats: string[], userId: string) => {
  const locks = seats.map(seat => ({
    trip: tripId,
    seatNumber: seat,
    lockedBy: userId,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }));
  
  await SeatLock.insertMany(locks);
};
```

**Tasks:**
- [ ] Create `src/services/seatlock.service.ts`
- [ ] Implement lock/unlock/check endpoints
- [ ] Add TTL index to SeatLock model
- [ ] Integrate with booking flow

---

#### 2.5 Implement Chatbot (6 hours)
```typescript
const processMessage = async (sessionId: string, message: string) => {
  // Parse user intent
  // Call appropriate API (search trips, book seats, etc.)
  // Return response
};
```

**Tasks:**
- [ ] Create `src/services/chatbot.service.ts`
- [ ] Create chatbot routes
- [ ] Implement intent parsing (or LLM integration)
- [ ] Connect to existing APIs (trips, bookings)

---

### Phase 3: Polish & Testing (Before Deployment)

#### 3.1 Add Missing Fields (2 hours)
- [ ] Add `isActive` to Route model
- [ ] Add route activation endpoints

#### 3.2 Testing (4 hours)
- [ ] Test guest booking flow
- [ ] Test email notifications
- [ ] Test payment integration
- [ ] Test seat locking mechanism

---

## SUMMARY

### Issues Found: 10 major issues

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🚨 Critical | Role system mismatch | High | 2h |
| 🚨 Critical | Missing guest checkout | High (1.0/10.0) | 4h |
| 🚨 Critical | Missing chatbot | Medium (0.5/10.0) | 6h |
| ⚠️ High | Missing rating system | Medium (0.25/10.0) | 5h |
| ⚠️ High | Missing notifications | Medium (0.5/10.0) | 6h |
| ⚠️ High | Operator management | Medium | 4h |
| ⚠️ High | Payment integration | High (1.0/10.0) | 8h |
| ⚠️ Medium | Incomplete route mgmt | Low | 1h |
| ⚠️ Medium | Seat locking incomplete | Medium | 4h |
| ⚠️ Low | Missing search history | Low | 2h |

### Total Estimated Effort: **42 hours** (~5-6 working days)

### Score Impact:
- **Currently missing: ~3.5/10.0 points** (guest checkout, chatbot, notifications, payment, rating)
- **After fixes: Can achieve full 8.5/10.0 (Criteria 1)**
