# Bus Ticket Booking System - Backend API

Backend API cho hệ thống đặt vé xe buýt được xây dựng với Express.js, TypeScript và MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication với Passport.js và role-based access control
- **User Management**: Quản lý users với các roles khác nhau (user, admin, operator)
- **Bus Management**: Quản lý thông tin xe buýt và operators
- **Route Management**: Quản lý tuyến đường với điểm đi và điểm đến
- **Trip Management**: Quản lý chuyến đi với thông tin xe, tuyến, giá vé
- **Booking System**: Hệ thống đặt vé với seat selection, seat locking mechanism
- **Review System**: Đánh giá và vote cho reviews
- **Notification System**: Thông báo cho users
- **Chat Sessions**: Quản lý chat sessions
- **Search History**: Lưu lịch sử tìm kiếm của users
- **Audit Logging**: Ghi log các thao tác quan trọng
- **Password Reset**: Quên mật khẩu và reset password
- **Security**: Helmet, rate limiting, data sanitization với mongo-sanitize
- **Validation**: Request validation với Joi
- **Error Handling**: Centralized error handling
- **Logging**: Winston logger với Morgan HTTP logger
- **TypeScript**: Full TypeScript support với path aliases (@/*)
- **Compression**: Response compression với gzip

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Database**: MongoDB with Mongoose 9.0.0
- **Authentication**: Passport.js 0.7.0 + Passport-JWT 4.0.1
- **Validation**: Joi 18.0.2
- **Logging**: Winston 3.18.3 + Morgan 1.10.1
- **Security**: Helmet 8.1.0, express-rate-limit 8.2.1, @exortek/express-mongo-sanitize 1.1.1
- **Email**: Nodemailer 7.0.10
- **Process Manager**: PM2 6.0.13
- **Date Utils**: date-fns 4.1.0
- **Dev Tools**: ts-node, nodemon, tsc-alias, tsconfig-paths

## 🛠️ Installation

```bash
# Clone repository và di chuyển vào thư mục backend
cd Source/backend

# Install dependencies bằng yarn
yarn install

# Setup environment variables
# Tạo file .env và cấu hình các biến môi trường sau:
```

### Environment Variables (.env)

```env
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database
MONGODB_URL=mongodb://localhost:27017/bus-ticket-booking

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# SMTP Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com

# Payment Gateway (optional)
PAYMENT_GATEWAY_URL=https://payment-gateway.example.com
PAYMENT_SECRET_KEY=payment-secret-key

# Logging
LOG_LEVEL=info
```

### Build và Run

```bash
# Build TypeScript code
yarn build

# Run in development mode với nodemon và ts-node
yarn dev

# Run in production mode
yarn start

# Run with PM2 (cluster mode)
yarn start:pm2
```

## 🏗️ Project Structure

```
src/
├── config/              # Configuration files
│   ├── config.ts        # Environment config với Joi validation
│   ├── logger.ts        # Winston logger setup
│   ├── morgan.ts        # Morgan HTTP logger config
│   ├── passport.ts      # Passport JWT strategy
│   ├── roles.ts         # Role-based access control
│   └── tokens.ts        # JWT token generation & verification
├── controllers/         # Route controllers (controller layer)
│   ├── auth.controller.ts
│   └── booking.controller.ts
├── middlewares/         # Custom express middlewares
│   ├── auth.ts          # Authentication & authorization middleware
│   ├── error.ts         # Error converter & handler
│   ├── rateLimiter.ts   # Rate limiting middleware
│   └── validate.ts      # Request validation middleware
├── models/              # Mongoose models (data layer)
│   ├── auditlog.model.ts       # Audit logging
│   ├── booking.model.ts        # Booking management
│   ├── bus.model.ts            # Bus information
│   ├── chatsession.model.ts    # Chat sessions
│   ├── notification.model.ts   # User notifications
│   ├── operator.model.ts       # Bus operators
│   ├── passwordreset.model.ts  # Password reset tokens
│   ├── review.model.ts         # Trip reviews
│   ├── reviewvote.model.ts     # Review voting
│   ├── route.model.ts          # Bus routes
│   ├── searchhistory.model.ts  # Search history
│   ├── seatlock.model.ts       # Seat locking mechanism
│   ├── token.model.ts          # Auth tokens
│   ├── trip.model.ts           # Trip schedules
│   └── user.model.ts           # User accounts
├── routes/              # API routes
│   └── v1/              # Version 1 API routes
│       ├── auth.route.ts      # Authentication routes
│       ├── booking.route.ts   # Booking routes
│       ├── bus.route.ts       # Bus routes
│       ├── route.route.ts     # Route routes
│       ├── trip.route.ts      # Trip routes
│       ├── user.route.ts      # User routes
│       └── index.ts           # Route aggregator
├── services/            # Business logic (service layer)
│   ├── auth.service.ts
│   ├── booking.service.ts
│   ├── bus.service.ts
│   ├── route.service.ts
│   ├── token.service.ts
│   ├── trip.service.ts
│   └── user.service.ts
├── types/               # TypeScript custom types
│   └── express.d.ts     # Express type extensions
├── utils/               # Utility functions
│   ├── ApiError.ts      # Custom error class
│   ├── catchAsync.ts    # Async error wrapper
│   └── pick.ts          # Object property picker
├── validations/         # Joi validation schemas
│   ├── auth.validation.ts
│   ├── booking.validation.ts
│   └── custom.validation.ts
├── app.ts               # Express app setup với middlewares
└── index.ts             # Entry point - server start

tests/                   # Test files
ecosystem.config.js      # PM2 configuration (cluster mode)
nodemon.json            # Nodemon configuration
package.json            # Dependencies và scripts
tsconfig.json           # TypeScript configuration với path aliases
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
