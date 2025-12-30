# 🐛 Debug Guide - Promotion Not Showing Discount

## Vấn đề hiện tại

✅ API validate thành công: `POST /api/v1/promotions/validate` returns 200  
❌ Giá không giảm trong UI  
❌ Promotion status không chuyển sang "used"

---

## ✅ Giải thích Flow Đúng

### **QUAN TRỌNG: Promotion chỉ "used" sau khi booking!**

```
1. User nhập promo code → Click Apply
2. Frontend gọi POST /api/v1/promotions/validate ✅
3. Backend trả về: { discountAmount, finalAmount, userPromotion }
4. Frontend LƯU vào Redux state
5. UI CẬP NHẬT hiển thị giảm giá
6. User tiếp tục checkout và tạo booking
7. Frontend gọi POST /api/v1/bookings với userPromotion._id
8. Backend ÁP DỤNG discount và đánh dấu promotion "used" ✅
```

**Lưu ý:** Status "used" CHỈ thay đổi ở bước 8, KHÔNG phải bước 2!

---

## 🔍 Debug Steps

### **Step 1: Kiểm tra API Response**

Mở Chrome DevTools → Console, nhập promo code và click Apply.

**Expected console logs:**

```
🎉 Validate Promotion Response: {
  data: {
    promotion: {
      _id: "...",
      code: "STUDENT20",
      title: "Student Discount",
      discountType: "percentage",
      discountValue: 20,
      ...
    },
    userPromotion: {
      _id: "abc123",
      isUsed: false
    },
    discountAmount: 40000,
    finalAmount: 160000
  }
}

💰 Promotion Data: {
  userPromotionId: "abc123",
  code: "STUDENT20",
  discountAmount: 40000,
  finalAmount: 160000,
  ...
}
```

**❌ Nếu không thấy logs:**

- Frontend không nhận được response
- Kiểm tra Network tab → Response tab

**✅ Nếu thấy logs:**

- API hoạt động đúng
- Sang Step 2

---

### **Step 2: Kiểm tra Redux State**

Mở Redux DevTools → State → booking → promotion

**Expected state:**

```json
{
  "booking": {
    "promotion": {
      "userPromotionId": "abc123",
      "promotionId": "xyz789",
      "code": "STUDENT20",
      "title": "Student Discount",
      "discountType": "percentage",
      "discountValue": 20,
      "discountAmount": 40000,
      "finalAmount": 160000
    }
  }
}
```

**❌ Nếu promotion = null:**

- Redux action không được dispatch
- Lỗi ở `BookingPromoCode.tsx` line 44-57
- **Fix:** Kiểm tra `result.data` structure

**✅ Nếu có promotion:**

- State đã được lưu
- Sang Step 3

---

### **Step 3: Kiểm tra UI Rendering**

Mở Console, tìm log:

```
🎁 Promotion Updated in Booking Page: {
  code: "STUDENT20",
  discountAmount: 40000,
  ...
}
```

**❌ Nếu không thấy log:**

- Component không re-render
- Kiểm tra useSelector

**✅ Nếu thấy log nhưng UI không hiển thị:**

- Lỗi ở template JSX
- Kiểm tra condition `{promotion && ...}`

---

## 🛠️ Common Fixes

### **Fix 1: API Response Structure Sai**

Backend có thể trả về structure khác. Check Network tab:

```json
// ❌ Wrong structure
{
  "promotion": {...},
  "userPromotion": {...}
}

// ✅ Correct structure
{
  "data": {
    "promotion": {...},
    "userPromotion": {...}
  }
}
```

**Fix:** Update `BookingPromoCode.tsx`:

```typescript
// Old
if (result.data) {
  const { promotion, userPromotion, ... } = result.data;

// New (if backend returns different structure)
if (result) {
  const { promotion, userPromotion, ... } = result;
```

---

### **Fix 2: Redux DevTools không cài**

Install Redux DevTools extension:

- Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

---

### **Fix 3: Promotion hiển thị nhưng giá không giảm**

Kiểm tra `promotion.discountAmount`:

```typescript
console.log('Discount Amount:', promotion?.discountAmount);
console.log('Type:', typeof promotion?.discountAmount);
```

**❌ Nếu undefined hoặc 0:**

- Backend tính toán sai
- Kiểm tra backend logs

**✅ Nếu có giá trị:**

- Check template rendering:

```tsx
{
  promotion && <div>Discount: -{promotion.discountAmount.toLocaleString()} ₫</div>;
}
```

---

## 📋 Test Checklist

### **Test với mã STUDENT20:**

**Giả sử:**

- Base fare: 100,000 ₫
- Selected seats: 2
- Total before discount: 200,000 ₫
- Discount: 20%
- Expected discount: 40,000 ₫
- Expected final: 160,000 ₫

**Test steps:**

1. ✅ Chọn 2 ghế → Total hiển thị 200,000 ₫
2. ✅ Nhập "STUDENT20" → Click Apply
3. ✅ Thấy toast success: "🎉 Promo applied! Save 20%"
4. ✅ Thấy badge xanh: "STUDENT20 | 20% off"
5. ✅ Thấy dòng discount: "-40,000 ₫"
6. ✅ Total cập nhật: "160,000 ₫"
7. ✅ Thấy message: "💰 You saved 40,000 ₫..."

**❌ Nếu bước nào fail:**

- Check console logs
- Check Redux state
- Check Network response

---

## 🔧 Quick Debug Commands

**Open browser console và chạy:**

```javascript
// Check Redux state
console.log('Redux State:', window.__REDUX_DEVTOOLS_EXTENSION__?.getState?.()?.booking);

// Check promotion in state
const state = window.__REDUX_DEVTOOLS_EXTENSION__?.getState?.();
console.log('Promotion:', state?.booking?.promotion);

// Force re-render (for testing)
// Click on any seat to trigger re-render
```

---

## 📞 Nếu vẫn không work

### **Thu thập thông tin:**

1. **Console logs:** Copy tất cả logs từ Console tab
2. **Network response:** Copy response từ validate API
3. **Redux state:** Screenshot Redux DevTools
4. **UI screenshot:** Screenshot booking page

### **Kiểm tra:**

```typescript
// In BookingPromoCode.tsx
console.log('Total Amount:', totalAmount);
console.log('Promo Code:', promoCode);
console.log('API Result:', result);
console.log('Promotion Data:', result.data);

// In booking page
console.log('Promotion from State:', promotion);
console.log('Discount Amount:', promotion?.discountAmount);
```

---

## ⚠️ Lưu ý về "Promotion Used"

**Promotion KHÔNG "used" ngay sau validate!**

```
Validate API → isUsed: false ✅ (đúng)
              ↓
        Lưu vào state
              ↓
        Hiển thị discount
              ↓
    User tiếp tục checkout
              ↓
    POST /api/v1/bookings
              ↓
   isUsed: true ✅ (chỉ lúc này mới used)
```

**Để test "used":**

1. Apply promo code
2. Điền passenger info
3. Click "Continue to Checkout"
4. Confirm booking
5. Check trong database/admin → isUsed = true

---

## 🎯 Expected Behavior

**Khi click Apply:**

- ✅ API 200 OK
- ✅ Toast success hiển thị
- ✅ Badge xanh hiển thị code
- ✅ Dòng discount hiển thị
- ✅ Total price giảm
- ❌ isUsed VẪN là false (đúng!)

**Khi tạo booking:**

- ✅ Booking created
- ✅ isUsed = true
- ✅ Không thể dùng lại code

---

## 📝 Test Script

Copy đoạn này vào console để test:

```javascript
// Test promo state
const checkPromo = () => {
  const state = window.__REDUX_DEVTOOLS_EXTENSION__?.getState?.();
  const promo = state?.booking?.promotion;

  console.log('=== PROMO CHECK ===');
  console.log('Has promotion:', !!promo);

  if (promo) {
    console.log('Code:', promo.code);
    console.log('Discount Amount:', promo.discountAmount);
    console.log('Final Amount:', promo.finalAmount);
    console.log('User Promotion ID:', promo.userPromotionId);
  } else {
    console.log('❌ No promotion in state');
  }
  console.log('==================');
};

// Run it
checkPromo();
```

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0
