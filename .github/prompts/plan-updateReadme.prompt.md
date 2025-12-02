# Plan Update README.md - Bus Ticket Booking System

## 🔴 Các lỗi sai phát hiện được

### 1. **Role System - SAI**

**README ghi (dòng 38-42, 428-436):**
```
- Three user roles: `admin`, `editor`, `user`
- Four Roles: user, operator, admin, superadmin
```

**Thực tế trong `backend/src/config/roles.ts`:**
```typescript
const allRoles = {
  user: [...],
  admin: [...]
};
// Chỉ có 2 roles: user và admin
```

---

### 2. **Tech Stack Backend - SAI**

**README ghi (dòng 79-86):**
```
- Database: MongoDB with Mongoose ODM
- Tokens: JWT (jsonwebtoken)
- Database: Prisma mentioned in structure
```

**Thực tế theo `backend/README.md` và `backend/package.json`:**
- ✅ MongoDB với Mongoose 9.0.0
- ❌ Không dùng Prisma
- Express.js 5.1.0, TypeScript 5.9.3

---

### 3. **Project Structure - SAI**

**README ghi có folder:**
```
├── prisma/
│   └── schema.prisma
```

**Thực tế:** Không có folder `prisma/` - Backend dùng Mongoose models

---

### 4. **Frontend Tech - THIẾU/SAI**

**README ghi:**
```
- OAuth: NextAuth.js (Google OAuth)
- HTTP Client: Axios
- Forms: React Hook Form + Zod validation
```

**Thực tế theo `frontend/README.md`:**
- State: Redux Toolkit + RTK Query
- HTTP: RTK Query (không phải Axios riêng)
- OAuth: Firebase Auth (không phải NextAuth.js)

---

### 5. **API Endpoints - SAI format**

**README ghi:**
```
POST /api/auth/register
POST /api/dashboard/stats
```

**Thực tế theo `backend/src/routes/v1/index.ts`:**
```
POST /v1/auth/register
GET /v1/users
# Base URL: /v1 không phải /api
```

---

### 6. **Environment Variables - THIẾU**

**README thiếu nhiều biến quan trọng:**
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (Payment)
- Firebase config cho frontend
- `FRONTEND_URL` cho payment redirects

---

### 7. **Features thiếu/sai**

**README không đề cập các features quan trọng:**
- ❌ Guest Booking (đặt vé không cần đăng ký)
- ❌ Seat Locking Mechanism (10 phút TTL)
- ❌ PayOS Payment Integration
- ❌ Chatbot Service
- ❌ Review/Rating System
- ❌ Operator Management

---

### 8. **Dashboard Widgets - SAI**

**README ghi:**
```
- Total users count
- Active sessions
- System status
```

**Thực tế theo `design/dashboard-mockup.md`:**
```
- Total Bookings
- Upcoming Trips
- Total Spent
- Recent Bookings Table
```

---

## 📋 Plan Update README

### Phase 1: Sửa thông tin Core (Quan trọng nhất)

| Section | Vấn đề | Sửa thành |
|---------|--------|-----------|
| Authorization | 4 roles | 2 roles: `user`, `admin` |
| Tech Stack Backend | Prisma | Mongoose ODM only |
| Tech Stack Frontend | NextAuth.js, Axios | Firebase Auth, RTK Query |
| API Base URL | `/api/*` | `/v1/*` |
| Project Structure | Có prisma folder | Xóa prisma, cập nhật đúng structure |

### Phase 2: Bổ sung Features thực tế

1. **Core Features:**
   - Guest Booking Flow
   - Seat Locking (10 min TTL)
   - PayOS Payment Integration
   - Email Notifications (Nodemailer)

2. **Admin Features:**
   - Operator Management
   - Bus/Route/Trip Management
   - Booking Overview

3. **User Features:**
   - Trip Search
   - Seat Selection
   - Booking History
   - Review System

### Phase 3: Cập nhật Environment Variables

```env
# Backend additions needed:
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=

# Frontend additions needed:
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
```

### Phase 4: Cập nhật API Documentation

- Sửa base URL từ `/api` sang `/v1`
- Thêm các endpoints thực tế (bookings, trips, operators, etc.)
- Thêm guest booking endpoint

---

## 📝 TODO Actions

- [ ] Sửa role system: 4 roles → 2 roles (user, admin)
- [ ] Xóa Prisma references, cập nhật Mongoose
- [ ] Sửa Frontend tech stack (Firebase Auth, RTK Query)
- [ ] Cập nhật Project Structure chính xác
- [ ] Sửa API endpoints format (/v1/*)
- [ ] Thêm missing features (Guest Booking, Seat Lock, PayOS, etc.)
- [ ] Cập nhật Dashboard widgets đúng thực tế
- [ ] Bổ sung Environment Variables
- [ ] Cập nhật API Documentation
