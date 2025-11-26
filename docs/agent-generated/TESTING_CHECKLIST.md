# Testing Checklist - Quick Reference

## Phase 3 Task 3.2: Comprehensive Testing

### Testing Status Overview

| Test Suite | Total Tests | Completed | Pass | Fail | Status |
|-------------|-------------|-----------|------|------|--------|
| Authentication & Authorization | 7 | 0 | 0 | 0 | ⬜ Not Started |
| Guest Booking Flow | 7 | 0 | 0 | 0 | ⬜ Not Started |
| Email Notifications | 2 | 0 | 0 | 0 | ⬜ Not Started |
| Review System | 6 | 0 | 0 | 0 | ⬜ Not Started |
| Seat Locking | 5 | 0 | 0 | 0 | ⬜ Not Started |
| Operator Management | 4 | 0 | 0 | 0 | ⬜ Not Started |
| Search History | 3 | 0 | 0 | 0 | ⬜ Not Started |
| Route Management | 2 | 0 | 0 | 0 | ⬜ Not Started |
| Error Handling | 4 | 0 | 0 | 0 | ⬜ Not Started |
| **TOTAL** | **40** | **0** | **0** | **0** | **0%** |

---

## Quick Start Guide

### 1. Setup Environment

```bash
# Backend directory
cd Source/backend

# Start MongoDB (if not running)
# Windows: mongod --dbpath C:\data\db
# Mac/Linux: sudo systemctl start mongod

# Start backend server
npm run dev

# Server should be running on http://localhost:5000
```

### 2. Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select `Source/backend/postman_collection.json`
4. Collection will be imported with all 40+ test requests

### 3. Set Environment Variables in Postman

Create a new environment or use collection variables:
- `baseUrl`: `http://localhost:5000/v1`
- `userToken`: (will be auto-filled after login)
- `adminToken`: (set manually after admin login)
- `tripId`: (will be auto-filled from search)
- `routeId`: (set manually - get from DB or create route first)
- `bookingId`: (will be auto-filled after booking)
- `operatorId`: (will be auto-filled after creating operator)

### 4. Test Execution Order

**Recommended sequence:**

1. **Authentication** (Tests 1.1 - 1.5)
   - Register user → Login → Test access control

2. **Setup Data** (Manual or via Admin endpoints)
   - Create routes, buses, operators, trips

3. **Guest Booking Flow** (Tests 2.1 - 2.6)
   - Search → Lock → Book → Pay → Verify

4. **Reviews** (Tests 3.1 - 3.5)
   - Create → Vote → Update

5. **Other Features** (Operators, Routes, etc.)

---

## Critical Test Cases (Must Pass)

### ✅ Must Pass Before MVP

- [ ] User can register and login
- [ ] Guest can book without authentication
- [ ] Booking confirmation email sent
- [ ] Payment integration works
- [ ] Seats cannot be double-booked
- [ ] Admin can manage operators
- [ ] Reviews can be created and voted

### ⚠️ Important for Quality

- [ ] Role-based access control works
- [ ] Token refresh works
- [ ] Search history logs correctly
- [ ] Route toggle works
- [ ] Seat locks expire after 10 minutes
- [ ] Error messages are clear

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
# Windows: tasklist | findstr mongod
# Mac/Linux: ps aux | grep mongod
```

### Issue: "Email not sending"
**Solution:** Check .env file has valid SMTP credentials
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@busticket.com
```

### Issue: "Payment webhook not working"
**Solution:** For local testing, use Postman to simulate webhook. For real testing, use PayOS sandbox.

### Issue: "401 Unauthorized on all requests"
**Solution:** Make sure you're including the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Issue: "Cannot find tripId or routeId"
**Solution:** Create test data first:
```bash
# Use admin account to create:
# 1. Route (POST /v1/routes)
# 2. Bus (POST /v1/buses)
# 3. Trip (POST /v1/trips)
```

---

## Test Data Setup Script

### Option 1: Manual via Postman

1. Login as admin
2. Create Operator
3. Create Route
4. Create Bus
5. Create Trip

### Option 2: MongoDB Script

```javascript
// Run in MongoDB shell or Compass
use bus_booking_db;

// Create test route
db.routes.insertOne({
  routeName: "Hanoi - Ho Chi Minh",
  origin: { city: "Hanoi", state: "HN" },
  destination: { city: "Ho Chi Minh", state: "HCM" },
  distance: 1700,
  estimatedDuration: 1800,
  isActive: true
});

// Get route ID and create trip
const routeId = db.routes.findOne().id;

// Create test bus first (you need bus ID)
// Then create trip with route ID and bus ID
```

---

## Verification Checklist

After running all tests, verify:

### Database State
- [ ] Users created in `users` collection
- [ ] Bookings created in `bookings` collection
- [ ] Reviews created in `reviews` collection
- [ ] Search history in `searchhistories` collection
- [ ] Seat locks in `seatlocks` collection (check expiry)

### Email Verification
- [ ] Check email inbox for confirmation emails
- [ ] Check backend logs for email send attempts
- [ ] Verify email templates render correctly

### Payment Verification
- [ ] Booking status updated after payment
- [ ] Payment record created
- [ ] Webhook processed successfully

---

## Test Reporting

### How to Report Results

1. Use the **MANUAL_TESTING_GUIDE.md** to track individual test results
2. Mark each test as:
   - ✅ Pass
   - ❌ Fail (note reason)
   - ⚠️ Partial (works with issues)
   - ⏭️ Skipped (note why)

3. Record issues in the "Critical Issues Found" section

4. Calculate pass rate: (Passed / Total) × 100%

### Minimum Pass Rate for Production

- **MVP Release:** 90% pass rate (36/40 tests)
- **Production Release:** 95% pass rate (38/40 tests)
- **Critical Tests:** 100% must pass (7 critical tests)

---

## Next Steps After Testing

### If Tests Pass (≥90%)
1. ✅ Mark Task 3.2 as complete
2. ✅ Update master progress tracking
3. ✅ Proceed to deployment preparation
4. ✅ Document any known issues

### If Tests Fail (<90%)
1. ❌ Document all failures
2. 🔧 Fix critical issues first
3. 🔄 Retest failed cases
4. 📝 Update progress tracking
5. ⏰ Allocate time for bug fixes

---

## Resources

- **Full Testing Guide:** `MANUAL_TESTING_GUIDE.md`
- **Postman Collection:** `postman_collection.json`
- **API Documentation:** Check Swagger if configured
- **Phase 3 Instructions:** `.github/prompts/phase3-polish-testing.prompt.md`

---

**Last Updated:** November 26, 2025  
**Tester:** _______________  
**Test Environment:** Local Development  
**Backend Version:** v1.0.0
