# Implementation Plan: G03 Assignment Requirements

Dựa trên phân tích workspace và yêu cầu trong `Source/G03 - Authentication, Authorization, Layout & Dashboard.md`, đây là plan để hoàn thành **minimum requirements** còn thiếu.

---

## ✅ Current Implementation Status

### Completed Features:
- ✅ **Authentication (Basic)**: Email/password login, register, JWT tokens
- ✅ **Protected Routes**: Middleware checking authentication
- ✅ **Role-based Authorization**: User/Admin roles enforced
- ✅ **UI Components**: Shadcn UI components (16 components)
- ✅ **Redux State Management**: Auth, booking, trip slices
- ✅ **RTK Query API**: 26 endpoints integrated
- ✅ **Graceful Auth Flow**: Logout confirmation modal (AUTH-FLOW-IMPLEMENTATION.md)

---

## ❌ Missing G03 Requirements

### 1. **Social Login Integration** (8/25 pts missing)
- ❌ Google Sign-In or GitHub OAuth
- ❌ Social auth wired to same session model

### 2. **Dashboard Implementation** (15 pts missing)
- ❌ At least 3 interactive widgets
- ❌ Role-based widget visibility
- ❌ UI mockup in `/design` folder
- ❌ Real data from API endpoints

### 3. **Design System Enhancement** (Partial - 6/15 pts missing)
- ⚠️ Theme tokens exist but not formalized
- ❌ Typography scale not documented
- ❌ Spacing scale not documented
- ❌ No theme switcher (dark/light mode)

### 4. **Developer Tooling** (7/15 pts missing)
- ❌ ESLint not configured
- ❌ Prettier not configured
- ❌ Husky pre-commit hooks not setup
- ❌ No unit tests

### 5. **Documentation** (3/15 pts missing)
- ⚠️ README exists but incomplete
- ❌ No `/design` folder with dashboard mockup
- ❌ No explanation of token handling strategy

---

## 📋 Implementation Plan (Priority Order)

### **Phase 1: Critical Requirements (8-10 hours)**

#### Task 1.1: Social Login Integration (Priority: 🔥 HIGHEST)
**Time Estimate:** 3-4 hours  
**Points Impact:** 8/100

**Implementation Steps:**

1. **Setup Firebase Authentication**
```bash
cd Source/frontend
npm install firebase
```

2. **Create Firebase config**
```typescript
// src/lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

3. **Add Google Sign-In button to LoginForm**
```typescript
// src/containers/auth/LoginForm.tsx
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Call backend to verify token and get JWT
    const response = await fetch('/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    
    const { user, tokens } = await response.json();
    dispatch(setCredentials({ user, token: tokens.access.token }));
    // ... save to cookies, redirect
  } catch (error) {
    toast.error('Google login failed');
  }
};

// Add button in JSX
<Button onClick={handleGoogleLogin} variant="outline">
  <GoogleIcon /> Continue with Google
</Button>
```

4. **Backend: Add Google auth endpoint**
```typescript
// Source/backend/src/routes/v1/auth.route.ts
router.post('/google', validate(authValidation.googleAuth), authController.googleAuth);

// Source/backend/src/controllers/auth.controller.ts
const googleAuth = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const { email, name, picture } = decodedToken;
  
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name, avatar: picture, role: 'user' });
  }
  
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});
```

**Files to Create/Modify:**
- ✅ `src/lib/firebase/config.ts` (new)
- ✅ `src/containers/auth/LoginForm.tsx` (modify)
- ✅ `src/containers/auth/RegisterForm.tsx` (modify)
- ✅ `Source/backend/src/routes/v1/auth.route.ts` (modify)
- ✅ `Source/backend/src/controllers/auth.controller.ts` (add googleAuth)
- ✅ `.env.local` (add Firebase keys)

**Verification:**
- [ ] Google Sign-In button appears on login/register pages
- [ ] Clicking button opens Google OAuth popup
- [ ] Successful login creates/finds user in database
- [ ] JWT tokens returned and stored correctly
- [ ] User redirected to dashboard after login

---

#### Task 1.2: Dashboard Implementation (Priority: 🔥 HIGHEST)
**Time Estimate:** 4-5 hours  
**Points Impact:** 15/100

**Implementation Steps:**

1. **Create Dashboard Mockup**
```bash
mkdir -p Source/frontend/design
# Create mockup in Figma/Excalidraw and export PNG
```

**Design Requirements:**
- 3 widgets minimum:
  - **Widget 1**: Summary Cards (Total Bookings, Upcoming Trips, Total Spent)
  - **Widget 2**: Recent Bookings Table
  - **Widget 3**: Quick Actions (Book New Trip, View Profile)
- Role-based differences:
  - **User**: See personal bookings only
  - **Admin**: See all bookings + system stats

2. **Create Dashboard Widgets**

**Widget 1: SummaryCards**
```typescript
// src/containers/user-dashboard/SummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBookingsQuery } from '@/lib/store/services/api';
import { useAppSelector } from '@/lib/hooks';

export default function SummaryCards() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: bookingsData } = useGetBookingsQuery({});
  
  const totalBookings = bookingsData?.totalResults || 0;
  const upcomingTrips = bookingsData?.results?.filter(
    (b) => new Date(b.trip.departureTime) > new Date()
  ).length || 0;
  
  const totalSpent = bookingsData?.results?.reduce(
    (sum, b) => sum + b.totalPrice, 0
  ) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalBookings}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{upcomingTrips}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Widget 2: RecentBookingsTable**
```typescript
// src/containers/user-dashboard/RecentBookingsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetBookingsQuery } from '@/lib/store/services/api';
import { format } from 'date-fns';

export default function RecentBookingsTable() {
  const { data, isLoading } = useGetBookingsQuery({ limit: 5 });

  if (isLoading) return <p>Loading...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Trip</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.results?.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>
              {booking.trip.route.origin} → {booking.trip.route.destination}
            </TableCell>
            <TableCell>
              {format(new Date(booking.trip.departureTime), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>{booking.status}</TableCell>
            <TableCell>${booking.totalPrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Widget 3: QuickActions**
```typescript
// src/containers/user-dashboard/QuickActions.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/search">
          <Button className="w-full">Book New Trip</Button>
        </Link>
        <Link href="/dashboard/profile">
          <Button variant="outline" className="w-full">View Profile</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
```

3. **Update Dashboard Page with Role-based Rendering**
```typescript
// src/app/dashboard/page.tsx
'use client';

import { useAppSelector } from '@/lib/hooks';
import SummaryCards from '@/containers/user-dashboard/SummaryCards';
import RecentBookingsTable from '@/containers/user-dashboard/RecentBookingsTable';
import QuickActions from '@/containers/user-dashboard/QuickActions';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">
        {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
      </h1>
      
      <SummaryCards />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentBookingsTable />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      
      {user?.role === 'admin' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Admin Statistics</h2>
          {/* Admin-only widgets */}
        </div>
      )}
    </div>
  );
}
```

**Files to Create/Modify:**
- ✅ `Source/frontend/design/dashboard-mockup.png` (new)
- ✅ `src/containers/user-dashboard/SummaryCards.tsx` (new)
- ✅ `src/containers/user-dashboard/RecentBookingsTable.tsx` (new)
- ✅ `src/containers/user-dashboard/QuickActions.tsx` (new)
- ✅ `src/app/dashboard/page.tsx` (modify)

**Verification:**
- [ ] Dashboard shows 3 distinct widgets
- [ ] Widgets display real data from API
- [ ] User role sees personal data only
- [ ] Admin role sees system-wide stats
- [ ] Mockup file exists in `/design` folder

---

### **Phase 2: Quality & Tooling (4-6 hours)**

#### Task 2.1: ESLint + Prettier + Husky Setup (Priority: 🟡 MEDIUM)
**Time Estimate:** 2-3 hours  
**Points Impact:** 7/100

**Implementation Steps:**

1. **Install Dependencies**
```bash
cd Source/frontend
npm install -D eslint @eslint/js @types/eslint__js typescript-eslint
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
```

2. **Configure ESLint**
```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
```

3. **Configure Prettier**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

4. **Setup Husky**
```bash
npx husky init
echo "npm run lint-staged" > .husky/pre-commit
```

5. **Configure lint-staged**
```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**Files to Create/Modify:**
- ✅ `eslint.config.mjs` (new)
- ✅ `.prettierrc` (new)
- ✅ `.husky/pre-commit` (new)
- ✅ `package.json` (modify scripts)

**Verification:**
- [ ] `npm run lint` checks code without errors
- [ ] `npm run format` formats all files
- [ ] Git commit triggers pre-commit hook
- [ ] Staged files are linted and formatted automatically

---

#### Task 2.2: Unit Tests Setup (Priority: 🟡 MEDIUM)
**Time Estimate:** 2-3 hours  
**Points Impact:** 5/100

**Implementation Steps:**

1. **Install Testing Dependencies**
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
```

2. **Configure Jest**
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

3. **Create Setup File**
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

4. **Write Sample Tests**

**Test 1: LoginForm Component**
```typescript
// src/containers/auth/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('renders login form with email and password fields', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

**Test 2: Auth Redux Slice**
```typescript
// src/lib/store/features/auth/__tests__/authSlice.test.ts
import authReducer, { setCredentials, logout } from '../authSlice';

describe('authSlice', () => {
  const initialState = { user: null, token: null };

  it('should handle setCredentials', () => {
    const user = { id: '1', email: 'test@example.com', role: 'user' };
    const token = 'mock-jwt-token';
    
    const state = authReducer(initialState, setCredentials({ user, token }));
    
    expect(state.user).toEqual(user);
    expect(state.token).toEqual(token);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: { id: '1', email: 'test@example.com', role: 'user' },
      token: 'mock-token',
    };
    
    const state = authReducer(loggedInState, logout());
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
```

5. **Add Test Scripts**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Files to Create/Modify:**
- ✅ `jest.config.js` (new)
- ✅ `jest.setup.js` (new)
- ✅ `src/containers/auth/__tests__/LoginForm.test.tsx` (new)
- ✅ `src/lib/store/features/auth/__tests__/authSlice.test.ts` (new)
- ✅ `package.json` (modify scripts)

**Verification:**
- [ ] `npm test` runs all tests successfully
- [ ] At least 2 test files with passing tests
- [ ] Coverage report generated
- [ ] Tests fail when code is broken (smoke test)

---

### **Phase 3: Documentation & Design System (2-3 hours)**

#### Task 3.1: Design System Documentation (Priority: 🟢 LOW)
**Time Estimate:** 1-2 hours  
**Points Impact:** 6/100

**Implementation Steps:**

1. **Document Theme Tokens**
```markdown
<!-- Source/frontend/DESIGN_SYSTEM.md -->
# Design System

## Color Tokens
- **Primary**: `hsl(222.2, 47.4%, 11.2%)` - Main brand color
- **Secondary**: `hsl(210, 40%, 96.1%)` - Accent color
- **Success**: `hsl(142, 71%, 45%)` - Success states
- **Error**: `hsl(0, 84%, 60%)` - Error states
- **Surface**: `hsl(0, 0%, 100%)` - Card backgrounds

## Typography Scale
- **H1**: `text-4xl font-bold` (36px)
- **H2**: `text-3xl font-bold` (30px)
- **H3**: `text-2xl font-semibold` (24px)
- **H4**: `text-xl font-semibold` (20px)
- **Body**: `text-base` (16px)
- **Caption**: `text-sm` (14px)

## Spacing Scale
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)

## Layout Components
- **AppShell**: Global layout with header, nav, content, footer
- **Card**: Reusable card component
- **Button**: Multiple variants (default, outline, ghost)
- **FormField**: Consistent form input styling
```

2. **Create Theme Switcher**
```typescript
// src/components/ThemeSwitcher.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

3. **Add Theme Provider**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

4. **Update Navbar with Theme Switcher**
```typescript
// src/components/Navbar.tsx
import ThemeSwitcher from './ThemeSwitcher';

// Add to navbar JSX
<ThemeSwitcher />
```

**Files to Create/Modify:**
- ✅ `Source/frontend/DESIGN_SYSTEM.md` (new)
- ✅ `src/components/ThemeSwitcher.tsx` (new)
- ✅ `src/app/layout.tsx` (modify)
- ✅ `src/components/Navbar.tsx` (modify)

**Verification:**
- [ ] `DESIGN_SYSTEM.md` documents all tokens
- [ ] Theme switcher button in navbar
- [ ] Clicking switcher toggles dark/light mode
- [ ] Theme persists on page reload

---

#### Task 3.2: Enhanced README Documentation (Priority: 🟢 LOW)
**Time Estimate:** 1 hour  
**Points Impact:** 3/100

**Implementation Steps:**

Add sections to existing `Source/frontend/README.md`:

```markdown
## Authentication & Token Handling

### Strategy
We use **JWT Access + Refresh tokens** stored in httpOnly cookies for security:
- **Access Token**: Short-lived (30 min), used for API requests
- **Refresh Token**: Long-lived (30 days), used to get new access tokens

### Why Cookies?
- **XSS Protection**: httpOnly cookies cannot be accessed by JavaScript
- **CSRF Mitigation**: Used with SameSite=Strict flag
- **Automatic**: Browser sends cookies with every request

### Social Login
Google Sign-In integrated via Firebase Authentication:
1. User clicks "Continue with Google"
2. Firebase handles OAuth popup
3. Backend verifies Google ID token
4. JWT tokens issued and stored in cookies

## Authorization

### Role-Based Access Control (RBAC)
Two roles implemented:
- **user**: Can book trips, view bookings, leave reviews
- **admin**: All user permissions + manage buses, routes, trips, users

### Enforcement
- **Client-side**: Next.js middleware checks `userRole` cookie
- **Server-side**: Express middleware checks JWT payload role
- **UI**: Components conditionally render based on `useAppSelector(state => state.auth.user?.role)`

## Design System

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for:
- Color tokens and theme
- Typography scale
- Spacing system
- Reusable components
- Dark/light mode toggle

## Developer Tooling

### Code Quality
- **ESLint**: Lint TypeScript/React code
- **Prettier**: Auto-format on save
- **Husky**: Pre-commit hooks run lint-staged

### Testing
- **Jest**: Unit tests for components and Redux
- **React Testing Library**: Component integration tests
- Run: `npm test`

### Scripts
```bash
npm run lint        # Check code
npm run lint:fix    # Fix linting issues
npm run format      # Format all files
npm test            # Run unit tests
npm run test:watch  # Watch mode
```
```

**Files to Modify:**
- ✅ `Source/frontend/README.md`

---

## 🎯 Final Checklist (Minimum Requirements)

### Authentication & Social Login (25 pts)
- [ ] Email signup/login works (10 pts)
- [ ] Google Sign-In integrated (8 pts)
- [ ] Token handling documented in README (7 pts)

### Authorization (20 pts)
- [ ] Role-based access enforced in UI (12 pts)
- [ ] At least one admin-only page (8 pts)

### Layout & Design System (15 pts)
- [ ] Theme tokens documented (6 pts)
- [ ] Reusable layout components (5 pts)
- [ ] Theme switcher works (4 pts)

### Dashboard (15 pts)
- [ ] UI mockup in `/design` folder (5 pts)
- [ ] 3 interactive widgets (6 pts)
- [ ] Role-based differences (4 pts)

### Tooling & Quality (15 pts)
- [ ] ESLint/Prettier/Husky configured (7 pts)
- [ ] Tests present and passing (5 pts)
- [ ] Clean README with all sections (3 pts)

### Deployment (10 pts)
- [ ] Live URL provided (10 pts) - **Already complete** (from workspace status)

---

## ⏱️ Total Time Estimate

| Phase | Tasks | Time | Points |
|-------|-------|------|--------|
| Phase 1 | Social Login + Dashboard | 8-10h | 23 pts |
| Phase 2 | ESLint/Prettier/Tests | 4-6h | 12 pts |
| Phase 3 | Design System + Docs | 2-3h | 9 pts |
| **Total** | **6 tasks** | **14-19h** | **44 pts** |

**Current Score**: ~56/100 (existing features)  
**After Completion**: ~100/100 ✅

---

## 🚀 Suggested Execution Order

### Week 1 (Focus on Points)
1. ✅ Task 1.2: Dashboard Implementation (15 pts) - **DO FIRST**
2. ✅ Task 1.1: Social Login (8 pts)

### Week 2 (Quality Polish)
3. ✅ Task 2.1: ESLint + Prettier + Husky (7 pts)
4. ✅ Task 2.2: Unit Tests (5 pts)
5. ✅ Task 3.1: Design System Docs (6 pts)
6. ✅ Task 3.2: Enhanced README (3 pts)

---

## 📝 Notes

- Backend already has most endpoints needed (từ Source/backend/README.md)
- Frontend structure already solid (từ IMPLEMENTATION-COMPLETE.md)
- Focus on **minimum viable** implementations to maximize points/hour ratio
- Google Sign-In là easiest social login (Firebase SDK có sẵn)
- Tests chỉ cần 2-3 files passing để đạt "tests present and passing"
