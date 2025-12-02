# Authentication, Authorization, Layout & Dashboard

A full-stack web application demonstrating secure authentication flows, role-based authorization, and a modern design system with an interactive dashboard.

## 🚀 Live Demo

- **Frontend**: https://bus-ticket-booking-system-dun.vercel.app/
- **Backend API**: https://bus-ticket-booking-system-api.onrender.com
- **Backend Health Check**: https://bus-ticket-booking-system-api.onrender.com/health
- **GitLab Repository**: https://gitlab.com/nguyenbaan662004/bus-ticket-booking-system

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication & Authorization](#authentication--authorization)
- [Design System](#design-system)
- [Dashboard](#dashboard)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)

## ✨ Features

### Authentication
- ✅ Email/Password authentication with secure token handling
- ✅ Google OAuth 2.0 social login integration
- ✅ Access & Refresh token model with JWT
- ✅ Protected routes with automatic redirect
- ✅ Token refresh mechanism
- ✅ Secure password hashing with bcrypt

### Authorization
- ✅ Role-based access control (RBAC)
- ✅ Three user roles: `admin`, `editor`, `user`
- ✅ Client-side route guards
- ✅ Server-side middleware protection
- ✅ Conditional UI rendering based on roles

### Design System
- ✅ Global theme with color tokens
- ✅ Typography scale (h1-h6, body, caption)
- ✅ Spacing system
- ✅ Reusable components (AppShell, Card, Button, FormField)
- ✅ Light/Dark theme switcher
- ✅ Responsive design (mobile-first)

### Dashboard
- ✅ Role-based dashboard views
- ✅ Interactive widgets with real-time data
- ✅ Summary cards with statistics
- ✅ Activity feed
- ✅ User management (admin only)

### Developer Experience
- ✅ ESLint for code quality
- ✅ Prettier for code formatting
- ✅ Husky pre-commit hooks
- ✅ TypeScript for type safety
- ✅ Unit tests with Jest
- ✅ Integration tests

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Hooks
- **Routing**: Next.js App Router
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui component library
- **OAuth**: NextAuth.js (Google OAuth)

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local + Google OAuth)
- **Tokens**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: helmet, cors, express-rate-limit

### DevOps & Tooling
- **Linting**: ESLint (per workspace)
- **Formatting**: Prettier (per workspace)
- **Git Hooks**: Husky v9 + lint-staged (root level)
- **Commit Linting**: Commitlint (conventional commits)
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel (Frontend) + Render (Backend)
- **Process Manager**: PM2 (Backend)

## 📁 Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   └── dashboard/
│   │   │       ├── SummaryCards.tsx
│   │   │       ├── ActivityList.tsx
│   │   │       └── UserManagement.tsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── GoogleLogin.tsx
│   │   │   │   └── AuthContext.tsx
│   │   │   └── dashboard/
│   │   │       └── DashboardPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useTheme.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.service.ts
│   │   ├── guards/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── theme/
│   │   │   ├── theme.ts
│   │   │   └── ThemeProvider.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── storage.ts
│   ├── public/
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── passport.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── dashboard.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── dashboard.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── token.service.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   └── types/
│   │       └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── package.json
│   └── tsconfig.json
├── design/
│   ├── dashboard-mockup.png
│   └── wireframes.md
└── README.md
```

## 🏁 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm (v9+)
- MongoDB database (local or MongoDB Atlas)
- Google OAuth 2.0 credentials

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://gitlab.com/nguyenbaan662004/bus-ticket-booking-system.git
cd bus-ticket-booking-system

# 2. Install ALL dependencies (root + frontend + backend)
npm install

# 3. Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both .env files with your configuration

# 4. Run development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs

### Project Structure (Monorepo)

```
project-root/
├── .husky/              # Git hooks (commit-msg, pre-commit)
├── package.json         # Root package (workspaces + husky)
├── commitlint.config.mjs # Commit message rules
├── frontend/            # Next.js app
├── backend/             # Express API
├── docs/                # Documentation
└── README.md
```

### Development Workflow

#### Git Commit Convention

```bash
# Format: type(scope): message

# Examples:
git commit -m "feat(frontend): add login page"
git commit -m "fix(backend): resolve auth token issue"
git commit -m "docs(root): update README"
git commit -m "chore(deps): update dependencies"
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `build`, `ci`

**Scopes:** `frontend`, `backend`, `root`, `deps`, `config`, `docs`

#### Pre-commit Hooks

Husky automatically runs when you commit:
1. **Commitlint** - Validates commit message format
2. **Lint-staged** - Runs ESLint + Prettier on staged files

```bash
# If pre-commit fails, fix issues and retry
npm run lint:fix   # In frontend/ or backend/
git add .
git commit -m "fix(frontend): resolve lint errors"
```

### NPM Scripts

#### Root (project-root/)
```bash
npm install          # Install all dependencies (root + workspaces)
```

#### Frontend (frontend/)
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Check lint errors
npm run lint:fix     # Auto-fix lint errors
npm run format       # Format code (Prettier + ESLint)
npm run test         # Run tests
```

#### Backend (backend/)
```bash
npm run dev          # Start dev server (localhost:4000)
npm run build        # Compile TypeScript
npm run start        # Run production build
npm run lint         # Check lint errors
npm run lint:fix     # Auto-fix lint errors
npm run format       # Format code
npm run test         # Run tests
npm run seed:admin   # Create admin user
npm run seed:data    # Seed sample data
```

### Installation (Detailed)

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bus-booking
# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-booking

# JWT
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# CORS
FRONTEND_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@busbooking.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
```

### Running the Application

#### Development Mode

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

#### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🔐 Authentication & Authorization

### Authentication Flow

This application implements a **dual-token JWT authentication** system:

#### Token Strategy

1. **Access Token**
   - Short-lived (30 minutes)
   - Stored in httpOnly cookie (secure)
   - Used for API requests
   - Contains user ID and role

2. **Refresh Token**
   - Long-lived (30 days)
   - Stored in httpOnly cookie (secure)
   - Used to obtain new access tokens
   - Cannot be accessed by JavaScript (XSS protection)

#### Why This Approach?

**Security Benefits:**
- Both tokens in httpOnly cookies prevent XSS attacks
- Cookies marked as Secure (HTTPS only) and SameSite
- Short access token expiry limits damage from token theft
- CSRF protection with SameSite cookie attribute

**Trade-offs:**
- Cannot access token from JavaScript (limited flexibility)
- Requires proper CORS configuration
- More complex logout implementation (need backend call)

**Alternative Considered:**
- Session-based auth with cookies → Rejected because it's less scalable and harder to use with mobile apps
- Single token in localStorage → Rejected due to XSS vulnerability

### Social Login (Google OAuth 2.0)

**Flow:**
1. User clicks "Sign in with Google"
2. Frontend opens Google consent screen
3. User authorizes and Google returns authorization code
4. Frontend sends code to backend `/api/auth/google`
5. Backend exchanges code for user info
6. Backend creates/finds user and issues tokens
7. User is authenticated

**Setup Required:**
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Copy Client ID and Secret to `.env`

### Authorization (Role-Based Access Control)

**Four Roles:**

| Role | Permissions |
|------|------------|
| `user` | View own dashboard, book tickets, view bookings, write reviews |
| `operator` | Manage own routes, trips, buses, view bookings |
| `admin` | All permissions + user management, operator management, system settings |
| `superadmin` | Full system access + admin management |

**Implementation:**

**Client-side:**
```typescript
// Route protection
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Conditional rendering
{user.role === 'admin' && <DeleteButton />}
```

**Server-side:**
```typescript
// Middleware protection
router.get('/admin/users', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  userController.getAllUsers
);
```

**Why RBAC over Scope-based?**
- Simpler to implement and understand
- Sufficient for most application needs
- Easier to manage in database
- Clear hierarchy of permissions

## 🎨 Design System

### Theme Tokens

**Colors:**
```typescript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  secondary: { /* ... */ },
  surface: { /* ... */ },
  error: { /* ... */ },
  success: { /* ... */ }
}
```

**Typography Scale:**
- `h1`: 2.5rem / 40px
- `h2`: 2rem / 32px
- `h3`: 1.75rem / 28px
- `h4`: 1.5rem / 24px
- `h5`: 1.25rem / 20px
- `h6`: 1rem / 16px
- `body`: 1rem / 16px
- `caption`: 0.875rem / 14px

**Spacing:**
- `xs`: 0.25rem / 4px
- `sm`: 0.5rem / 8px
- `md`: 1rem / 16px
- `lg`: 1.5rem / 24px
- `xl`: 2rem / 32px
- `2xl`: 3rem / 48px

### Reusable Components

See [frontend/src/components/](frontend/src/components/) for implementation.

**Component List:**
- `AppShell` - Main layout wrapper
- `Header` - Top navigation
- `Sidebar` - Side navigation (collapsible)
- `Footer` - Footer content
- `Card` - Content container
- `Button` - Primary action button
- `FormField` - Form input with label and error
- `ThemeToggle` - Light/dark mode switcher

### Theme Switching

Users can toggle between light and dark themes. Preference is saved to `localStorage` and persists across sessions.

## 📊 Dashboard

See mockup in [design/dashboard-mockup.png](design/dashboard-mockup.png).

### Widgets

1. **Summary Cards**
   - Total users count
   - Active sessions
   - System status
   - Recent activity count

2. **Activity List**
   - Recent user actions
   - Timestamps
   - User avatars
   - Action types

3. **User Management** (Admin only)
   - User list with roles
   - Edit/Delete actions
   - Role assignment

### Role-based Differences

| Widget | User | Editor | Admin |
|--------|------|--------|-------|
| Summary Cards | Own stats | Team stats | Global stats |
| Activity List | Own activity | Team activity | All activity |
| User Management | ❌ Hidden | ❌ Hidden | ✅ Visible |

## 📡 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**POST /api/auth/google**
```json
{
  "credential": "google-id-token"
}
```

**POST /api/auth/refresh**
- No body required
- Refresh token sent via cookie

**POST /api/auth/logout**
- Requires authentication

### Dashboard Endpoints

**GET /api/dashboard/stats**
- Requires authentication
- Returns role-specific statistics

**GET /api/dashboard/activities**
- Requires authentication
- Returns activity feed

**GET /api/admin/users** (Admin only)
- Requires admin role
- Returns all users

See [backend/CHATBOT-API.md](backend/CHATBOT-API.md) for complete API documentation.

## 🧪 Testing

### Running Tests

**Frontend:**
```bash
cd frontend
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm run test:coverage   # Coverage report
```

**Backend:**
```bash
cd backend
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm run test:coverage   # Coverage report
```

### Test Coverage

Target: >80% coverage for critical paths

**Areas Covered:**
- Authentication flows
- Authorization middleware
- API endpoints
- React components
- Utility functions

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Backend (Render)

1. Create new Web Service in Render
2. Connect GitLab repository
3. Configure environment variables
4. Add MongoDB database URL (MongoDB Atlas)
5. Deploy

**Environment:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`

## 💡 Design Decisions

### 1. JWT vs Session-based Auth
**Chosen: JWT (Access + Refresh tokens in httpOnly cookies)**

**Reasons:**
- Stateless authentication (scalable)
- Works well with separate frontend/backend
- Easier to implement mobile app later
- Industry standard for SPAs
- HttpOnly cookies provide XSS protection

### 2. RBAC vs Scope-based Authorization
**Chosen: Role-Based Access Control**

**Reasons:**
- Simpler mental model
- Easier to implement and maintain
- Sufficient for most use cases
- Clear permission hierarchy

### 3. Tailwind CSS + shadcn/ui vs CSS-in-JS
**Chosen: Tailwind CSS with shadcn/ui**

**Reasons:**
- Utility-first approach speeds development
- shadcn/ui provides beautiful, accessible components
- Excellent documentation for both
- Built-in responsive design
- Easy to maintain consistent design
- Small production bundle size
- Components are customizable (copy-paste, not npm package)

### 4. TypeScript
**Chosen: TypeScript for both frontend and backend**

**Reasons:**
- Type safety prevents bugs
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### 5. Monorepo vs Separate Repos
**Chosen: Monorepo**

**Reasons:**
- Shared types between frontend/backend
- Easier to keep in sync
- Single deployment pipeline
- Better for learning/demonstration

## 📝 Development Workflow

### Code Quality

**Pre-commit Hooks:**
- ESLint checks
- Prettier formatting
- TypeScript compilation
- Test execution

**Configured with Husky + lint-staged**

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Convention

Following [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 🔄 Next Steps (NEXT_STEPS.md)

See [NEXT_STEPS.md](NEXT_STEPS.md) for planned features and improvements for the final project.

**Planned Features:**
- Email verification
- Password reset flow
- Two-factor authentication
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- User profile management
- Audit logs
- API rate limiting
- Comprehensive E2E tests

## 📄 License

This project is part of a course assignment.

## 👥 Contributors

- Nguyen Ba An - [GitLab Profile](https://gitlab.com/nguyenbaan662004)

## 🙏 Acknowledgments

- Course instructors and TAs
- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Questions or Issues?**
Please open an issue on [GitLab](https://gitlab.com/nguyenbaan662004/bus-ticket-booking-system/-/issues)