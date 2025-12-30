# 🎟️ Promotion System - Frontend Integration

## 📋 Overview

Complete integration of the promotion system following the backend API specification. The system allows users to **apply promo codes directly in the booking page** (seat selection) with real-time price updates and discount calculation.

## ✨ Key Features

- 💺 **Apply promo codes during seat selection** (not at checkout)
- 💰 **Real-time price updates** - see discount immediately
- 🎯 **Single promo code** limitation per booking
- ✅ **Validated by backend** - prevents tampering
- 🔒 **Preserved through checkout** - discount carries over

---

## 🔄 Complete Flow

```
1. User selects seats in booking page
2. User enters promo code (e.g., STUDENT20) in BookingPromoCode component
3. Frontend calls POST /api/v1/promotions/validate
4. Backend validates and returns:
   - promotion details
   - userPromotion._id (important!)
   - discountAmount
   - finalAmount
5. Frontend saves to Redux state
6. Booking page shows DISCOUNTED price immediately
7. User fills passenger info and clicks "Continue to Checkout"
8. Checkout page shows same discounted price (read-only)
9. User confirms and creates booking
10. Frontend sends userPromotion._id to POST /api/v1/bookings
11. Backend applies discount and marks promotion as used
```

---

## 🏗️ Architecture Changes

### 1. **State Management** ([bookingSlice.ts](../../src/lib/store/features/booking/bookingSlice.ts))

Updated `PromotionInfo` interface to match BE response:

```typescript
interface PromotionInfo {
  userPromotionId: string; // ID of UserPromotion from validate API
  promotionId: string; // ID of Promotion
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}
```

**Key Points:**

- `userPromotionId`: **Critical** - This is sent to booking API
- `promotionId`: For reference only
- `discountAmount`: Pre-calculated by backend
- `finalAmount`: Total after discount

---

### 2. **BookingPromoCode Component** ([BookingPromoCode.tsx](../../src/containers/seat-selection/BookingPromoCode.tsx))

**Location:** Booking page (seat selection) - NOT checkout page

**API Integration:**

```typescript
const handleApplyPromo = async () => {
  const result = await validatePromotion({
    code: promoCode.trim().toUpperCase(),
    orderAmount: totalAmount, // Total before discount
  }).unwrap();

  // Backend response structure
  const { promotion, userPromotion, discountAmount, finalAmount } = result.data;

  // Save complete promotion info
  dispatch(
    setPromotion({
      userPromotionId: userPromotion._id, // REQUIRED for booking
      promotionId: promotion._id,
      code: promotion.code,
      title: promotion.title,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      discountAmount,
      finalAmount,
    })
  );
};
```

**UI Features:**

- ✅ Input field with uppercase transformation (e.g., "STUDENT20")
- ✅ Apply button with loading state
- ✅ Success badge showing applied promo
- ✅ Remove button to clear promo
- ✅ Single promo code limitation
- ✅ Error handling with toast notifications
- ✅ Integrated into booking page sidebar

**Error Handling:**

```typescript
// Backend error messages are displayed directly
catch (error: any) {
  const errorMessage = error?.data?.message || 'Invalid promo code';
  toast.error(errorMessage);
}
```

**Common Errors:**

- "Invalid promotion code" (404)
- "You have not collected this promotion" (400)
- "Minimum order value is X" (400)
- "Promotion has expired" (400)

---

### 3. **Booking Page** ([page.tsx](../../src/app/booking/[tripId]/page.tsx))

**Real-time Price Display:**

```typescript
// Calculate prices with promotion
const basePrice = (trip.pricePerSeat || trip.price) * selectedSeats.length;
const discountAmount = promotion?.discountAmount || 0;
const finalPrice = basePrice - discountAmount;
```

**Fare Breakdown UI:**

```tsx
<CardContent>
  {/* Base fare */}
  <div>
    Selected Seats × {selectedSeats.length}: {basePrice.toLocaleString()} ₫
  </div>

  {/* Discount (if applied) */}
  {promotion && (
    <div className="text-green-700">
      Discount ({promotion.code}): -{discountAmount.toLocaleString()} ₫
    </div>
  )}

  {/* Final total */}
  <div className="text-2xl font-black">{finalPrice.toLocaleString()} ₫</div>

  {promotion && (
    <p>
      💰 You saved {discountAmount.toLocaleString()} ₫ with {promotion.title}!
    </p>
  )}
</CardContent>
```

**PromoCode Placement:**

- Located in the right sidebar
- Appears AFTER selecting seats
- Positioned ABOVE the checkout button
- Shows real-time price updates

---

### 4. **Checkout Page** ([page.tsx](../../src/app/checkout/page.tsx))

**No Promo Input:** PromoCode component is NOT in checkout page anymore
**No Promo Input:** PromoCode component is NOT in checkout page anymore

**Read-only Display:** Checkout page only shows the discount already applied

**Booking API Call:**

```typescript
const bookingData: CreateBookingRequest = {
  trip: tripId,
  passengers: [...],
  contactEmail: contactInfo.email,
  contactPhone: contactInfo.phone,
  totalAmount: finalAmount, // After discount (from booking page)
  userPromotion: promotion?.userPromotionId, // UserPromotion ID
  sessionId: sessionId || undefined,
};

const bookingResult = await createBooking(bookingData).unwrap();
```

**Important:**

- Send `userPromotion` (ID), NOT `promotionCode`
- Send `finalAmount` (after discount), NOT original amount
- Backend will validate and apply the discount

---

### 5. **BookingSummary Component** ([BookingSummary.tsx](../../src/containers/checkout-page/BookingSummary.tsx))

### 5. **BookingSummary Component** ([BookingSummary.tsx](../../src/containers/checkout-page/BookingSummary.tsx))

**Display Logic:**

```typescript
const pricePerSeat = trip.pricePerSeat || 0;
const totalPrice = pricePerSeat * selectedSeats.length;
const discountAmount = promotion?.discountAmount || 0;
const finalPrice = totalPrice - discountAmount;
```

**UI Layout:**

```
┌─────────────────────────────────┐
│ Price per seat:      $50.00     │
│ Subtotal:           $500.00     │
│ Discount (CODE):    -$50.00 ✓   │
│ ─────────────────────────────   │
│ Total:              $450.00     │
│ You saved $50.00 with Title     │
└─────────────────────────────────┘
```

---

### 6. **TypeScript Types** ([types/index.ts](../../src/lib/types/index.ts))

      discountAmount,
      finalAmount,
    })

);
};

````

**UI Features:**

- ✅ Input field with uppercase transformation
- ✅ Apply button with loading state
- ✅ Success badge showing applied promo
- ✅ Remove button to clear promo
- ✅ Single promo code limitation
- ✅ Error handling with toast notifications

**Error Handling:**

```typescript
// Backend error messages are displayed directly
catch (error: any) {
  const errorMessage = error?.data?.message || 'Invalid promo code';
  toast.error(errorMessage);
}
````

**Common Errors:**

- "Invalid promotion code" (404)
- "You have not collected this promotion" (400)
- "Minimum order value is X" (400)
- "Promotion has expired" (400)

---

### 3. **Checkout Page** ([page.tsx](../../src/app/checkout\page.tsx))

**Booking API Call:**

```typescript
const bookingData: CreateBookingRequest = {
  trip: tripId,
  passengers: [...],
  contactEmail: contactInfo.email,
  contactPhone: contactInfo.phone,
  totalAmount: finalAmount, // After discount
  userPromotion: promotion?.userPromotionId, // UserPromotion ID
  sessionId: sessionId || undefined,
};

const bookingResult = await createBooking(bookingData).unwrap();
```

**Important:**

- Send `userPromotion` (ID), NOT `promotionCode`
- Send `finalAmount` (after discount), NOT original amount
- Backend will validate and apply the discount

---

### 4. **BookingSummary Component** ([BookingSummary.tsx](../../src/containers/checkout-page/BookingSummary.tsx))

**Display Logic:**

```typescript
const pricePerSeat = trip.pricePerSeat || 0;
const totalPrice = pricePerSeat * selectedSeats.length;
const discountAmount = promotion?.discountAmount || 0;
const finalPrice = totalPrice - discountAmount;
```

**UI Layout:**

```
┌─────────────────────────────────┐
│ Price per seat:      $50.00     │
│ Subtotal:           $500.00     │
│ Discount (CODE):    -$50.00 ✓   │
│ ─────────────────────────────   │
│ Total:              $450.00     │
│ You saved $50.00 with Title     │
└─────────────────────────────────┘
```

---

### 5. **TypeScript Types** ([types/index.ts](../../src/lib/types/index.ts))

```typescript
export interface CreateBookingRequest {
  trip: string;
  passengers: Array<{...}>;
  contactEmail: string;
  contactPhone: string;
  totalAmount: number;
  sessionId?: string;
  userPromotion?: string; // UserPromotion ID from validate API
}
```

---

## 🔌 API Integration Details

### **Validate Promotion API**

**Endpoint:** `POST /api/v1/promotions/validate`

**Request:**

```json
{
  "code": "SUMMER2025",
  "orderAmount": 500000
}
```

**Response (Success):**

```json
{
  "data": {
    "promotion": {
      "_id": "677295a8b2c3d4e5f6789012",
      "code": "SUMMER2025",
      "title": "Summer Flash Sale",
      "discountType": "percentage",
      "discountValue": 20,
      "maxDiscount": 50000,
      "minOrderValue": 100000
    },
    "userPromotion": {
      "_id": "677295b1c4d5e6f789abc123",
      "userId": "67729580a1b2c3d4e5f67890",
      "promotionId": "677295a8b2c3d4e5f6789012",
      "isUsed": false
    },
    "discountAmount": 50000,
    "finalAmount": 450000
  }
}
```

**Response (Error):**

```json
{
  "code": 400,
  "message": "Minimum order value is 100,000₫"
}
```

---

### **Create Booking API**

**Endpoint:** `POST /api/v1/bookings`

**Request:**

```json
{
  "trip": "677295c0d1e2f3a4b5c67890",
  "passengers": [...],
  "contactPhone": "0912345678",
  "contactEmail": "user@example.com",
  "totalAmount": 450000,
  "userPromotion": "677295b1c4d5e6f789abc123",
  "sessionId": "session_xyz123"
}
```

**Backend Behavior:**

1. Validates `userPromotion` exists and belongs to user
2. Validates promotion is not used/expired
3. Re-calculates discount to prevent tampering
4. Applies discount to booking
5. Marks `userPromotion.isUsed = true`
6. Returns booking with applied discount

---

## 🎯 Key Implementation Details

### **1. Promo Code Applied in Booking Page**

```typescript
// ✅ CORRECT FLOW - Apply in booking page
User selects seats → Enter promo code → See discount → Continue to checkout

// ❌ OLD FLOW - Apply in checkout (removed)
User selects seats → Continue to checkout → Enter promo code
```

### **2. UserPromotion ID is Critical**

```typescript
// ✅ CORRECT - Save userPromotionId from validate response
dispatch(
  setPromotion({
    userPromotionId: userPromotion._id, // This goes to booking API
    ...otherFields,
  })
);

// ❌ WRONG - Don't just save the code
dispatch(
  setPromotion({
    code: promotion.code, // Not enough!
  })
);
```

### **2. Amount Calculation**

```typescript
// Frontend calculates for display only
const discountAmount = promotion?.discountAmount || 0;
const finalAmount = totalPrice - discountAmount;

// Backend re-validates in booking creation
// This prevents users from tampering with totalAmount
```

### **3. Single Promo Code Limitation**

```typescript
// UI prevents multiple codes
{promotion ? (
  <div>Applied: {promotion.code}</div>
) : (
  <Input placeholder="Enter promo code" />
)}
```

### **4. Error Message Flow**

```
Backend error → error.data.message → toast.error()
                                       ↓
                          User sees friendly message
```

---

## 🧪 Testing Checklist

### **Happy Path**

- [x] Enter valid promo code
- [x] See discount applied in summary
- [x] Create booking with discount
- [x] Promotion marked as used

### **Error Cases**

- [x] Invalid code → "Invalid promotion code"
- [x] Not collected → "You have not collected"
- [x] Below min order → "Minimum order value is X"
- [x] Already used → "Promotion already used"
- [x] Expired → "Promotion has expired"

### **UI/UX**

- [x] Loading state during validation
- [x] Success toast with discount amount
- [x] Error toast with clear message
- [x] Remove promo code functionality
- [x] Discount breakdown in summary
- [x] "You saved $X" message

---

## 🔄 State Flow Diagram

```
User Input
    ↓
PromoCodeInput
    ↓
validatePromotion API
    ↓
{ promotion, userPromotion, discountAmount, finalAmount }
    ↓
Redux Store (bookingSlice)
    ↓
BookingSummary (display)
    ↓
Checkout Page
    ↓
createBooking({ userPromotion: userPromotionId })
    ↓
Backend validates & applies discount
    ↓
Booking created ✓
```

---

## 📝 Code Quality

### **Best Practices Applied:**

1. **Type Safety:**
   - Strict TypeScript interfaces
   - Proper null/undefined handling
   - Type-safe Redux hooks

2. **Error Handling:**
   - Try-catch blocks
   - User-friendly error messages
   - Console logging for debugging

3. **Professional UI:**
   - Loading states
   - Disabled states during processing
   - Clear visual feedback
   - Accessible components

4. **Code Organization:**
   - Separated concerns (component, logic, state)
   - Reusable hooks
   - Clean component structure

---

## 🚀 Future Enhancements

Potential improvements:

1. **My Promotions Page:**
   - List user's collected promotions
   - Quick apply from saved promos
   - Filter by available/used/expired

2. **Auto-apply:**
   - Suggest best available promo
   - Auto-apply highest discount

3. **Promo Collection:**
   - Browse active promotions
   - Collect promo to wallet
   - Share promo codes

4. **Admin Dashboard:**
   - View promotion statistics
   - Track usage rates
   - Manage active promotions

---

## 🔗 Related Files

- [bookingSlice.ts](../../src/lib/store/features/booking/bookingSlice.ts)
- [PromoCodeInput.tsx](../../src/containers/checkout-page/PromoCodeInput.tsx)
- [BookingSummary.tsx](../../src/containers/checkout-page/BookingSummary.tsx)
- [checkout/page.tsx](../../src/app/checkout/page.tsx)
- [types/index.ts](../../src/lib/types/index.ts)
- [api.ts](../../src/lib/store/services/api.ts)

---

## 📞 Support

For issues or questions:

- Check backend logs for API errors
- Verify `userPromotionId` is being sent correctly
- Ensure user has collected the promotion
- Confirm promotion is not expired/used

**Common Issues:**

| Issue                    | Solution                               |
| ------------------------ | -------------------------------------- |
| "Invalid promotion code" | User hasn't collected it yet           |
| Discount not applied     | Check `userPromotion` field in request |
| Wrong amount             | Backend recalculates, check BE logs    |
| Can't remove promo       | Clear Redux state properly             |

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Language:** English
