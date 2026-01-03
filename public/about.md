# About BusTicket

## Our Mission

BusTicket is Vietnam's premier online bus ticket booking platform, dedicated to making bus travel convenient, reliable, and accessible for everyone. We connect travelers with verified bus operators across the country, providing a seamless booking experience from search to journey completion.

## What We Do

### Seamless Ticket Booking

We've revolutionized bus travel in Vietnam by digitizing the entire booking process:

- **Real-Time Search**: Instantly search thousands of trips across multiple operators
- **Interactive Seat Selection**: Choose your preferred seats with our visual seat map
- **Secure Payments**: Multiple payment options with bank-grade security
- **Digital Tickets**: Receive tickets instantly via email - no printing required
- **24/7 Availability**: Book anytime, anywhere, from any device

### Technology-Driven Platform

Our platform leverages cutting-edge technology to deliver the best user experience:

**Real-Time Seat Locking**:

- Socket.IO WebSocket connections for instant updates
- MongoDB TTL indexes for automatic lock expiration
- Change Streams for real-time seat availability
- 10-minute lock duration with automatic release

**Secure Authentication**:

- JWT token-based authentication (30-minute access, 30-day refresh)
- OAuth2 integration for Google sign-in
- Bcrypt password hashing with salt rounds
- Account lockout protection after failed attempts

**Hybrid Guest & User System**:

- Book as guest without registration
- Register for enhanced features and benefits
- Seamless promotion system for registered users
- Complete booking management for all users

**Intelligent Analytics**:

- Popular route tracking
- Booking trend analysis
- Operator performance metrics
- User behavior insights

### Comprehensive Features

**For Travelers**:

- Search and compare trips from multiple operators
- Real-time seat availability and pricing
- Flexible payment options (PayOS, cards, e-wallets, bank transfer)
- Promotion codes and discounts
- Trip reminders (24 hours and 2 hours before departure)
- Booking history and management
- Review and rating system
- Customer support via email and phone

**For Operators**:

- Trip and route management
- Real-time booking notifications
- Revenue and analytics dashboards
- Customer feedback and reviews
- Performance tracking
- Promotion campaign support

## Our Network

### Coverage

We connect major cities and destinations across Vietnam:

**Major Cities**:

- Hanoi (Ha Noi) - The capital city
- Ho Chi Minh City (Saigon) - Economic hub
- Da Nang - Central coast gateway
- Can Tho - Mekong Delta center

**Popular Tourist Destinations**:

- Da Lat - Mountain resort city
- Nha Trang - Beach paradise
- Hue - Ancient imperial capital
- Hoi An - Historic town
- Vung Tau - Coastal getaway
- Hai Phong - Northern port city

**Growing Network**: We continuously add new routes and destinations based on traveler demand.

### Partner Operators

We collaborate with Vietnam's leading bus operators who meet our stringent quality standards:

**Selection Criteria**:

- Valid operating licenses and insurance
- Fleet safety and maintenance standards
- Professional driver certifications
- Customer service excellence
- Positive safety records
- Modern amenities and comfort

**Operator Benefits**:

- Access to digital distribution channel
- Real-time booking management
- Marketing and promotional support
- Performance analytics
- Customer feedback insights
- Revenue optimization tools

## Our Technology Stack

### Backend Architecture

**Framework**: Express.js with TypeScript

- RESTful API design
- Comprehensive input validation (Joi)
- Error handling and logging (Winston, Morgan)
- API versioning (/api/v1)

**Database**: MongoDB

- Document-based data model
- Mongoose ODM with TypeScript
- Efficient indexing and queries
- Change Streams for real-time updates
- TTL indexes for seat lock expiration

**Authentication**:

- Passport.js strategies (JWT, Local, Google OAuth)
- Dual token system (access + refresh tokens)
- Role-based access control (RBAC)
- Account security features (lockout, password reset)

**Real-Time Communication**:

- Socket.IO for WebSocket connections
- Room-based seat lock broadcasting
- Event-driven architecture
- Automatic cleanup on disconnection

**Payment Integration**:

- PayOS payment gateway
- Webhook-based confirmation
- Secure transaction processing
- Multiple payment method support

**Email System**:

- Nodemailer with SMTP
- Transactional emails (confirmations, reminders)
- Email queue management
- Template-based emails

### Frontend Architecture

**Framework**: Next.js 15 with App Router

- Server-side rendering (SSR)
- Static site generation (SSG)
- TypeScript for type safety
- Modern React patterns

**State Management**:

- Redux Toolkit for global state
- RTK Query for API integration
- Optimistic updates
- Efficient caching

**UI Framework**: Shadcn UI

- Radix UI primitives
- Tailwind CSS styling
- Accessible components
- Consistent design system

**Real-Time Features**:

- Socket.IO client integration
- Live seat availability updates
- Automatic UI synchronization
- Connection management

### Infrastructure

**Deployment**:

- Node.js runtime
- PM2 process manager (cluster mode)
- Environment-based configuration
- Continuous deployment pipelines

**Security**:

- CORS configuration
- CSRF protection
- Rate limiting
- SQL injection prevention
- XSS protection
- Secure headers (Helmet)

**Monitoring**:

- Application logging
- Error tracking
- Performance monitoring
- Uptime tracking

## Our Commitment

### Quality Standards

**Platform Reliability**:

- 99.9% uptime target
- Regular maintenance windows
- Proactive monitoring
- Rapid incident response

**Security First**:

- Regular security audits
- Vulnerability assessments
- Data encryption (in transit and at rest)
- Compliance with data protection regulations

**Customer Support**:

- 24/7 email support (talenthive.website@gmail.com)
- Phone support: 0762685089
- Response within 24 hours for general inquiries
- Priority handling for urgent issues

### Continuous Improvement

We constantly evolve based on user feedback:

- Regular feature updates
- Performance optimizations
- UI/UX enhancements
- New route additions
- Operator network expansion

## Values We Live By

### Customer Focus

Your satisfaction drives everything we do:

- User-friendly interface
- Transparent pricing
- Clear cancellation policies
- Responsive support
- Continuous feedback integration

### Trust & Transparency

We build trust through openness:

- Clear terms and policies
- Upfront pricing (no hidden fees)
- Honest operator ratings and reviews
- Secure and transparent payment processing
- Privacy-first data handling

### Innovation

We embrace technology to enhance travel:

- Real-time seat locking system
- Seamless payment integration
- Smart search and filtering
- Automated reminders
- Data-driven insights

### Partnership

We grow with our operators:

- Fair commission structure
- Technology enablement
- Marketing support
- Mutual success orientation
- Long-term relationships

## Achievements & Milestones

**Platform Stats** (as of January 2026):

- Multiple verified bus operators
- Routes covering major Vietnam cities
- Thousands of trips scheduled daily
- Real-time seat availability across entire fleet
- 99.5% booking success rate
- Average customer rating: 4.5/5 stars

**Technology Milestones**:

- ✅ Real-time seat locking with Socket.IO
- ✅ Hybrid guest and registered user system
- ✅ PayOS payment integration
- ✅ Automated email notifications
- ✅ Comprehensive review system
- ✅ Promotion and discount engine
- 🚀 Mobile app (coming soon)
- 🚀 AI-powered chatbot (in development)
- 🚀 Loyalty rewards program (planned)

## Data & Analytics

### Route Intelligence

We analyze travel patterns to:

- Identify popular routes
- Optimize operator schedules
- Suggest new destinations
- Forecast demand trends
- Improve pricing strategies

### Customer Insights

Understanding traveler behavior helps us:

- Personalize recommendations
- Improve search experience
- Optimize booking flow
- Reduce friction points
- Enhance overall satisfaction

### Operator Performance

We track metrics that matter:

- On-time performance
- Customer satisfaction scores
- Booking conversion rates
- Revenue per trip
- Fleet utilization

## Privacy & Data Protection

We take data privacy seriously:

**Data Collection**:

- Only collect necessary information
- Clear consent mechanisms
- Transparent privacy policy
- User control over data

**Data Security**:

- Encryption at rest and in transit
- Access controls and audit logs
- Regular security assessments
- Incident response procedures

**Data Rights**:

- Access your data anytime
- Request corrections or deletion
- Export your information
- Opt-out of marketing communications

See our [Privacy Policy](/privacy) for complete details.

## Sustainability Commitment

**Environmental Responsibility**:

- Promoting bus travel reduces carbon footprint vs. individual cars
- Partner with operators using eco-friendly vehicles
- Paperless ticketing reduces waste
- Digital platform minimizes physical infrastructure

**Social Impact**:

- Connecting communities across Vietnam
- Supporting local bus operators
- Creating employment opportunities
- Improving accessibility to transportation

## Future Vision

### Short-Term Goals (2026)

- Launch native mobile apps (iOS & Android)
- Expand to 50+ partner operators
- Introduce AI-powered travel assistant chatbot
- Add live chat customer support
- Launch loyalty rewards program
- Support multi-language interface

### Long-Term Vision (2027+)

- Become Vietnam's #1 bus booking platform
- Expand to international routes (ASEAN region)
- Integrate with other transportation modes (trains, flights)
- Develop predictive analytics for travel planning
- Create ecosystem of travel services
- Carbon offset program for travelers

## Join Us

### For Travelers

Experience the future of bus travel:

- [Sign Up](/auth/register) for an account
- [Search Trips](/#search) and start booking
- Share feedback to help us improve
- Follow us on social media for updates

### For Bus Operators

Partner with us to grow your business:

- Email: talenthive.website@gmail.com
- Phone: 0762685089
- Gain access to digital booking channels
- Leverage our technology platform
- Reach more customers

### Careers

Interested in joining our team?

- Email your resume to: talenthive.website@gmail.com
- We're always looking for talented developers, designers, and customer support specialists

## Contact Us

**General Inquiries**:  
Email: talenthive.website@gmail.com  
Phone: 0762685089

**Customer Support**:  
Available 24/7 for booking assistance

**Business Partnerships**:  
Email: talenthive.website@gmail.com

**Office Location**:  
Ho Chi Minh City, Vietnam

---

## Follow Our Journey

Stay updated with latest news, features, and promotions:

- **Facebook**: [facebook.com/busticket](#)
- **Twitter**: [twitter.com/busticket](#)
- **Instagram**: [instagram.com/busticket](#)
- **Email Newsletter**: Subscribe in your account settings

---

**Thank you for choosing BusTicket. We're committed to making your bus travel experience exceptional!**

Last Updated: January 3, 2026

For more information, visit our [Help Center](/help) or [FAQ](/faq).
