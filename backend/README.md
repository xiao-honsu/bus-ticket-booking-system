# Bus Ticket Booking System - Backend API

Backend API cho hệ thống đặt vé xe buýt được xây dựng với Express.js, TypeScript và MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication với role-based access control
- **User Management**: Quản lý users với các roles khác nhau (user, admin, operator)
- **Bus Management**: Quản lý thông tin xe buýt
- **Route Management**: Quản lý tuyến đường
- **Trip Management**: Quản lý chuyến đi
- **Booking System**: Hệ thống đặt vé với seat selection
- **Security**: Helmet, rate limiting, XSS protection, data sanitization
- **Validation**: Request validation với Joi
- **Error Handling**: Centralized error handling
- **Logging**: Winston logger với Morgan HTTP logger
- **TypeScript**: Full TypeScript support với type safety

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose 9
- **Authentication**: Passport.js + JWT
- **Validation**: Joi
- **Logging**: Winston + Morgan
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize
- **Process Manager**: PM2

## 🛠️ Installation

```bash
# Clone repository
cd Source/backend

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env
# Edit .env với thông tin của bạn

# Build TypeScript
yarn build

# Run in development
yarn dev

# Run in production
yarn start
```

## 📝 Environment Variables

Xem file `.env.example` để biết các biến môi trường cần thiết.

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files (database, logger, passport, etc.)
├── controllers/     # Route controllers (controller layer)
├── middlewares/     # Custom express middlewares
├── models/          # Mongoose models (data layer)
│   └── plugins/     # Mongoose plugins (toJSON, paginate)
├── routes/          # API routes
│   └── v1/          # Version 1 routes
├── services/        # Business logic (service layer)
├── types/           # TypeScript types & interfaces
├── utils/           # Utility functions
├── validations/     # Request validation schemas
├── app.ts           # Express app setup
└── index.ts         # Entry point
```

## 🔐 API Endpoints

### Authentication
- `POST /v1/auth/register` - Đăng ký user mới
- `POST /v1/auth/login` - Đăng nhập
- `POST /v1/auth/logout` - Đăng xuất
- `POST /v1/auth/refresh-tokens` - Refresh access tokens
- `POST /v1/auth/forgot-password` - Gửi email reset password
- `POST /v1/auth/reset-password` - Reset password
- `POST /v1/auth/verify-email` - Verify email

### Buses
- `POST /v1/buses` - Tạo bus mới (admin/operator)
- `GET /v1/buses` - Lấy danh sách buses
- `GET /v1/buses/:busId` - Lấy chi tiết bus
- `PATCH /v1/buses/:busId` - Cập nhật bus (admin/operator)
- `DELETE /v1/buses/:busId` - Xóa bus (admin/operator)

### Routes
- `POST /v1/routes` - Tạo route mới (admin)
- `GET /v1/routes` - Lấy danh sách routes
- `GET /v1/routes/search` - Tìm kiếm routes
- `GET /v1/routes/:routeId` - Lấy chi tiết route
- `PATCH /v1/routes/:routeId` - Cập nhật route (admin)
- `DELETE /v1/routes/:routeId` - Xóa route (admin)

### Trips
- `POST /v1/trips` - Tạo trip mới (admin/operator)
- `GET /v1/trips` - Lấy danh sách trips
- `GET /v1/trips/search` - Tìm kiếm trips
- `GET /v1/trips/:tripId` - Lấy chi tiết trip
- `PATCH /v1/trips/:tripId` - Cập nhật trip (admin/operator)
- `DELETE /v1/trips/:tripId` - Xóa trip (admin/operator)

### Bookings
- `POST /v1/bookings` - Tạo booking mới
- `GET /v1/bookings` - Lấy danh sách bookings
- `GET /v1/bookings/:bookingId` - Lấy chi tiết booking
- `PATCH /v1/bookings/:bookingId` - Cập nhật booking (admin)
- `POST /v1/bookings/:bookingId/cancel` - Hủy booking

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn coverage
```

## 📚 Code Quality

```bash
# Lint code
yarn lint

# Fix lint errors
yarn lint:fix

# Format code
yarn prettier:fix
```

## 🚢 Deployment

```bash
# Build for production
yarn build

# Start with PM2
yarn start:pm2
```

## 📄 License

MIT
