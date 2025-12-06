# Bus Ticket Booking System - Frontend

Next.js App Router application with Redux Toolkit, RTK Query, TailwindCSS, and Shadcn UI.

## Project Structure

```
src/
├── app/                      # Next.js App Router (routing only)
│   ├── layout.tsx           # Root layout with Redux Provider
│   ├── page.tsx             # Landing page
│   ├── providers.tsx        # Client-side Redux Provider
│   └── globals.css          # Global styles
├── containers/              # Page-based component organization
│   ├── landing-page/        # Landing page components
│   ├── trip-search-results/ # Search results components
│   ├── seat-selection/      # Seat selection components
│   ├── checkout-page/       # Checkout flow components
│   ├── user-dashboard/      # User dashboard components
│   ├── admin-dashboard/     # Admin panel components
│   └── auth/               # Authentication components
└── lib/
    ├── store.ts            # Redux store configuration
    ├── hooks.ts            # Typed Redux hooks
    ├── utils.ts            # Shadcn utilities
    ├── types/              # TypeScript type definitions
    │   └── index.ts
    └── store/
        ├── features/       # Redux slices by feature
        │   ├── auth/
        │   ├── booking/
        │   ├── trip/
        │   ├── bus/
        │   └── route/
        └── services/
            └── api.ts      # RTK Query API definitions
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: TailwindCSS v4 + Shadcn UI
- **Icons**: Lucide React

## Redux Architecture

### State Management

- **Feature-based slices**: Each feature (auth, booking, trip, bus, route) has its own slice
- **RTK Query**: API calls with automatic caching, loading states, and refetching

### Available Slices

1. **auth**: User authentication, token management
2. **booking**: Booking flow (seat selection, passenger info, payment)
3. **trip**: Trip search, filters, sorting
4. **bus**: Bus management (admin)
5. **route**: Route management (admin)

### RTK Query Endpoints

- `/auth` - Login, register, logout, password reset
- `/users` - User profile management
- `/trips` - Search and view trips
- `/bookings` - Create, view, update, cancel bookings
- `/buses` - CRUD operations (admin)
- `/routes` - CRUD operations (admin)

## Container Pattern

Each page has its own folder in `containers/` with:

- Page-specific components
- Custom hooks
- Type definitions
- Utility functions

Components are organized by page rather than by type for better scalability.

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_APP_NAME=Bus Ticket Booking System
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

### Using Redux

```typescript
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials } from '@/lib/store/features/auth/authSlice';

// In component
const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

### Using RTK Query

```typescript
import { useLoginMutation } from '@/lib/store/services/api';

// In component
const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async () => {
  const result = await login({ email, password }).unwrap();
  dispatch(setCredentials(result));
};
```

### Adding Shadcn Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
```

## Next Steps

1. Create placeholder components in containers/
2. Implement authentication flow
3. Build trip search and booking flow
4. Add admin dashboard features
5. Implement protected routes with middleware
6. Add error handling and loading states
7. Create reusable UI components

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Shadcn UI](https://ui.shadcn.com/)
  Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
