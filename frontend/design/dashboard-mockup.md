# Dashboard UI Mockup

## Layout Design

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome back, [User Name]!                                      │
│ Manage your bookings and profile settings                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│  Total Bookings      │  Upcoming Trips      │  Total Spent         │
│                      │                      │                      │
│      12              │        3             │    $847.50           │
│                      │                      │                      │
└──────────────────────┴──────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────┬────────────────────┐
│ Recent Bookings                                 │ Quick Actions      │
│                                                 │                    │
│ Trip            Date        Status     Price    │ ┌────────────────┐ │
│ HCM → Hanoi     Dec 1      Confirmed   $45.00   │ │ Book New Trip  │ │
│ Hanoi → Da Nang Dec 15     Pending     $32.50   │ └────────────────┘ │
│ HCM → Can Tho   Dec 20     Confirmed   $18.00   │                    │
│ Da Nang → Hue   Jan 5      Confirmed   $15.00   │ ┌────────────────┐ │
│ Hue → HCM       Jan 10     Confirmed   $52.00   │ │ View Profile   │ │
│                                                 │ └────────────────┘ │
│                                                 │                    │
└─────────────────────────────────────────────────┴────────────────────┘
```

## Widget 1: Summary Cards
- **Total Bookings**: Count of all bookings made by user
- **Upcoming Trips**: Count of trips with departure date in the future
- **Total Spent**: Sum of all booking prices

**Data Source**: `useGetBookingsQuery` API endpoint

## Widget 2: Recent Bookings Table
- Shows last 5 bookings
- Columns: Trip (origin → destination), Date, Status, Price
- Interactive: Can click on rows to view booking details

**Data Source**: `useGetBookingsQuery({ limit: 5 })` API endpoint

## Widget 3: Quick Actions
- **Book New Trip**: Navigates to `/search` page
- **View Profile**: Navigates to `/dashboard/profile` page

## Role-Based Differences

### User Role
- Shows personal bookings only
- Summary cards show user's statistics
- Quick actions focused on booking and profile

### Admin Role
- Additional section: "Admin Statistics"
- Shows system-wide statistics
- Can see all users' bookings count
- Additional quick actions for admin tasks

## Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Card Background: White with subtle shadow

## Responsive Design
- Mobile: Single column stack
- Tablet: 2 columns for summary cards
- Desktop: 3 columns for summary cards, 2/3 + 1/3 split for table and actions
