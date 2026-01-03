# Sitemap

Welcome to the BusTicket sitemap. This page provides a comprehensive overview of all pages and features available on our platform.

## Main Pages

### Home

[Home](/) - Main landing page with search, promotions, and popular routes

### Search & Booking

- [Search Trips](/#search) - Search for bus trips by route and date
- [Search Results](/search) - Browse available trips
- [Trip Details](/trips/[id]) - Detailed trip information
- [Seat Selection](/trips/[id]/seats) - Interactive seat map
- [Checkout](/checkout) - Complete booking and payment

### User Account

- [Sign Up](/auth/register) - Create new account
- [Login](/auth/login) - Sign in to existing account
- [Forgot Password](/auth/forgot-password) - Password recovery
- [Reset Password](/auth/reset-password) - Create new password
- [Dashboard](/dashboard) - User dashboard and bookings
- [Profile Settings](/dashboard/profile) - Manage account details
- [My Bookings](/dashboard/bookings) - View and manage bookings
- [Notifications](/dashboard/notifications) - Email and SMS preferences
- [Promotions](/dashboard/promotions) - Collected promotions

### Information Pages

- [About Us](/about) - Company information and mission
- [Help Center](/help) - Comprehensive help and guides
- [FAQ](/faq) - Frequently asked questions
- [Contact](/contact) - Get in touch with support

### Legal & Policies

- [Terms of Service](/terms) - User agreement and terms
- [Privacy Policy](/privacy) - Data handling and privacy
- [Cookie Policy](/cookies) - Cookie usage information
- [Accessibility](/accessibility) - Accessibility statement

### Payment & Booking

- [Payment Success](/payment/success) - Successful payment confirmation
- [Payment Failure](/payment/failure) - Payment error handling
- [Booking Confirmation](/bookings/[reference]) - Booking details by reference

### Promotions

- [Browse Promotions](/promotions) - View all available promotions
- [Promotion Details](/promotions/[code]) - Individual promotion info

### Reviews & Ratings

- [Operator Reviews](/operators/[id]/reviews) - Operator ratings and reviews
- [Submit Review](/bookings/[id]/review) - Write a review after trip

## Platform Features

### For All Users

**Search & Discovery**:

- Real-time trip search
- Route filtering
- Date selection
- Price comparison
- Operator comparison
- Bus amenities filtering
- Available seats display

**Booking System**:

- Interactive seat map
- Real-time seat locking (10 minutes)
- Multiple passenger support
- Guest checkout option
- Seat type selection (standard, VIP, sleeper)
- Dynamic pricing by seat location

**Payment Options**:

- PayOS payment gateway
- Credit/Debit cards
- Bank transfer
- E-wallets (MoMo, ZaloPay)
- Secure payment processing
- Multiple currency support

**Booking Management**:

- Booking reference lookup
- Email confirmations
- SMS notifications
- Digital tickets
- Booking status tracking
- Cancellation requests
- Refund processing

### For Registered Users

**Enhanced Features**:

- Booking history
- Save favorite routes
- Quick passenger information
- Promotion collection
- Multiple saved passengers
- Notification preferences
- Review submission
- Profile customization

**Account Features**:

- Social login (Google OAuth)
- Secure authentication
- Password management
- Email verification
- Account statistics:
  - Total bookings
  - Completed trips
  - Cancelled bookings
  - Total spent

**Promotion System**:

- Browse available promotions
- Collect promotions to account
- Apply discount codes
- Track promotion usage
- View promotion history
- Per-user collection limits

**Communication Preferences**:

- Email notifications:
  - Booking confirmations ✓
  - Trip reminders ✓
  - Trip updates ✓
  - Promotional offers (opt-in)
- SMS notifications:
  - Booking confirmations
  - Trip reminders
  - Updates
- Push notifications (coming soon)

### Real-Time Features

**Socket.IO Integration**:

- Live seat availability updates
- Real-time seat locking/unlocking
- Instant booking notifications
- WebSocket room subscriptions
- Automatic reconnection handling

**Automated Notifications**:

- 24-hour trip reminders
- 2-hour departure reminders
- Booking confirmations
- Payment receipts
- Cancellation notifications
- Operator trip updates

### Security Features

**Authentication**:

- JWT token system (30-minute access)
- Refresh tokens (30-day validity)
- OAuth2 social login
- Bcrypt password hashing
- Account lockout protection (5 failed attempts)
- Email verification

**Data Protection**:

- SSL/TLS encryption
- HTTPS-only cookies
- CSRF protection
- XSS prevention
- SQL injection protection
- Role-based access control (RBAC)

**Payment Security**:

- PCI DSS compliant processing
- 3D Secure authentication
- Encrypted transactions
- Secure payment gateways
- No card storage

## Bus Operators

### Operator Information

- [Operator Directory](/operators) - List of partner operators
- [Operator Profile](/operators/[id]) - Detailed operator information
- [Operator Reviews](/operators/[id]/reviews) - Customer reviews
- [Operator Fleet](/operators/[id]/fleet) - Bus fleet details

### Operator Features

- Company information
- Rating and reviews
- Fleet details
- Contact information
- Popular routes
- Performance metrics

## Routes & Destinations

### Major Cities Connected

**Northern Vietnam**:

- Hanoi (Ha Noi) - Capital city
- Hai Phong - Port city
- Ninh Binh - Natural beauty
- Ha Long - Bay and beaches

**Central Vietnam**:

- Da Nang - Coastal hub
- Hue - Imperial city
- Hoi An - Ancient town
- Quy Nhon - Beach destination

**Southern Vietnam**:

- Ho Chi Minh City (Saigon) - Economic center
- Vung Tau - Beach resort
- Can Tho - Mekong Delta
- Da Lat - Highland city

**Popular Routes**:

- Hanoi ↔ Ho Chi Minh City
- Hanoi ↔ Da Nang
- Ho Chi Minh ↔ Da Lat
- Ho Chi Minh ↔ Nha Trang
- Da Nang ↔ Hue
- Hanoi ↔ Hai Phong

## API & Technical

### Public Endpoints

(For developers and partners)

**Search & Routes**:

- `GET /api/v1/search/trips` - Search trips
- `GET /api/v1/routes` - List routes
- `GET /api/v1/routes/:id` - Route details
- `GET /api/v1/popular-routes` - Popular routes

**Operators**:

- `GET /api/v1/operators` - List operators
- `GET /api/v1/operators/:id` - Operator details

**Trips**:

- `GET /api/v1/trips/:id` - Trip details
- `GET /api/v1/trips/:id/seats` - Seat availability

### Authenticated Endpoints

(Requires login)

**Bookings**:

- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List user bookings
- `GET /api/v1/bookings/:id` - Booking details
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking

**User Account**:

- `GET /api/v1/users/me` - Current user profile
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users/me/stats` - User statistics

**Promotions**:

- `GET /api/v1/promotions` - List promotions
- `POST /api/v1/promotions/:id/collect` - Collect promotion
- `GET /api/v1/users/me/promotions` - User promotions

**Reviews**:

- `POST /api/v1/reviews` - Submit review
- `GET /api/v1/reviews` - List reviews
- `PUT /api/v1/reviews/:id` - Update review

### WebSocket Events

(Real-time features)

**Client → Server**:

- `joinTrip` - Join trip room for updates
- `leaveTrip` - Leave trip room
- `selectSeats` - Lock seats
- `releaseSeats` - Release locked seats

**Server → Client**:

- `seatLocked` - Seat locked by user
- `seatUnlocked` - Seat lock expired/released
- `seatBooked` - Seat permanently booked
- `bookingCreated` - New booking notification

## Mobile Experience

### Responsive Design

All pages optimized for:

- Smartphones (iOS, Android)
- Tablets (iPad, Android tablets)
- Desktop browsers
- Various screen sizes (320px to 4K)

### Touch Optimizations

- Touch-friendly seat selection
- Swipe gestures (where applicable)
- Mobile-optimized forms
- Responsive navigation
- Bottom navigation (mobile)

### Progressive Features

- Fast page loads
- Offline error handling
- Service workers (coming soon)
- Push notifications (coming soon)

## Accessibility

### WCAG Compliance

- Keyboard navigation
- Screen reader support
- Alt text for images
- Semantic HTML
- ARIA labels
- Color contrast compliance
- Focus indicators
- Skip navigation links

See [Accessibility Statement](/accessibility) for details.

## Content Types

### Dynamic Content

- Trip listings
- Seat maps
- Booking status
- User profiles
- Reviews and ratings
- Analytics dashboards (operators)

### Static Content

- Help articles
- Policy documents
- About information
- FAQ entries
- Legal terms

### User-Generated Content

- Reviews and ratings
- User profiles
- Booking notes
- Support tickets

## Language Support

**Current Languages**:

- English (EN)
- Vietnamese (VI)

**Coming Soon**:

- Korean (KO)
- Chinese (ZH)
- Japanese (JA)

## Partner Integration

### For Bus Operators

- Operator dashboard
- Trip management
- Booking notifications
- Revenue reports
- Customer feedback
- Fleet management

### For Travel Agencies

- Bulk booking API
- White-label solutions (future)
- Affiliate program (planned)
- Corporate accounts

## Support & Help

### Contact Channels

- **Email**: talenthive.website@gmail.com
- **Phone**: 0762685089
- **Live Chat**: Coming soon

### Support Topics

- Booking assistance
- Payment issues
- Technical problems
- Account help
- Operator inquiries
- Partnership opportunities

### Self-Service

- [Help Center](/help) - Comprehensive guides
- [FAQ](/faq) - Quick answers
- Search knowledge base
- Video tutorials (coming soon)

## Social Media

Stay connected:

- Facebook: [facebook.com/busticket](#)
- Twitter: [twitter.com/busticket](#)
- Instagram: [instagram.com/busticket](#)

## Future Features

Coming soon:

- Native mobile apps (iOS & Android)
- Live chat support
- Loyalty rewards program
- Multi-language support expansion
- Trip planning tools
- Group booking discounts
- Corporate accounts
- Travel insurance integration
- Luggage add-ons

## Last Updated

This sitemap was last updated: January 3, 2026

For questions about our platform structure or navigation:

- Email: talenthive.website@gmail.com
- Phone: 0762685089

---

**Quick Links**:

- [Home](/) | [Search Trips](/#search) | [My Bookings](/dashboard/bookings) | [Help](/help) | [Contact](/contact)
