# Bus ticket booking system - Project timeline and milestones

## Project Overview

The Bus ticket booking system is a web-based platform for intercity bus ticketing in Vietnam. The project aims to achieve both MVP functionality (Criteria 1: 8.5/10.0) and advanced microservices architecture (Criteria 2: +2.5/10.0) for a total possible score of 11.0/10.0.

**Start Date**: November 24, 2025
**Duration**: 5 weeks
**End Date**: December 29, 2025

Any estimation time below is for suggestion only, it can be changed based on your team's technical skills.

---

# WEEK 1 — Foundation and setup

**Goal:**
Establish core infrastructure, database design, and authentication systems for both user and admin portals.

**Tasks**

### System & Infrastructure

- **Initialize repository with SPA framework for client side and HTTP server as server side** _(~2 hours)_
  - Set up project structure with chosen frontend framework (React/Vue/Angular) and backend framework (Node.js/Express, NestJS, etc.)
    > **Team member:** Full-stack developer

- **Configure PostgreSQL database with initial schema** _(~1 hour)_
  - Install PostgreSQL, create database, design initial tables for users, routes, trips, bookings
    > **Team member:** Backend developer

- **Setup Redis for caching and session management (Optional)** _(~1 hour)_
  - Install and configure Redis server for session storage and caching frequently accessed data
    > **Team member:** Backend developer

- **Setup CI/CD pipeline with GitHub Actions (Optional)** _(~1 hour)_
  - Configure automated testing, building, and deployment workflows
    > **Team member:** DevOps engineer

- **Configure ESLint, Prettier, Husky for developing tools** _(~2 hours)_
  - Set up code formatting, linting rules, and pre-commit hooks for code quality
    > **Team member:** Full-stack developer

- **Create project documentation structure** _(~30 minutes)_
  - Set up README, API docs template, and development guidelines
    > **Team member:** Full-stack developer

### System & Infrastructure / Auth

- **Complete user registration with email verification** _(~2 hours)_
  - Create registration form, email verification flow, and user account activation process
    > **Team member:** Backend developer

- **Implement JWT-based authentication system** _(~1 hour)_
  - Set up JWT token generation, validation, and middleware for protected routes
    > **Team member:** Backend developer

- **Implement admin authentication and authorization** _(~1 hour)_
  - Create role-based access control system to distinguish admin and regular users
    > **Team member:** Backend developer

- **Setup Google OAuth integration** _(~2 hours)_
  - Configure Google OAuth 2.0 for social login functionality
    > **Team member:** Full-stack developer

- **Create password reset functionality** _(~1 hour)_
  - Build forgot password flow with email-based reset tokens
    > **Team member:** Backend developer

### Admin Portal

- **Create basic admin dashboard layout** _(~5 hours)_
  - Design and implement admin interface with navigation, overview cards, and basic CRUD operations
    > **Team member:** Frontend developer

**Total estimation time spent**: ~19 hours 30 minutes

---

# WEEK 2 — Trip management and search

**Goal:**
Implement core trip management features for admins and search functionality for users to enable the primary discovery flow.

**Tasks**

### Admin Portal

- **Create trip scheduling interface for admins** _(~3 hours)_
  - Build admin interface to create, edit, and manage trip schedules with date/time selection
    > **Team member:** Frontend developer

- **Create bus assignment and scheduling logic for admins** _(~2 hours)_
  - Implement backend logic to assign buses to routes and prevent scheduling conflicts
    > **Team member:** Backend developer

- **Implement route configuration with pickup/dropoff points** _(~2 hours)_
  - Create system to define routes with multiple pickup and dropoff locations
    > **Team member:** Backend developer

- **Design and implement seat map configuration tool** _(~4 hours)_
  - Build visual tool for admins to configure bus seat layouts and pricing
    > **Team member:** Full-stack developer

### User Portal / Search at Homepage

- **Create search interface with autocomplete for cities** _(~4 hours)_
  - Build user-friendly search form with city autocomplete and date picker
    > **Team member:** Frontend developer

### User Portal / Search result page

- **Develop trip search API with filtering capabilities** _(~3 hours)_
  - Create REST API endpoints for searching trips by origin, destination, date with filters
    > **Team member:** Backend developer

- **Implement advanced filtering (time, price, bus type, amenities)** _(~4 hours)_
  - Add filter options for departure time, price range, bus types, and amenities
    > **Team member:** Frontend developer

- **Develop trip search results interface** _(~5 hours)_
  - Create results page showing trip cards with filtering, sorting, and pagination
    > **Team member:** Frontend developer

- **Add search result sorting and pagination** _(~3 hours)_
  - Implement sorting by price, time, duration and paginate results for performance
    > **Team member:** Backend developer

- **Implement trip details page** _(~4 hours)_
  - Build detailed trip view with route info, amenities, policies, and booking button
    > **Team member:** Frontend developer

**Total estimation time spent**: ~34 hours

---

# WEEK 3 — Booking system and seat selection

**Goal:**
Build the complete booking flow including seat selection, passenger information, and ticket generation.

**Tasks**

### User Portal / Seat Selection

- **Create interactive seat map component** _(~6 hours)_
  - Build visual seat map with clickable seats, different seat types, and status indicators
    > **Team member:** Frontend developer

- **Implement seat locking mechanism with Redis** _(~4 hours)_
  - Create temporary seat reservation system to prevent double bookings during checkout
    > **Team member:** Backend developer

- **Develop real-time seat availability updates** _(~3 hours)_
  - Implement WebSocket or polling to show real-time seat status changes
    > **Team member:** Full-stack developer

- **Create seat selection validation logic** _(~2 hours)_
  - Add validation to prevent selecting unavailable seats and enforce seat limits
    > **Team member:** Backend developer

### User Portal / Booking Flow

- **Build passenger information collection forms** _(~3 hours)_
  - Create forms to collect passenger details (name, ID, phone) for each selected seat
    > **Team member:** Frontend developer

- **Implement booking creation and management** _(~6 hours)_
  - Build backend API to create bookings, manage booking states, and handle expiration
    > **Team member:** Backend developer

- **Create booking summary and review interface** _(~3 hours)_
  - Design booking review page showing trip details, passengers, and total cost
    > **Team member:** Frontend developer

- **Develop booking history and management dashboard** _(~4 hours)_
  - Build user dashboard to view, modify, and cancel existing bookings
    > **Team member:** Full-stack developer

### User Portal / Guest Services

- **Implement guest checkout flow without registration** _(~3 hours)_
  - Allow users to book tickets without creating an account, collecting minimal required info
    > **Team member:** Full-stack developer

- **Create guest booking lookup system** _(~2 hours)_
  - Build system for guests to retrieve bookings using reference number and email
    > **Team member:** Backend developer

- **Setup booking reference generation** _(~1 hour)_
  - Create unique, user-friendly booking reference number generation system
    > **Team member:** Backend developer

### User Portal / Ticketing

- **Implement PDF e-ticket generation with QR codes** _(~4 hours)_
  - Create PDF generation system with booking details and scannable QR codes
    > **Team member:** Backend developer

- **Create e-ticket download and email delivery** _(~2 hours)_
  - Implement download functionality and automatic email delivery of e-tickets
    > **Team member:** Backend developer

- **Design e-ticket template with branding** _(~1 hour)_
  - Design professional e-ticket layout with company branding and essential information
    > **Team member:** Frontend developer

**Total estimation time spent**: ~44 hours

---

# WEEK 4 — Payment integration and notifications

**Goal:**
Integrate payments, notifications, and post-booking management to complete the transaction lifecycle.

**Tasks**

### User Portal / Payments

- **Integrate PayOS payment gateway** _(~3 hours)_
  - Set up PayOS API integration for processing credit card and digital wallet payments
    > **Team member:** Backend developer

- **Implement payment webhook handling** _(~3 hours)_
  - Create webhook endpoints to receive payment status updates from payment gateways
    > **Team member:** Backend developer

- **Create payment confirmation and failure flows** _(~2 hours)_
  - Build user interfaces for successful payments and error handling for failed payments
    > **Team member:** Frontend developer

### User Portal / Notifications

- **Setup email service** _(~1 hour)_
  - Configure email service provider (SendGrid/AWS SES) for sending transactional emails
    > **Team member:** Backend developer

- **Create email templates for booking confirmations** _(~2 hours)_
  - Design and implement HTML email templates for booking confirmations and receipts
    > **Team member:** Frontend developer

- **Implement SMS notifications (Optional)** _(~2 hours)_
  - Set up SMS service (Twilio) for sending booking confirmations and reminders
    > **Team member:** Backend developer

- **Setup trip reminder notifications** _(~2 hours)_
  - Create scheduled job system to send reminder emails/SMS before trip departure
    > **Team member:** Backend developer

- **Create notification preferences management** _(~2 hours)_
  - Build user interface to manage email and SMS notification preferences
    > **Team member:** Frontend developer

### User Portal / Management

- **Implement booking cancellation with refund processing** _(~4 hours)_
  - Build cancellation system with refund calculation based on cancellation policies
    > **Team member:** Backend developer

- **Create booking modification functionality** _(~4 hours)_
  - Allow users to modify passenger details and change seats (if available)
    > **Team member:** Full-stack developer

- **Setup automated booking expiration** _(~1 hour)_
  - Implement background job to automatically cancel unpaid bookings after timeout
    > **Team member:** Backend developer

### Admin Portal

- **Create revenue analytics dashboard** _(~3 hours)_
  - Build admin dashboard showing revenue metrics, charts, and financial reports
    > **Team member:** Frontend developer

- **Implement booking analytics and reporting** _(~2 hours)_
  - Create analytics for booking trends, popular routes, and conversion rates
    > **Team member:** Backend developer

### System & Infrastructure

- **Setup real-time monitoring dashboard** _(~2 hours)_
  - Implement system health monitoring with key performance indicators
    > **Team member:** DevOps engineer

**Total estimation time spent**: ~40 hours

---

# WEEK 5 — Final features and project wrap-up

**Goal:**
Implement advanced features, optimize performance, and deploy the system to production.

**Tasks**

### User Portal / AI Assistant

- **Setup OpenAI API integration** _(~1 hour)_
  - Configure OpenAI API credentials and create service layer for AI interactions
    > **Team member:** Backend developer

- **Create chatbot interface component** _(~2 hours)_
  - Build chat widget with message history, typing indicators, and responsive design
    > **Team member:** Frontend developer

- **Implement natural language trip search** _(~3 hours)_
  - Create AI prompts to understand user queries and convert to search parameters
    > **Team member:** Full-stack developer

- **Enable booking through chatbot** _(~3 hours)_
  - Allow users to complete entire booking process through conversational interface
    > **Team member:** Full-stack developer

- **Create FAQ handling system** _(~2 hours)_
  - Train chatbot to answer common questions about policies, routes, and booking process
    > **Team member:** Backend developer

### User Portal / Feedback

- **Create user review and rating interface** _(~2 hours)_
  - Build frontend components for rating trips and displaying reviews to other users
    > **Team member:** Frontend developer

- **Implement feedback and rating system** _(~2 hours)_
  - Create backend system for users to rate trips and leave feedback after completion
    > **Team member:** Backend developer

### Admin Portal

- **Setup review moderation system** _(~1 hour)_
  - Implement basic content filtering and admin tools to moderate inappropriate reviews
    > **Team member:** Backend developer

### System & Infrastructure / Advanced

- **Implement API gateway with Kong/Nginx** _(~2 hours)_
  - Set up API gateway for routing, rate limiting, and load balancing across microservices
    > **Team member:** DevOps engineer

- **Setup service discovery with Consul/Kubernetes** _(~2 hours)_
  - Configure service registry and discovery for dynamic service communication
    > **Team member:** DevOps engineer

- **Implement saga pattern for distributed transactions** _(~3 hours)_
  - Create saga orchestrator to manage distributed transactions across booking and payment services
    > **Team member:** Backend developer

- **Create concurrent booking handling system** _(~2 hours)_
  - Implement distributed locking and conflict resolution for simultaneous booking attempts
    > **Team member:** Backend developer

- **Setup multiple authentication methods** _(~1 hour)_
  - Configure OAuth providers (Google, Facebook) and phone number authentication
    > **Team member:** Backend developer

### System & Infrastructure / QA

- **Write comprehensive unit tests** _(~3 hours)_
  - Create unit tests for critical business logic with minimum 80% code coverage
    > **Team member:** Full-stack developer

- **Implement integration testing** _(~2 hours)_
  - Test API endpoints and database interactions with automated test suite
    > **Team member:** Backend developer

- **Conduct end-to-end testing** _(~2 hours)_
  - Test complete user workflows from search to booking completion using automation tools
    > **Team member:** Frontend developer

- **Performance testing and optimization** _(~2 hours)_
  - Load test the application and optimize bottlenecks for concurrent users
    > **Team member:** DevOps engineer

- **Security testing and vulnerability assessment** _(~1 hour)_
  - Run security scans and test for common vulnerabilities (SQL injection, XSS, etc.)
    > **Team member:** Backend developer

### System & Infrastructure / Deployment

- **Setup production environment on cloud** _(~2 hours)_
  - Configure cloud infrastructure (AWS/GCP/Azure) with proper security and scaling settings
    > **Team member:** DevOps engineer

- **Configure monitoring and logging** _(~1 hour)_
  - Set up application monitoring, error tracking, and centralized logging system
    > **Team member:** DevOps engineer

- **Implement backup and disaster recovery** _(~1 hour)_
  - Configure automated database backups and disaster recovery procedures
    > **Team member:** DevOps engineer

- **Final deployment and go-live** _(~1 hour)_
  - Deploy application to production, perform final checks, and announce go-live
    > **Team member:** Full-stack developer

**Total estimation time spent**: ~41 hours

---

## Technical requirements checklist

### Criteria 1 (8.5/10.0) - MVP features

- [ ] Fully functional bus ticket booking web application
- [ ] Integrated payment functionality (MoMo, Zalopay)
- [ ] Guest checkout support
- [ ] AI chatbot integration for booking assistance
- [ ] Public deployment

### Criteria 2 (+2.5/10.0) - Advanced features

- [ ] Microservices architecture implementation
- [ ] CI/CD pipeline with automated testing
- [ ] Concurrent booking handling with seat locking
- [ ] Saga pattern for distributed transaction management
- [ ] Multiple authentication methods (email, OAuth, phone)

---

## Risk mitigation strategies

### Technical risks

- **Payment gateway integration delays**: Start integration early in Week 4, have fallback options
- **Microservices complexity**: Begin with monolithic approach, refactor to microservices
- **Performance issues**: Implement caching and database optimization from Week 2

### Timeline risks

- **Feature scope creep**: Prioritize MVP features first, advanced features second
- **Testing time**: Allocate dedicated testing time in Week 5
- **Deployment issues**: Setup staging environment early for testing

### Team coordination

- **Daily standups**: 15-minute daily sync meetings
- **Weekly reviews**: End-of-week progress review and planning
- **Code reviews**: Mandatory peer review for all code changes

---

## Success metrics

### Week 1 success criteria

- All development environments setup and functional
- Authentication system working with user registration/login
- Basic admin interface operational
- CI/CD pipeline configured

### Week 2 success criteria

- Trip search functionality working with filters
- Admin can create and manage routes/buses
- Database performance optimized for search queries

### Week 3 success criteria

- Complete booking flow functional
- Seat selection with real-time updates working
- E-ticket generation and delivery operational
- Guest checkout flow completed

### Week 4 success criteria

- All payment gateways integrated and tested
- Notification system sending emails and SMS
- Booking management (cancel/modify) working
- Admin analytics dashboard functional

### Week 5 success criteria

- AI chatbot operational for search and booking
- Microservices architecture implemented
- All testing completed with >90% pass rate
- Production deployment successful

---

## Communication plan (suggestion)

### Internal communication

- **Daily standups**: 9:00 AM (15 minutes)
- **Weekly planning**: Monday 2:00 PM (1 hour)
- **Sprint reviews**: Friday 4:00 PM (1 hour)
- **Technical discussions**: As needed via Slack/Discord/Google Meet

### Documentation

- API documentation with Swagger/OpenAPI
- User guides for admin and end-users
- Technical architecture documentation
- Deployment and maintenance guides
