# Phase 1: Critical Backend Fixes Implementation

## Context
This is **Phase 1** of the backend issues fixing plan. You are implementing the most critical fixes that must be completed before MVP release. These changes align the backend with the proposal requirements.

## Prerequisites
- Read `bus_ticket_proposal.md` for requirements context
- Review `plan-backendIssuesFixing.prompt.md` for overall analysis
- Backend is located in `Source/backend/`
- MongoDB models already exist, we're adding missing functionality

## Current State
The backend has:
- ✅ All models defined (User, Booking, Trip, Route, Bus, etc.)
- ✅ Basic auth system (JWT tokens, passport)
- ✅ Some CRUD endpoints (users, trips, routes, buses, bookings)
- ❌ Wrong role system (3 roles instead of 2)
- ❌ No guest booking flow
- ❌ No email notification system

## Tasks to Complete in This Phase

### Task 1.1: Fix Role System (Priority: 🚨 CRITICAL)

**Problem:** Current implementation has 3 roles (`user`, `admin`, `operator`) but proposal only requires 2 roles (`user`, `admin`).

**Files to Modify:**
1. `Source/backend/src/config/roles.ts`
2. `Source/backend/src/models/user.model.ts` (role enum)
3. All route files that reference `operator` role

**Implementation Steps:**

#### Step 1: Update roles.ts
```typescript
// Source/backend/src/config/roles.ts
const allRoles = {
  user: [
    'bookTicket',
    'manageOwnBookings',
    'getTrips',
    'getBuses',
    'getRoutes',
    'createReview',
    'manageOwnReviews',
    'getSearchHistory'
  ],
  admin: [
    'getUsers',
    'manageUsers',
    'manageBuses',
    'manageRoutes',
    'manageTrips',
    'manageBookings',
    'manageOperators',
    'viewAnalytics',
    'manageReviews'
  ]
  // ❌ Remove operator role completely
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
```

#### Step 2: Update User Model
- Remove `'operator'` from role enum in `user.model.ts`
- Keep only `['user', 'admin']`

#### Step 3: Verify Route Guards
- Search all route files for `auth('operator')` or similar
- Replace with appropriate admin permissions
- Ensure no references to `operator` role remain

**Verification:**
- [ ] No TypeScript errors
- [ ] All routes compile successfully
- [ ] No references to `operator` role in codebase

---

### Task 1.2: Implement Guest Booking Flow (Priority: 🚨 CRITICAL)

**Problem:** Proposal requires "Allow user to book seats without register/login an account" (1.0/10.0 points) but all booking endpoints require authentication.

**Files to Create/Modify:**
1. `Source/backend/src/validations/booking.validation.ts` (add guest validation)
2. `Source/backend/src/controllers/booking.controller.ts` (add guest controller)
3. `Source/backend/src/services/booking.service.ts` (modify to handle guest)
4. `Source/backend/src/routes/v1/booking.route.ts` (add guest route)

**Implementation Steps:**

#### Step 1: Add Guest Booking Validation
```typescript
// Source/backend/src/validations/booking.validation.ts

const createGuestBooking = {
  body: Joi.object().keys({
    trip: Joi.string().required().custom(objectId),
    seats: Joi.array().items(Joi.string()).min(1).required(),
    guestEmail: Joi.string().email().required(),
    guestPhone: Joi.string().required().regex(/^[0-9]{10,11}$/),
    passengers: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        age: Joi.number().integer().min(0).max(120),
        gender: Joi.string().valid('male', 'female', 'other')
      })
    ).min(1).required(),
    // Payment will be added in Phase 2
  }),
};

export default {
  createBooking,
  createGuestBooking, // Add this
  getBookings,
  // ... other exports
};
```

#### Step 2: Add Guest Booking Controller
```typescript
// Source/backend/src/controllers/booking.controller.ts

import catchAsync from '../utils/catchAsync';
import bookingService from '../services/booking.service';
import httpStatus from 'http-status';

// Add this new controller
const createGuestBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createGuestBooking(req.body);
  res.status(httpStatus.CREATED).send(booking);
});

export default {
  createBooking,
  createGuestBooking, // Add this
  getBookings,
  // ... other exports
};
```

#### Step 3: Update Booking Service
```typescript
// Source/backend/src/services/booking.service.ts

const createGuestBooking = async (bookingBody: {
  trip: string;
  seats: string[];
  guestEmail: string;
  guestPhone: string;
  passengers: any[];
}) => {
  // Validate trip exists
  const trip = await Trip.findById(bookingBody.trip);
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  // Check seat availability (will be enhanced with seat locking in Phase 2)
  const existingBookings = await Booking.find({
    trip: bookingBody.trip,
    status: { $in: ['confirmed', 'pending'] },
    seats: { $in: bookingBody.seats }
  });

  if (existingBookings.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more seats are already booked');
  }

  // Calculate total price
  const totalPrice = trip.price * bookingBody.seats.length;

  // Create booking
  const booking = await Booking.create({
    ...bookingBody,
    totalPrice,
    status: 'pending', // Will be 'confirmed' after payment in Phase 2
  });

  return booking;
};

export default {
  createBooking,
  createGuestBooking, // Add this
  // ... other exports
};
```

#### Step 4: Add Guest Booking Route
```typescript
// Source/backend/src/routes/v1/booking.route.ts

router
  .route('/guest')
  .post(
    validate(bookingValidation.createGuestBooking), // No auth() middleware!
    bookingController.createGuestBooking
  );

// Keep existing authenticated routes
router
  .route('/')
  .post(auth('bookTicket'), validate(bookingValidation.createBooking), bookingController.createBooking)
  .get(auth('manageBookings'), validate(bookingValidation.getBookings), bookingController.getBookings);
```

**Verification:**
- [ ] Guest can create booking without authentication
- [ ] Guest email and phone are required
- [ ] Seat availability is checked
- [ ] Booking is created with `pending` status
- [ ] Total price is calculated correctly

---

### Task 1.3: Implement Email Notification System (Priority: 🚨 CRITICAL)

**Problem:** Proposal requires "Send automatic email notifications for booking confirmation, cancellations and trip updates" (0.5/10.0 points) but no email service exists.

**Files to Create:**
1. `Source/backend/src/services/email.service.ts`
2. `Source/backend/src/services/notification.service.ts`
3. `Source/backend/src/templates/booking-confirmation.html`
4. `Source/backend/src/templates/booking-cancellation.html`
5. `Source/backend/src/templates/trip-update.html`

**Files to Modify:**
1. `Source/backend/src/config/config.ts` (add email config)
2. `Source/backend/.env` (add email credentials)
3. `Source/backend/src/services/booking.service.ts` (integrate email sending)

**Implementation Steps:**

#### Step 1: Add Email Configuration
```typescript
// Source/backend/src/config/config.ts

export default {
  // ... existing config
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@busticket.com',
  },
};
```

#### Step 2: Create Email Service
```typescript
// Source/backend/src/services/email.service.ts

import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';
import fs from 'fs';
import path from 'path';

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    from: config.email.from,
    to,
    subject,
    html,
  };
  await transport.sendMail(msg);
};

/**
 * Load email template
 * @param {string} templateName
 * @param {object} variables
 * @returns {string}
 */
const loadTemplate = (templateName: string, variables: Record<string, any>): string => {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');
  
  // Simple variable replacement
  Object.keys(variables).forEach(key => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
  });
  
  return template;
};

/**
 * Send booking confirmation email
 * @param {string} to
 * @param {object} booking
 */
const sendBookingConfirmation = async (to: string, booking: any) => {
  const subject = 'Booking Confirmation - Bus Ticket Booking System';
  const html = loadTemplate('booking-confirmation', {
    bookingId: booking._id.toString(),
    seats: booking.seats.join(', '),
    totalPrice: booking.totalPrice,
    tripDate: booking.trip.departureTime,
    // Add more variables as needed
  });
  await sendEmail(to, subject, html);
};

/**
 * Send booking cancellation email
 * @param {string} to
 * @param {object} booking
 */
const sendBookingCancellation = async (to: string, booking: any) => {
  const subject = 'Booking Cancellation - Bus Ticket Booking System';
  const html = loadTemplate('booking-cancellation', {
    bookingId: booking._id.toString(),
    refundAmount: booking.totalPrice,
  });
  await sendEmail(to, subject, html);
};

/**
 * Send trip update email
 * @param {string} to
 * @param {object} trip
 * @param {string} updateMessage
 */
const sendTripUpdate = async (to: string, trip: any, updateMessage: string) => {
  const subject = 'Trip Update - Bus Ticket Booking System';
  const html = loadTemplate('trip-update', {
    tripId: trip._id.toString(),
    updateMessage,
  });
  await sendEmail(to, subject, html);
};

export default {
  sendEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendTripUpdate,
};
```

#### Step 3: Create Email Templates
```html
<!-- Source/backend/src/templates/booking-confirmation.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .booking-details { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Your bus ticket booking has been confirmed successfully.</p>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <p><strong>Booking ID:</strong> {{bookingId}}</p>
        <p><strong>Seats:</strong> {{seats}}</p>
        <p><strong>Total Price:</strong> {{totalPrice}} VND</p>
        <p><strong>Trip Date:</strong> {{tripDate}}</p>
      </div>
      
      <p>Please arrive at the departure location 15 minutes before departure time.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Bus Ticket Booking System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

```html
<!-- Source/backend/src/templates/booking-cancellation.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Cancellation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .refund-info { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #f44336; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Booking Cancelled</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Your booking has been cancelled as requested.</p>
      
      <div class="refund-info">
        <h3>Refund Information</h3>
        <p><strong>Booking ID:</strong> {{bookingId}}</p>
        <p><strong>Refund Amount:</strong> {{refundAmount}} VND</p>
        <p><strong>Processing Time:</strong> 3-5 business days</p>
      </div>
      
      <p>The refund will be processed to your original payment method.</p>
      <p>We hope to serve you again in the future!</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Bus Ticket Booking System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

```html
<!-- Source/backend/src/templates/trip-update.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Trip Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .update-info { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #FF9800; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Trip Update</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>There has been an update regarding your upcoming trip.</p>
      
      <div class="update-info">
        <h3>Update Details</h3>
        <p><strong>Trip ID:</strong> {{tripId}}</p>
        <p><strong>Update:</strong> {{updateMessage}}</p>
      </div>
      
      <p>Please check your booking details and plan accordingly.</p>
      <p>If you have any concerns, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Bus Ticket Booking System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

#### Step 4: Integrate Email with Booking Flow
```typescript
// Source/backend/src/services/booking.service.ts

import emailService from './email.service';

// Update createBooking function
const createBooking = async (userId: mongoose.Types.ObjectId, bookingBody: any) => {
  // ... existing booking creation logic
  
  const booking = await Booking.create({
    user: userId,
    ...bookingBody,
  });

  // Send confirmation email
  const user = await User.findById(userId);
  if (user && user.email) {
    await emailService.sendBookingConfirmation(user.email, booking);
  }

  return booking;
};

// Update createGuestBooking function
const createGuestBooking = async (bookingBody: any) => {
  // ... existing booking creation logic
  
  const booking = await Booking.create(bookingBody);

  // Send confirmation email to guest
  await emailService.sendBookingConfirmation(bookingBody.guestEmail, booking);

  return booking;
};

// Add cancellation with email
const cancelBooking = async (bookingId: mongoose.Types.ObjectId, userId?: mongoose.Types.ObjectId) => {
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  booking.status = 'cancelled';
  await booking.save();

  // Send cancellation email
  const email = booking.user 
    ? (await User.findById(booking.user))?.email 
    : booking.guestEmail;
  
  if (email) {
    await emailService.sendBookingCancellation(email, booking);
  }

  return booking;
};
```

#### Step 5: Update .env
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@busticket.com
```

**Verification:**
- [ ] Email service connects successfully on startup
- [ ] Booking confirmation email sent on booking creation
- [ ] Cancellation email sent on booking cancellation
- [ ] Email templates render correctly with dynamic data
- [ ] Works for both authenticated and guest users

---

## Environment Setup Required

Before starting, ensure:
```bash
cd Source/backend
npm install  # nodemailer should already be in dependencies
```

Add to `.env`:
```env
# Email Configuration (for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Bus Ticket System <noreply@busticket.com>
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" for the application
3. Use the app password in `SMTP_PASSWORD`

---

## Testing Checklist

After implementation, verify:

### Task 1.1 Testing
- [ ] Run `npm run dev` - no TypeScript errors
- [ ] No references to `operator` role in logs or code
- [ ] All routes load successfully
- [ ] Test admin login and verify permissions work

### Task 1.2 Testing
- [ ] POST `/v1/bookings/guest` without auth token succeeds
- [ ] Guest booking requires email and phone
- [ ] Duplicate seat booking is prevented
- [ ] Total price calculates correctly
- [ ] Booking shows in database with `pending` status

### Task 1.3 Testing
- [ ] Email service logs connection on startup
- [ ] Create a booking → confirmation email received
- [ ] Cancel a booking → cancellation email received
- [ ] Email templates display correctly in email client
- [ ] Both guest and registered user emails work

---

## Expected Outcome

After Phase 1 completion:
- ✅ **Role system matches proposal** (only `user` and `admin`)
- ✅ **Guest checkout works** → +1.0 points
- ✅ **Email notifications work** → +0.5 points
- ✅ **~12 hours of work completed**
- ✅ **Ready for Phase 2 feature additions**

---

## Next Steps

After completing Phase 1:
1. Commit all changes with message: `feat: Phase 1 - Critical fixes (roles, guest booking, email)`
2. Test thoroughly using Postman/Thunder Client
3. Proceed to Phase 2 implementation

---

## Need Help?

Reference files:
- `bus_ticket_proposal.md` - Original requirements
- `plan-backendIssuesFixing.prompt.md` - Full analysis
- `Source/backend/src/models/*.ts` - Existing models
- `Source/backend/src/routes/v1/*.ts` - Existing routes
