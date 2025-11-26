# Plan: Setup Next.js Frontend for Bus Ticket Booking System

Thiết lập một project Next.js App Router với Redux Toolkit, RTK Query, TailwindCSS, Shadcn UI, và TypeScript cho bus ticket booking system trong folder `Source/frontend`. Structure được tổ chức theo page-based containers với Redux quản lý state theo features.

## Steps

### 1. Initialize Next.js project
Chạy `cd Source; npx create-next-app@latest frontend --no-git` với options:
- TypeScript: Yes
- ESLint: Yes
- TailwindCSS: Yes
- App Router: Yes
- No src/ directory: No
- Import alias: `@/*`

### 2. Install core dependencies
Chạy `cd Source/frontend` rồi install packages qua terminal:
- `@reduxjs/toolkit`
- `react-redux`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`

(Không specify version cho bất kỳ package nào)

### 3. Setup Shadcn UI
Chạy `npx shadcn@latest init` trong `Source/frontend` để khởi tạo Shadcn UI với default settings:
- Style: New York
- Base color: Zinc
- CSS variables: Yes

### 4. Create Redux store structure
Tạo cấu trúc Redux store với RTK Query:
- `lib/store.ts` - Configure Redux store with RTK Query middleware
- `lib/hooks.ts` - Typed Redux hooks (useAppDispatch, useAppSelector)
- `lib/store/features/` - Feature slices folder:
  - `auth/authSlice.ts` - Authentication state (user, tokens, isAuthenticated)
  - `booking/bookingSlice.ts` - Booking flow state (selectedSeats, passengers, payment)
  - `trip/tripSlice.ts` - Trip search state (searchParams, filters)
  - `bus/busSlice.ts` - Bus management state (admin)
  - `route/routeSlice.ts` - Route management state (admin)
- `lib/store/services/api.ts` - RTK Query API service setup:
  - Base URL: `http://localhost:3000/v1`
  - Endpoints: auth, users, buses, routes, trips, bookings
  - Auto-generated hooks for all endpoints

### 5. Setup folder structure
Tạo `containers/` folder (cùng level với `app/`) với các subfolders theo page:

```
containers/
├── landing-page/
│   ├── HeroSection.tsx
│   ├── SearchForm.tsx
│   ├── PopularRoutes.tsx
│   └── index.ts
├── trip-search-results/
│   ├── SearchFilters.tsx
│   ├── TripCard.tsx
│   ├── TripList.tsx
│   └── index.ts
├── seat-selection/
│   ├── SeatMap.tsx
│   ├── SeatLegend.tsx
│   ├── PassengerForm.tsx
│   └── index.ts
├── checkout-page/
│   ├── BookingSummary.tsx
│   ├── PaymentMethods.tsx
│   ├── PassengerDetails.tsx
│   └── index.ts
├── user-dashboard/
│   ├── BookingHistory.tsx
│   ├── UpcomingTrips.tsx
│   ├── ProfileSettings.tsx
│   └── index.ts
├── admin-dashboard/
│   ├── OperatorManagement.tsx
│   ├── BusManagement.tsx
│   ├── RouteManagement.tsx
│   ├── TripManagement.tsx
│   ├── BookingOverview.tsx
│   └── index.ts
└── auth/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    ├── ForgotPasswordForm.tsx
    └── index.ts
```

Mỗi folder chứa:
- Page-specific components
- Custom hooks (useBooking, useAuth, etc.)
- Types/interfaces (types.ts)
- Utils (utils.ts)

### 6. Configure app router & providers
Setup Next.js App Router với Redux Provider:

**`app/layout.tsx`**: Wrap children với Redux Provider
**`app/providers.tsx`**: Client component chứa Redux Provider

Routing structure trong `app/`:
```
app/
├── page.tsx                    # Landing page (import from containers/landing-page)
├── search/
│   └── page.tsx               # Trip search results
├── booking/
│   └── [tripId]/
│       └── page.tsx           # Seat selection
├── checkout/
│   └── page.tsx               # Checkout page
├── dashboard/
│   └── page.tsx               # User dashboard
├── admin/
│   ├── page.tsx               # Admin overview
│   ├── operators/
│   ├── buses/
│   ├── routes/
│   └── trips/
├── auth/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── layout.tsx                 # Root layout with Provider
```

## Further Considerations

### 1. Environment variables
Cần tạo `.env.local` với:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_PAYMENT_GATEWAY_URL=...
```

Các configs tương ứng với backend `.env`:
- JWT_SECRET (for token validation)
- Payment gateway configs
- SMTP configs (nếu cần client-side email features)

### 2. Authentication strategy
Implement JWT token management:
- **Token storage**: localStorage vs httpOnly cookies?
  - Recommendation: httpOnly cookies cho security, với refresh token rotation
- **Refresh token logic**: Automatic token refresh interceptor trong RTK Query
- **Protected routes**: Next.js middleware.ts để check authentication
- **Role-based access**: Middleware check user role (user/admin) cho protected pages

### 3. RTK Query endpoints priority
Ưu tiên implement theo user flow:

**Phase 1 - Core booking flow**:
1. Auth endpoints (login, register, logout, refresh tokens)
2. Trip search endpoints (GET /trips với query params)
3. Seat availability (GET /trips/:id/seats)
4. Create booking (POST /bookings)

**Phase 2 - User features**:
5. User profile (GET/PATCH /users/:id)
6. Booking history (GET /bookings)
7. Booking details (GET /bookings/:id)
8. Cancel booking (POST /bookings/:id/cancel)

**Phase 3 - Admin features**:
9. Manage operators (CRUD /operators)
10. Manage buses (CRUD /buses)
11. Manage routes (CRUD /routes)
12. Manage trips (CRUD /trips)

### 4. Additional technical considerations

**TypeScript types**:
- Generate types từ backend models (User, Booking, Trip, Bus, Route)
- Shared types cho API requests/responses
- Strict type safety cho Redux state

**Error handling**:
- Global error boundary
- RTK Query error handling với toast notifications
- Form validation errors

**Performance optimization**:
- Server Components where possible (landing, search results)
- Client Components for interactive parts (seat selection, forms)
- Image optimization với next/image
- Route prefetching

**UI/UX enhancements**:
- Loading states với Shadcn Skeleton
- Toast notifications với Shadcn Toast
- Form validation với React Hook Form + Zod
- Responsive design mobile-first

**Testing setup**:
- Jest + React Testing Library
- Playwright for E2E tests
- Test coverage for critical flows (booking, payment)

## Backend API Reference

Based on analysis of backend code:

**Base URL**: `http://localhost:3000/v1`

**Available endpoints**:
- `/auth` - register, login, logout, refresh-tokens, forgot-password, reset-password, verify-email
- `/users` - user CRUD operations
- `/buses` - bus management
- `/routes` - route management
- `/trips` - trip search and management
- `/bookings` - booking creation and management

**Authentication**: JWT Bearer token in Authorization header

**Key features to support**:
- Passenger details collection (name, age, gender, seat number, document ID, phone)
- Multiple payment methods (momo, zalopay, payos, card, bank_transfer)
- Booking status tracking (pending, confirmed, cancelled, completed)
- User roles and permissions (user, admin)
- Email notifications (booking confirmations, trip reminders, updates)
- Seat locking mechanism during booking process
