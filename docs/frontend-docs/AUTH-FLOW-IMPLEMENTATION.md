# Auth Flow Implementation Summary

## Tổng quan
Đã implement graceful auth flow với modal xác nhận logout thay vì redirect trực tiếp khi user đã đăng nhập cố truy cập vào login/register pages.

## Thay đổi chính

### 1. LogoutConfirmDialog Component (`components/auth/LogoutConfirmDialog.tsx`)
- Modal xác nhận sử dụng AlertDialog từ shadcn/ui
- Hiển thị khi user đã login cố truy cập auth pages
- 2 options: "Cancel" hoặc "Logout and Continue"
- Động hiển thị tên trang đích (Login/Register)

### 2. useAuthGuard Hook (`lib/hooks/useAuthGuard.ts`)
**Chức năng:**
- Kiểm tra authentication state
- Tự động hiển thị modal khi user đã login truy cập auth pages
- Xử lý logout toàn diện

**Logout process:**
```typescript
1. Xóa Redux state (dispatch logout)
2. Xóa TẤT CẢ cookies (không chỉ token và userRole)
3. Xóa localStorage
4. Xóa sessionStorage
5. Hiển thị toast notification
```

**Return values:**
- `isAuthenticated`: Auth status
- `user`: User data
- `showLogoutDialog`: Modal visibility state
- `setShowLogoutDialog`: Control modal
- `handleLogout`: Thực hiện logout
- `handleCancel`: Hủy và quay lại
- `targetPage`: Trang đích ('login' | 'register')

### 3. Middleware Update (`middleware.ts`)
**Trước:**
```typescript
// Auto redirect khi logged in user truy cập auth pages
if (token && pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

**Sau:**
```typescript
// Cho phép truy cập, để component tự xử lý với modal
// No redirect here, let the client-side component handle it gracefully
return NextResponse.next();
```

### 4. Auth Pages Update
**Login Page (`app/auth/login/page.tsx`):**
```tsx
'use client';
- Sử dụng useAuthGuard với redirectIfAuthenticated: true
- Render LogoutConfirmDialog
- Hiển thị LoginForm
```

**Register Page (`app/auth/register/page.tsx`):**
```tsx
'use client';
- Tương tự Login Page
- targetPage: 'register'
```

### 5. Navbar Logout Enhancement
**Cập nhật handleLogout để:**
- Xóa TẤT CẢ cookies (không chỉ token và userRole)
- Xóa localStorage và sessionStorage
- Đảm bảo cleanup hoàn toàn

## User Flow

### Scenario 1: User chưa login
1. Truy cập `/auth/login` hoặc `/auth/register`
2. Hiển thị form login/register bình thường

### Scenario 2: User đã login cố truy cập auth pages
1. User đã login, navigate tới `/auth/login` hoặc `/auth/register`
2. Middleware cho phép truy cập (không redirect)
3. Page render với form
4. `useAuthGuard` detect user đã login
5. **Modal hiển thị** với message:
   - Title: "Already Logged In"
   - Description: "You are currently logged in. To access the [login/register] page, you need to log out first. Do you want to log out and continue?"
   - Buttons: "Cancel" | "Logout and Continue"

6a. User nhấn **Cancel**:
   - Modal đóng
   - Navigate back về trang trước

6b. User nhấn **Logout and Continue**:
   - Xóa Redux state
   - Xóa tất cả cookies
   - Xóa localStorage và sessionStorage
   - Modal đóng
   - Toast: "Logged out successfully"
   - User có thể sử dụng form login/register

## Files Created/Modified

### Created:
1. ✅ `src/components/auth/LogoutConfirmDialog.tsx`
2. ✅ `src/lib/hooks/useAuthGuard.ts`
3. ✅ `src/components/ui/alert-dialog.tsx` (via shadcn CLI)

### Modified:
1. ✅ `src/middleware.ts` - Bỏ auto redirect
2. ✅ `src/app/auth/login/page.tsx` - Thêm useAuthGuard & modal
3. ✅ `src/app/auth/register/page.tsx` - Thêm useAuthGuard & modal
4. ✅ `src/components/Navbar.tsx` - Enhanced logout
5. ✅ `src/lib/hooks.ts` - Export useAuthGuard

## Dependencies Added
```bash
npm install @radix-ui/react-alert-dialog
```

## Testing Checklist

- [ ] User chưa login có thể truy cập login/register bình thường
- [ ] User đã login truy cập login page → Modal hiển thị
- [ ] User đã login truy cập register page → Modal hiển thị
- [ ] Nhấn "Cancel" → Quay lại trang trước
- [ ] Nhấn "Logout and Continue" → Logout thành công, có thể dùng form
- [ ] Kiểm tra cookies đã bị xóa hoàn toàn
- [ ] Kiểm tra localStorage/sessionStorage đã bị xóa
- [ ] Toast notification hiển thị đúng
- [ ] Redux state được clear
- [ ] Logout từ Navbar vẫn hoạt động bình thường

## Benefits

1. **Better UX**: Không bị redirect đột ngột, user có control
2. **Graceful**: Modal thông báo rõ ràng lý do và hành động
3. **Clean Logout**: Xóa sạch tất cả dữ liệu (cookies, storage)
4. **Reusable**: Hook có thể dùng cho các pages khác
5. **Type-safe**: Full TypeScript support
6. **Accessible**: AlertDialog component từ shadcn/ui có đầy đủ a11y
