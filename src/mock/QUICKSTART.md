# 🚌 Quick Start: Test Seat Map Page

This guide helps you quickly test the seat map booking page with ready-to-use mock data.

## ⚡ Quick Setup (2 minutes)

### Step 1: Configure API URL

Create or update `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=/api/mock
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test the Seat Map

Open your browser and visit any of these URLs:

```
Nearly Empty Bus:   http://localhost:3000/booking/trip-001
Half-Full Bus:      http://localhost:3000/booking/trip-002
Almost Full Bus:    http://localhost:3000/booking/trip-003
Double-Deck Bus:    http://localhost:3000/booking/trip-004
Sleeper Bus:        http://localhost:3000/booking/trip-005
Empty Bus:          http://localhost:3000/booking/trip-006
```

That's it! 🎉 No additional setup required.

## 📊 Test Scenarios

| Trip ID  | Type        | Total Seats | Booked | Locked | Best For Testing        |
| -------- | ----------- | ----------- | ------ | ------ | ----------------------- |
| trip-001 | Single-deck | 40          | 3      | 2      | Basic selection flow    |
| trip-002 | Single-deck | 40          | 20     | 3      | Half-full availability  |
| trip-003 | Single-deck | 40          | 33     | 2      | Scarcity (only 5 left!) |
| trip-004 | Double-deck | 56          | 10     | 4      | Deck navigation         |
| trip-005 | Sleeper     | 30          | 7      | 2      | Sleeper layout          |
| trip-006 | Single-deck | 40          | 0      | 0      | Empty bus               |

## 🎯 What to Test

### Visual Tests

- ✅ Seats display in proper grid layout
- ✅ Colors match status (green/orange/red/yellow borders)
- ✅ Blue dots appear on window seats
- ✅ Deck badges show available counts
- ✅ Driver emoji at the top

### Interaction Tests

- ✅ Click available seats (green border) → turns orange
- ✅ Click selected seat (orange) → deselects
- ✅ Try clicking booked seats (red) → shows error toast
- ✅ Try clicking locked seats (yellow) → shows error toast
- ✅ Select multiple seats → fare updates

### Booking Flow Tests

- ✅ Select seats → fare details update
- ✅ Selected seats show as badges in sidebar
- ✅ Total price calculates correctly
- ✅ "Proceed to Checkout" button enables when seats selected
- ✅ Lock timer starts countdown

### Pricing Tests

- ✅ Standard seats: Base price (500,000₫)
- ✅ Window seats: +20% (600,000₫)
- ✅ VIP seats: +50% (750,000₫)
- ✅ VIP window: +80% (900,000₫)

## 🔧 Troubleshooting

**Issue: "Trip not found" error**

- Solution: Make sure you're using trip IDs from `trip-001` to `trip-006`

**Issue: API calls failing**

- Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=/api/mock`
- Restart the dev server after changing env files
- Verify URL in browser DevTools Network tab

**Issue: Seats not showing colors correctly**

- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check browser console for errors

**Issue: Selection not working**

- Open browser console (F12)
- Check for JavaScript errors
- Verify Redux store is initialized

## 📁 File Structure

```
src/
├── mock/
│   ├── seatMapData.ts          # Mock data generators
│   ├── README-SEAT-MAP-TESTING.md  # Detailed docs
│   └── QUICKSTART.md           # This file
├── app/
│   └── api/
│       └── mock/               # Mock API routes
│           ├── trips/[tripId]/seat-map/route.ts
│           └── seat-locks/
│               ├── lock/route.ts
│               ├── release/route.ts
│               └── check-availability/route.ts
└── containers/
    └── seat-selection/
        └── SeatMap.tsx         # Main component
```

## 🎨 UI Features to Verify

### Seat Map Section

- [ ] Driver section at top with 🚗 emoji
- [ ] "Click on available seats..." instruction text
- [ ] Centered seat layout with proper spacing
- [ ] Deck headers (if double-deck) with availability badges

### Sidebar Cards

- [ ] **Your Destination** - Shows route, times
- [ ] **Selected Seats** - Shows seat badges (only when selected)
- [ ] **Fare Details** - Shows breakdown and total
- [ ] **Seat Legend** - Shows status examples
- [ ] **Checkout Button** - Red, full width, uppercase text

### Passenger Form

- [ ] Only appears after selecting seats
- [ ] Shows below seat map in separate card
- [ ] Has proper title and description

## 🔄 Switch Back to Real API

When ready to test with the real backend:

1. Update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

2. Restart dev server:

```bash
npm run dev
```

## 💡 Tips

1. **Test Different Screen Sizes**: Resize browser window to test responsive layout
2. **Test Multiple Selections**: Try selecting 1, 3, and 10 seats to see fare calculations
3. **Test Edge Cases**: Try the almost-full bus (trip-003) to see scarcity handling
4. **Test Decks**: Use trip-004 to verify upper/lower deck separation
5. **Check Pricing**: Verify window seats cost more (blue dot indicator)

## 🆘 Need More Help?

- See [README-SEAT-MAP-TESTING.md](./README-SEAT-MAP-TESTING.md) for detailed documentation
- Check the [Seat Locking API docs](../../docs/agent-generated/SEAT-LOCKING-API.md)
- Review component code in `src/containers/seat-selection/SeatMap.tsx`

---

**Happy Testing!** 🚀
