# Phase 2: Feature Completion Implementation

## Context
This is **Phase 2** of the backend issues fixing plan. Phase 1 (critical fixes) must be completed before starting this phase. You are now implementing the remaining features required by the proposal to achieve full functionality.

## Prerequisites
- ✅ Phase 1 completed (role system fixed, guest booking works, email notifications active)
- Read `bus_ticket_proposal.md` for requirements context
- Review `plan-backendIssuesFixing.prompt.md` for overall analysis
- Backend is located in `Source/backend/`

## Current State After Phase 1
The backend now has:
- ✅ Correct 2-role system (`user`, `admin`)
- ✅ Guest booking flow working
- ✅ Email notification system active
- ❌ No operator management endpoints
- ❌ No review/rating system
- ❌ No payment integration
- ❌ No seat locking mechanism
- ❌ No chatbot functionality

## Tasks to Complete in This Phase

### Task 2.1: Implement Operator Management (Priority: ⚠️ HIGH)

**Problem:** Operator model exists but has no CRUD endpoints. Admin should be able to manage bus operators (companies).

**Files to Create:**
1. `Source/backend/src/controllers/operator.controller.ts`
2. `Source/backend/src/services/operator.service.ts`
3. `Source/backend/src/validations/operator.validation.ts`
4. `Source/backend/src/routes/v1/operator.route.ts`

**Files to Modify:**
1. `Source/backend/src/routes/v1/index.ts` (register operator routes)
2. `Source/backend/src/services/index.ts` (export operator service)

**Implementation Steps:**

#### Step 1: Create Operator Validation
```typescript
// Source/backend/src/validations/operator.validation.ts

import Joi from 'joi';
import { objectId } from './custom.validation';

const createOperator = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().required().regex(/^[0-9]{10,11}$/),
    address: Joi.string().required(),
    licenseNumber: Joi.string().required(),
    isActive: Joi.boolean().default(true),
    description: Joi.string().max(500),
  }),
};

const getOperators = {
  query: Joi.object().keys({
    name: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOperator = {
  params: Joi.object().keys({
    operatorId: Joi.string().custom(objectId),
  }),
};

const updateOperator = {
  params: Joi.object().keys({
    operatorId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(100),
      email: Joi.string().email(),
      phone: Joi.string().regex(/^[0-9]{10,11}$/),
      address: Joi.string(),
      licenseNumber: Joi.string(),
      isActive: Joi.boolean(),
      description: Joi.string().max(500),
    })
    .min(1),
};

const deleteOperator = {
  params: Joi.object().keys({
    operatorId: Joi.string().custom(objectId),
  }),
};

export default {
  createOperator,
  getOperators,
  getOperator,
  updateOperator,
  deleteOperator,
};
```

#### Step 2: Create Operator Service
```typescript
// Source/backend/src/services/operator.service.ts

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Operator from '../models/operator.model';
import ApiError from '../utils/ApiError';
import { IOperator } from '../models/operator.model';

/**
 * Create an operator
 * @param {object} operatorBody
 * @returns {Promise<IOperator>}
 */
const createOperator = async (operatorBody: Partial<IOperator>): Promise<IOperator> => {
  // Check if operator with same email already exists
  if (await Operator.findOne({ email: operatorBody.email })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Operator email already exists');
  }
  
  // Check if license number already exists
  if (await Operator.findOne({ licenseNumber: operatorBody.licenseNumber })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'License number already registered');
  }

  return Operator.create(operatorBody);
};

/**
 * Query for operators
 * @param {object} filter - Mongo filter
 * @param {object} options - Query options
 * @returns {Promise<IOperator[]>}
 */
const queryOperators = async (filter: any, options: any) => {
  const operators = await Operator.find(filter)
    .sort(options.sortBy)
    .limit(options.limit)
    .skip((options.page - 1) * options.limit);
  
  return operators;
};

/**
 * Get operator by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IOperator>}
 */
const getOperatorById = async (id: mongoose.Types.ObjectId): Promise<IOperator | null> => {
  return Operator.findById(id);
};

/**
 * Update operator by id
 * @param {mongoose.Types.ObjectId} operatorId
 * @param {object} updateBody
 * @returns {Promise<IOperator>}
 */
const updateOperatorById = async (
  operatorId: mongoose.Types.ObjectId,
  updateBody: Partial<IOperator>
): Promise<IOperator | null> => {
  const operator = await getOperatorById(operatorId);
  if (!operator) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Operator not found');
  }

  // Check if email is being updated and is already taken
  if (updateBody.email && (await Operator.findOne({ email: updateBody.email, _id: { $ne: operatorId } }))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Object.assign(operator, updateBody);
  await operator.save();
  return operator;
};

/**
 * Delete operator by id
 * @param {mongoose.Types.ObjectId} operatorId
 * @returns {Promise<IOperator>}
 */
const deleteOperatorById = async (operatorId: mongoose.Types.ObjectId): Promise<IOperator | null> => {
  const operator = await getOperatorById(operatorId);
  if (!operator) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Operator not found');
  }
  
  // Check if operator has active buses
  const Bus = mongoose.model('Bus');
  const activeBuses = await Bus.countDocuments({ operator: operatorId });
  if (activeBuses > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete operator with active buses');
  }

  await operator.deleteOne();
  return operator;
};

export default {
  createOperator,
  queryOperators,
  getOperatorById,
  updateOperatorById,
  deleteOperatorById,
};
```

#### Step 3: Create Operator Controller
```typescript
// Source/backend/src/controllers/operator.controller.ts

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import operatorService from '../services/operator.service';
import pick from '../utils/pick';

const createOperator = catchAsync(async (req, res) => {
  const operator = await operatorService.createOperator(req.body);
  res.status(httpStatus.CREATED).send(operator);
});

const getOperators = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Set defaults
  options.limit = options.limit ? parseInt(options.limit as string) : 10;
  options.page = options.page ? parseInt(options.page as string) : 1;
  
  const result = await operatorService.queryOperators(filter, options);
  res.send(result);
});

const getOperator = catchAsync(async (req, res) => {
  const operator = await operatorService.getOperatorById(new mongoose.Types.ObjectId(req.params.operatorId));
  if (!operator) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Operator not found');
  }
  res.send(operator);
});

const updateOperator = catchAsync(async (req, res) => {
  const operator = await operatorService.updateOperatorById(new mongoose.Types.ObjectId(req.params.operatorId), req.body);
  res.send(operator);
});

const deleteOperator = catchAsync(async (req, res) => {
  await operatorService.deleteOperatorById(new mongoose.Types.ObjectId(req.params.operatorId));
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createOperator,
  getOperators,
  getOperator,
  updateOperator,
  deleteOperator,
};
```

#### Step 4: Create Operator Routes
```typescript
// Source/backend/src/routes/v1/operator.route.ts

import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import operatorValidation from '../../validations/operator.validation';
import operatorController from '../../controllers/operator.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('manageOperators'), validate(operatorValidation.createOperator), operatorController.createOperator)
  .get(validate(operatorValidation.getOperators), operatorController.getOperators); // Public

router
  .route('/:operatorId')
  .get(validate(operatorValidation.getOperator), operatorController.getOperator) // Public
  .patch(auth('manageOperators'), validate(operatorValidation.updateOperator), operatorController.updateOperator)
  .delete(auth('manageOperators'), validate(operatorValidation.deleteOperator), operatorController.deleteOperator);

export default router;
```

#### Step 5: Register Routes
```typescript
// Source/backend/src/routes/v1/index.ts

import operatorRoute from './operator.route';

// Add to routes array
router.use('/operators', operatorRoute);
```

#### Step 6: Export Service
```typescript
// Source/backend/src/services/index.ts

export { default as operatorService } from './operator.service';
```

**Verification:**
- [ ] Admin can create operators (POST `/v1/operators`)
- [ ] Anyone can view operators (GET `/v1/operators`)
- [ ] Admin can update operators (PATCH `/v1/operators/:id`)
- [ ] Admin can delete operators (DELETE `/v1/operators/:id`)
- [ ] Cannot delete operator with active buses

---

### Task 2.2: Implement Review System (Priority: ⚠️ HIGH)

**Problem:** Proposal requires "Leave feedback and rate trips" (0.25/10.0 points). Models exist but no endpoints.

**Files to Create:**
1. `Source/backend/src/controllers/review.controller.ts`
2. `Source/backend/src/services/review.service.ts`
3. `Source/backend/src/validations/review.validation.ts`
4. `Source/backend/src/routes/v1/review.route.ts`

**Implementation Steps:**

#### Step 1: Create Review Validation
```typescript
// Source/backend/src/validations/review.validation.ts

import Joi from 'joi';
import { objectId } from './custom.validation';

const createReview = {
  body: Joi.object().keys({
    booking: Joi.string().required().custom(objectId),
    trip: Joi.string().required().custom(objectId),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500),
    operator: Joi.string().custom(objectId),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    trip: Joi.string().custom(objectId),
    operator: Joi.string().custom(objectId),
    rating: Joi.number().integer().min(1).max(5),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      rating: Joi.number().integer().min(1).max(5),
      comment: Joi.string().max(500),
    })
    .min(1),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
};

const voteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    voteType: Joi.string().valid('upvote', 'downvote').required(),
  }),
};

export default {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  voteReview,
};
```

#### Step 2: Create Review Service
```typescript
// Source/backend/src/services/review.service.ts

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Review from '../models/review.model';
import ReviewVote from '../models/reviewvote.model';
import Booking from '../models/booking.model';
import ApiError from '../utils/ApiError';

/**
 * Create a review
 */
const createReview = async (userId: mongoose.Types.ObjectId, reviewBody: any) => {
  // Verify booking exists and belongs to user
  const booking = await Booking.findOne({ _id: reviewBody.booking, user: userId });
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found or does not belong to you');
  }

  // Check if booking is completed
  if (booking.status !== 'confirmed') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Can only review completed bookings');
  }

  // Check if user already reviewed this trip
  const existingReview = await Review.findOne({ user: userId, trip: reviewBody.trip });
  if (existingReview) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already reviewed this trip');
  }

  const review = await Review.create({
    ...reviewBody,
    user: userId,
  });

  return review.populate('user', 'name');
};

/**
 * Get reviews
 */
const queryReviews = async (filter: any, options: any) => {
  const reviews = await Review.find(filter)
    .populate('user', 'name')
    .populate('trip', 'departureTime')
    .sort(options.sortBy || '-createdAt')
    .limit(options.limit)
    .skip((options.page - 1) * options.limit);

  return reviews;
};

/**
 * Update review
 */
const updateReview = async (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  updateBody: any
) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found or you are not authorized');
  }

  Object.assign(review, updateBody);
  await review.save();
  return review;
};

/**
 * Delete review
 */
const deleteReview = async (reviewId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => {
  const review = await Review.findOne({ _id: reviewId, user: userId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found or you are not authorized');
  }

  await review.deleteOne();
  return review;
};

/**
 * Vote on review
 */
const voteReview = async (
  reviewId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  voteType: 'upvote' | 'downvote'
) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Check if user already voted
  const existingVote = await ReviewVote.findOne({ review: reviewId, user: userId });

  if (existingVote) {
    // Update existing vote
    if (existingVote.voteType === voteType) {
      // Remove vote if clicking same button
      await existingVote.deleteOne();
    } else {
      // Change vote
      existingVote.voteType = voteType;
      await existingVote.save();
    }
  } else {
    // Create new vote
    await ReviewVote.create({
      review: reviewId,
      user: userId,
      voteType,
    });
  }

  // Recalculate vote counts
  const upvotes = await ReviewVote.countDocuments({ review: reviewId, voteType: 'upvote' });
  const downvotes = await ReviewVote.countDocuments({ review: reviewId, voteType: 'downvote' });

  review.upvotes = upvotes;
  review.downvotes = downvotes;
  await review.save();

  return review;
};

export default {
  createReview,
  queryReviews,
  updateReview,
  deleteReview,
  voteReview,
};
```

#### Step 3: Create Review Controller & Routes
```typescript
// Source/backend/src/controllers/review.controller.ts

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import reviewService from '../services/review.service';
import pick from '../utils/pick';

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(httpStatus.CREATED).send(review);
});

const getReviews = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['trip', 'operator', 'rating']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.limit = options.limit ? parseInt(options.limit as string) : 10;
  options.page = options.page ? parseInt(options.page as string) : 1;
  
  const reviews = await reviewService.queryReviews(filter, options);
  res.send(reviews);
});

const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(
    new mongoose.Types.ObjectId(req.params.reviewId),
    req.user._id,
    req.body
  );
  res.send(review);
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(new mongoose.Types.ObjectId(req.params.reviewId), req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

const voteReview = catchAsync(async (req, res) => {
  const review = await reviewService.voteReview(
    new mongoose.Types.ObjectId(req.params.reviewId),
    req.user._id,
    req.body.voteType
  );
  res.send(review);
});

export default {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  voteReview,
};
```

```typescript
// Source/backend/src/routes/v1/review.route.ts

import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import reviewValidation from '../../validations/review.validation';
import reviewController from '../../controllers/review.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('createReview'), validate(reviewValidation.createReview), reviewController.createReview)
  .get(validate(reviewValidation.getReviews), reviewController.getReviews);

router
  .route('/:reviewId')
  .patch(auth('manageOwnReviews'), validate(reviewValidation.updateReview), reviewController.updateReview)
  .delete(auth('manageOwnReviews'), validate(reviewValidation.deleteReview), reviewController.deleteReview);

router
  .route('/:reviewId/vote')
  .post(auth(), validate(reviewValidation.voteReview), reviewController.voteReview);

export default router;
```

**Verification:**
- [ ] User can create review for completed booking
- [ ] Cannot review same trip twice
- [ ] Can view reviews by trip/operator
- [ ] Can update/delete own reviews
- [ ] Can upvote/downvote reviews
- [ ] Vote counts update correctly

---

### Task 2.3: Implement Payment Integration (Priority: 🚨 CRITICAL)

**Problem:** Proposal requires payment gateway integration (1.0/10.0 points). No payment processing exists.

**Recommended Gateway:** PayOS (Vietnamese, easy sandbox mode)

**Files to Create:**
1. `Source/backend/src/services/payment.service.ts`
2. `Source/backend/src/controllers/payment.controller.ts`
3. `Source/backend/src/routes/v1/payment.route.ts`
4. `Source/backend/src/validations/payment.validation.ts`

**Implementation Steps:**

#### Step 1: Install PayOS SDK
```bash
cd Source/backend
npm install @payos/node
```

#### Step 2: Add PayOS Config
```typescript
// Source/backend/src/config/config.ts

export default {
  // ... existing config
  payos: {
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  },
};
```

```env
# Add to .env
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

#### Step 3: Create Payment Service
```typescript
// Source/backend/src/services/payment.service.ts

import PayOS from '@payos/node';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../config/config';
import Booking from '../models/booking.model';
import ApiError from '../utils/ApiError';
import emailService from './email.service';

const payOS = new PayOS(
  config.payos.clientId!,
  config.payos.apiKey!,
  config.payos.checksumKey!
);

/**
 * Create payment link
 */
const createPaymentLink = async (bookingId: mongoose.Types.ObjectId) => {
  const booking = await Booking.findById(bookingId).populate('trip');
  
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.paymentStatus === 'paid') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking already paid');
  }

  const orderCode = Date.now(); // Unique order code
  
  const paymentData = {
    orderCode,
    amount: booking.totalPrice,
    description: `Bus ticket booking #${booking._id}`,
    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
  };

  const paymentLink = await payOS.createPaymentLink(paymentData);

  // Update booking with payment info
  booking.paymentMethod = 'payos';
  booking.paymentTransactionId = orderCode.toString();
  await booking.save();

  return {
    checkoutUrl: paymentLink.checkoutUrl,
    orderCode,
  };
};

/**
 * Handle payment webhook
 */
const handlePaymentWebhook = async (webhookData: any) => {
  const { orderCode, code, id } = webhookData.data;

  // code === "00" means success
  if (code === '00') {
    const booking = await Booking.findOne({ paymentTransactionId: orderCode.toString() });

    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      // Send confirmation email
      const email = booking.user 
        ? (await mongoose.model('User').findById(booking.user))?.email
        : booking.guestEmail;
      
      if (email) {
        await emailService.sendBookingConfirmation(email, booking);
      }
    }
  }

  return { success: true };
};

/**
 * Check payment status
 */
const checkPaymentStatus = async (orderCode: string) => {
  const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
  return paymentInfo;
};

export default {
  createPaymentLink,
  handlePaymentWebhook,
  checkPaymentStatus,
};
```

#### Step 4: Create Payment Controller & Routes
```typescript
// Source/backend/src/controllers/payment.controller.ts

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import paymentService from '../services/payment.service';

const createPayment = catchAsync(async (req, res) => {
  const paymentLink = await paymentService.createPaymentLink(
    new mongoose.Types.ObjectId(req.body.bookingId)
  );
  res.status(httpStatus.CREATED).send(paymentLink);
});

const handleWebhook = catchAsync(async (req, res) => {
  const result = await paymentService.handlePaymentWebhook(req.body);
  res.send(result);
});

const checkStatus = catchAsync(async (req, res) => {
  const status = await paymentService.checkPaymentStatus(req.params.orderCode);
  res.send(status);
});

export default {
  createPayment,
  handleWebhook,
  checkStatus,
};
```

```typescript
// Source/backend/src/routes/v1/payment.route.ts

import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import paymentController from '../../controllers/payment.controller';

const router = express.Router();

router.post('/create', auth(), paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook); // No auth for webhook
router.get('/status/:orderCode', auth(), paymentController.checkStatus);

export default router;
```

**Verification:**
- [ ] Payment link created for booking
- [ ] Webhook updates booking status
- [ ] Email sent after successful payment
- [ ] Payment status can be checked

---

### Task 2.4: Implement Seat Locking (Priority: ⚠️ MEDIUM)

**Problem:** Seats should be temporarily held during booking process to prevent double booking.

**Files to Create:**
1. `Source/backend/src/services/seatlock.service.ts`

**Files to Modify:**
1. `Source/backend/src/models/seatlock.model.ts` (add TTL index)
2. `Source/backend/src/services/booking.service.ts` (integrate locking)

**Implementation:**

```typescript
// Source/backend/src/services/seatlock.service.ts

import mongoose from 'mongoose';
import httpStatus from 'http-status';
import SeatLock from '../models/seatlock.model';
import ApiError from '../utils/ApiError';

const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Lock seats
 */
const lockSeats = async (
  tripId: mongoose.Types.ObjectId,
  seats: string[],
  userId?: mongoose.Types.ObjectId,
  sessionId?: string
) => {
  // Check if seats are already locked
  const existingLocks = await SeatLock.find({
    trip: tripId,
    seatNumber: { $in: seats },
    expiresAt: { $gt: new Date() },
  });

  if (existingLocks.length > 0) {
    const lockedSeats = existingLocks.map(lock => lock.seatNumber);
    throw new ApiError(httpStatus.BAD_REQUEST, `Seats ${lockedSeats.join(', ')} are currently locked`);
  }

  // Create locks
  const locks = seats.map(seat => ({
    trip: tripId,
    seatNumber: seat,
    lockedBy: userId,
    sessionId,
    expiresAt: new Date(Date.now() + LOCK_DURATION),
  }));

  await SeatLock.insertMany(locks);
  return locks;
};

/**
 * Release seats
 */
const releaseSeats = async (tripId: mongoose.Types.ObjectId, seats: string[], userId?: mongoose.Types.ObjectId) => {
  const query: any = {
    trip: tripId,
    seatNumber: { $in: seats },
  };

  if (userId) {
    query.lockedBy = userId;
  }

  await SeatLock.deleteMany(query);
};

/**
 * Get locked seats for a trip
 */
const getLockedSeats = async (tripId: mongoose.Types.ObjectId) => {
  const locks = await SeatLock.find({
    trip: tripId,
    expiresAt: { $gt: new Date() },
  });

  return locks.map(lock => lock.seatNumber);
};

export default {
  lockSeats,
  releaseSeats,
  getLockedSeats,
};
```

Update `seatlock.model.ts` to add TTL index:
```typescript
// Add index for automatic expiration
seatlockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

Integrate with booking service:
```typescript
// In booking.service.ts, before creating booking:

import seatLockService from './seatlock.service';

// Lock seats
await seatLockService.lockSeats(bookingBody.trip, bookingBody.seats, userId);

// Create booking...

// After successful payment, release locks
await seatLockService.releaseSeats(booking.trip, booking.seats);
```

---

### Task 2.5: Implement Chatbot (Priority: 🚨 CRITICAL)

**Problem:** Proposal requires chatbot functionality (0.5/10.0 points).

**Simple Implementation:** Intent-based chatbot (no LLM needed for MVP)

**Files to Create:**
1. `Source/backend/src/services/chatbot.service.ts`
2. `Source/backend/src/controllers/chatbot.controller.ts`
3. `Source/backend/src/routes/v1/chatbot.route.ts`

**Implementation:**

```typescript
// Source/backend/src/services/chatbot.service.ts

import mongoose from 'mongoose';
import ChatSession from '../models/chatsession.model';
import Trip from '../models/trip.model';
import Booking from '../models/booking.model';

/**
 * Create chat session
 */
const createSession = async (userId?: mongoose.Types.ObjectId) => {
  const session = await ChatSession.create({
    user: userId,
    messages: [{
      role: 'assistant',
      content: 'Hello! I can help you:\n1. Search for trips\n2. Check seat availability\n3. View your bookings\nWhat would you like to do?',
      timestamp: new Date(),
    }],
  });

  return session;
};

/**
 * Process message
 */
const processMessage = async (sessionId: mongoose.Types.ObjectId, message: string, userId?: mongoose.Types.ObjectId) => {
  const session = await ChatSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Add user message
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  // Simple intent detection
  let response = '';
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('search') || lowerMessage.includes('trip') || lowerMessage.includes('bus')) {
    response = 'To search for trips, please provide:\n- Departure city\n- Arrival city\n- Date\nExample: "Search trips from Hanoi to Ho Chi Minh on 2025-12-01"';
  } else if (lowerMessage.includes('booking') || lowerMessage.includes('my booking')) {
    if (userId) {
      const bookings = await Booking.find({ user: userId }).limit(3);
      response = bookings.length > 0
        ? `You have ${bookings.length} booking(s). Visit your dashboard for details.`
        : 'You have no bookings yet.';
    } else {
      response = 'Please log in to view your bookings.';
    }
  } else if (lowerMessage.includes('help')) {
    response = 'I can help you with:\n1. Search for trips\n2. Check availability\n3. View bookings\n\nJust type what you need!';
  } else {
    response = 'I didn\'t understand that. Type "help" to see what I can do.';
  }

  // Add assistant response
  session.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date(),
  });

  await session.save();
  return session;
};

export default {
  createSession,
  processMessage,
};
```

Create routes:
```typescript
// Source/backend/src/routes/v1/chatbot.route.ts

import express from 'express';
import chatbotController from '../../controllers/chatbot.controller';

const router = express.Router();

router.post('/sessions', chatbotController.createSession);
router.post('/sessions/:sessionId/messages', chatbotController.sendMessage);
router.get('/sessions/:sessionId', chatbotController.getSession);

export default router;
```

---

## Testing Checklist

- [ ] Operator CRUD works
- [ ] Review system functional
- [ ] Payment integration works in sandbox
- [ ] Seat locking prevents double booking
- [ ] Chatbot responds to messages

## Expected Outcome

After Phase 2:
- ✅ All major features implemented
- ✅ +3.0 more points (payment, review, chatbot, operator)
- ✅ ~27 hours of work completed
- ✅ Ready for Phase 3 polish and testing
