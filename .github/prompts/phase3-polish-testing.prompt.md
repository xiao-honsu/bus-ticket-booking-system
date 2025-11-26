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

### Task 3.1: Add Missing Fields & Endpoints (Priority: ⚠️ MEDIUM)

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

### Task 3.2: Comprehensive Testing (Priority: 🚨 CRITICAL)

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

### Task 3.3: Error Handling & Edge Cases

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

### Task 3.4: Performance Testing (Optional but Recommended)

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

### Task 3.5: Documentation Updates

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

---

## Expected Outcome

After Phase 3 completion:
- ✅ **All features fully implemented and tested**
- ✅ **All missing fields added**
- ✅ **Comprehensive testing completed**
- ✅ **System ready for production**
- ✅ **Can achieve 8.5/10.0 score (Criteria 1)**
- ✅ **Total effort: ~42 hours completed**

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
2. Check all environment variables are set
3. Verify database indexes created
4. Test email delivery in production environment
5. Test payment gateway in production mode
6. Review security settings
7. Enable CORS for frontend domain
8. Set up logging and monitoring

---

## Success Criteria

Phase 3 is complete when:
- [ ] All test suites pass
- [ ] No critical bugs remain
- [ ] All features work as specified in proposal
- [ ] Documentation is complete
- [ ] Code is clean and well-organized
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
