# Backend Implementation Plan: User Portal Search Features

## 📋 Current State Analysis

### Requirements from Timeline (Week 2)

| Task | Requirement | Status |
|------|-------------|--------|
| Trip search API with filtering | REST API for searching trips by origin, destination, date | ✅ Implemented |
| Search result sorting & pagination | Sort by price, time, duration + pagination | ⚠️ Partial |
| City autocomplete | Backend support for city suggestions | ❌ Missing |

### Existing Backend Implementation

Based on the codebase analysis:

**✅ Already Implemented:**
- `GET /v1/trips/search` - Basic trip search endpoint
- `GET /v1/trips/:tripId` - Trip details
- `GET /v1/trips/:tripId/available-seats` - Available seats
- `GET /v1/routes/search` - Route search
- Pagination support via Mongoose paginate plugin

**⚠️ Partial Implementation:**
- Sorting exists but limited options
- Filtering by basic fields (origin, destination, date)

**❌ Missing Features:**
- City/location autocomplete endpoint
- Advanced filtering (price range, departure time range, bus type, amenities)
- Search history logging (model exists but not fully utilized)
- Popular routes endpoint

---

## 🎯 Implementation Plan

### Phase 1: Enhance Trip Search API (Priority: 🔥 HIGH)
**Time Estimate:** 3-4 hours

#### Task 1.1: Add Advanced Filtering to Trip Search

```typescript
// File: backend/src/validations/trip.validation.ts

const searchTrips = {
  query: Joi.object().keys({
    // Existing filters
    origin: Joi.string(),
    destination: Joi.string(),
    departureDate: Joi.date(),
    
    // NEW: Advanced filters
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    departureTimeFrom: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
    departureTimeTo: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    busType: Joi.string().valid('standard', 'luxury', 'sleeper', 'limousine'),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),
    operatorId: Joi.string().custom(objectId),
    
    // Sorting & Pagination
    sortBy: Joi.string().valid('price', 'departureTime', 'duration', 'availableSeats'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};
```

#### Task 1.2: Update Trip Service with Advanced Search

```typescript
// File: backend/src/services/trip.service.ts

interface SearchTripsOptions {
  origin?: string;
  destination?: string;
  departureDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  busType?: string;
  amenities?: string[];
  operatorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const searchTrips = async (options: SearchTripsOptions) => {
  const {
    origin,
    destination,
    departureDate,
    minPrice,
    maxPrice,
    departureTimeFrom,
    departureTimeTo,
    busType,
    amenities,
    operatorId,
    sortBy = 'departureTime',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  } = options;

  // Build aggregation pipeline for complex filtering
  const pipeline: any[] = [];

  // Match stage - basic filters
  const matchStage: any = { status: 'scheduled' };

  if (departureDate) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);
    matchStage.departureTime = { $gte: startOfDay, $lte: endOfDay };
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage.price = {};
    if (minPrice !== undefined) matchStage.price.$gte = minPrice;
    if (maxPrice !== undefined) matchStage.price.$lte = maxPrice;
  }

  // Time range filter (within the day)
  if (departureTimeFrom || departureTimeTo) {
    pipeline.push({
      $addFields: {
        departureHour: { $hour: '$departureTime' },
        departureMinute: { $minute: '$departureTime' },
      },
    });

    if (departureTimeFrom) {
      const [fromHour, fromMinute] = departureTimeFrom.split(':').map(Number);
      matchStage.$expr = matchStage.$expr || { $and: [] };
      matchStage.$expr.$and.push({
        $gte: [
          { $add: [{ $multiply: ['$departureHour', 60] }, '$departureMinute'] },
          fromHour * 60 + fromMinute,
        ],
      });
    }

    if (departureTimeTo) {
      const [toHour, toMinute] = departureTimeTo.split(':').map(Number);
      matchStage.$expr = matchStage.$expr || { $and: [] };
      matchStage.$expr.$and.push({
        $lte: [
          { $add: [{ $multiply: ['$departureHour', 60] }, '$departureMinute'] },
          toHour * 60 + toMinute,
        ],
      });
    }
  }

  pipeline.push({ $match: matchStage });

  // Lookup route for origin/destination filtering
  pipeline.push({
    $lookup: {
      from: 'routes',
      localField: 'route',
      foreignField: '_id',
      as: 'routeInfo',
    },
  });
  pipeline.push({ $unwind: '$routeInfo' });

  // Filter by origin/destination
  if (origin) {
    pipeline.push({
      $match: {
        'routeInfo.origin.city': { $regex: origin, $options: 'i' },
      },
    });
  }
  if (destination) {
    pipeline.push({
      $match: {
        'routeInfo.destination.city': { $regex: destination, $options: 'i' },
      },
    });
  }

  // Lookup bus for type/amenities filtering
  pipeline.push({
    $lookup: {
      from: 'buses',
      localField: 'bus',
      foreignField: '_id',
      as: 'busInfo',
    },
  });
  pipeline.push({ $unwind: '$busInfo' });

  if (busType) {
    pipeline.push({
      $match: { 'busInfo.busType': busType },
    });
  }

  if (amenities && amenities.length > 0) {
    pipeline.push({
      $match: { 'busInfo.amenities': { $all: amenities } },
    });
  }

  // Lookup operator
  pipeline.push({
    $lookup: {
      from: 'operators',
      localField: 'operator',
      foreignField: '_id',
      as: 'operatorInfo',
    },
  });
  pipeline.push({ $unwind: '$operatorInfo' });

  if (operatorId) {
    pipeline.push({
      $match: { operator: new mongoose.Types.ObjectId(operatorId) },
    });
  }

  // Add available seats count
  pipeline.push({
    $addFields: {
      availableSeatsCount: {
        $subtract: ['$busInfo.totalSeats', { $size: { $ifNull: ['$bookedSeats', []] } }],
      },
      duration: '$routeInfo.estimatedDuration',
    },
  });

  // Sort
  const sortOptions: any = {};
  switch (sortBy) {
    case 'price':
      sortOptions.pricePerSeat = sortOrder === 'asc' ? 1 : -1;
      break;
    case 'duration':
      sortOptions.duration = sortOrder === 'asc' ? 1 : -1;
      break;
    case 'availableSeats':
      sortOptions.availableSeatsCount = sortOrder === 'asc' ? 1 : -1;
      break;
    case 'departureTime':
    default:
      sortOptions.departureTime = sortOrder === 'asc' ? 1 : -1;
  }
  pipeline.push({ $sort: sortOptions });

  // Pagination with facet
  pipeline.push({
    $facet: {
      results: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            departureTime: 1,
            arrivalTime: 1,
            pricePerSeat: 1,
            availableSeats: 1,
            status: 1,
            route: {
              id: '$routeInfo._id',
              routeName: '$routeInfo.routeName',
              origin: '$routeInfo.origin',
              destination: '$routeInfo.destination',
              distance: '$routeInfo.distance',
              estimatedDuration: '$routeInfo.estimatedDuration',
            },
            bus: {
              id: '$busInfo._id',
              busNumber: '$busInfo.busNumber',
              busType: '$busInfo.busType',
              amenities: '$busInfo.amenities',
              totalSeats: '$busInfo.totalSeats',
            },
            operator: {
              id: '$operatorInfo._id',
              companyName: '$operatorInfo.companyName',
              logoUrl: '$operatorInfo.logoUrl',
              rating: '$operatorInfo.rating',
            },
            availableSeatsCount: 1,
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    },
  });

  const [result] = await Trip.aggregate(pipeline);

  const totalResults = result.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: result.results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};
```

---

### Phase 2: City Autocomplete Endpoint (Priority: 🔥 HIGH)
**Time Estimate:** 2 hours

#### Task 2.1: Create Location Validation

```typescript
// File: backend/src/validations/location.validation.ts

import Joi from 'joi';

const searchLocations = {
  query: Joi.object().keys({
    q: Joi.string().required().min(1).max(100),
    type: Joi.string().valid('origin', 'destination', 'all').default('all'),
    limit: Joi.number().integer().min(1).max(20).default(10),
  }),
};

const getPopularLocations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(20).default(10),
  }),
};

export default {
  searchLocations,
  getPopularLocations,
};
```

#### Task 2.2: Create Location Service

```typescript
// File: backend/src/services/location.service.ts

import Route from '../models/route.model';
import SearchHistory from '../models/searchhistory.model';

/**
 * Search locations (cities) for autocomplete
 */
const searchLocations = async (query: string, type: string, limit: number) => {
  const regex = new RegExp(query, 'i');

  // Get distinct locations from routes
  const [origins, destinations] = await Promise.all([
    type !== 'destination'
      ? Route.distinct('origin.city', { 'origin.city': regex, isActive: true })
      : [],
    type !== 'origin'
      ? Route.distinct('destination.city', { 'destination.city': regex, isActive: true })
      : [],
  ]);

  // Combine and deduplicate
  const allLocations = [...new Set([...origins, ...destinations])];

  // Sort by relevance (starts with query first)
  const sorted = allLocations.sort((a, b) => {
    const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.localeCompare(b);
  });

  return sorted.slice(0, limit).map((location) => ({
    name: location,
    type: origins.includes(location) && destinations.includes(location) ? 'both' : 
          origins.includes(location) ? 'origin' : 'destination',
  }));
};

/**
 * Get popular locations based on search history
 */
const getPopularLocations = async (limit: number) => {
  const popularSearches = await SearchHistory.aggregate([
    {
      $group: {
        _id: { origin: '$originCity', destination: '$destinationCity' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit * 2 },
  ]);

  const locationCounts = new Map<string, number>();

  popularSearches.forEach((search) => {
    if (search._id.origin) {
      locationCounts.set(
        search._id.origin,
        (locationCounts.get(search._id.origin) || 0) + search.count
      );
    }
    if (search._id.destination) {
      locationCounts.set(
        search._id.destination,
        (locationCounts.get(search._id.destination) || 0) + search.count
      );
    }
  });

  return Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, searchCount]) => ({ name, searchCount }));
};

/**
 * Get popular routes
 */
const getPopularRoutes = async (limit: number) => {
  const popularRoutes = await Route.find({ isActive: true })
    .sort({ 'stats.totalBookings': -1 })
    .limit(limit)
    .select('routeName origin.city destination.city stats.totalBookings')
    .lean();

  return popularRoutes.map((route) => ({
    id: route._id,
    routeName: route.routeName,
    origin: route.origin.city,
    destination: route.destination.city,
    totalBookings: route.stats?.totalBookings || 0,
  }));
};

export default {
  searchLocations,
  getPopularLocations,
  getPopularRoutes,
};
```

#### Task 2.3: Create Location Controller

```typescript
// File: backend/src/controllers/location.controller.ts

import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import locationService from '../services/location.service';

const searchLocations = catchAsync(async (req: Request, res: Response) => {
  const { q, type, limit } = req.query;
  const locations = await locationService.searchLocations(
    q as string,
    type as string,
    Number(limit) || 10
  );
  res.send(locations);
});

const getPopularLocations = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const locations = await locationService.getPopularLocations(Number(limit) || 10);
  res.send(locations);
});

const getPopularRoutes = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const routes = await locationService.getPopularRoutes(Number(limit) || 10);
  res.send(routes);
});

export default {
  searchLocations,
  getPopularLocations,
  getPopularRoutes,
};
```

#### Task 2.4: Create Location Routes

```typescript
// File: backend/src/routes/v1/location.route.ts

import express from 'express';
import validate from '../../middlewares/validate';
import locationController from '../../controllers/location.controller';
import locationValidation from '../../validations/location.validation';

const router = express.Router();

/**
 * @route GET /v1/locations/search
 * @desc Search locations for autocomplete
 * @access Public
 */
router.get(
  '/search',
  validate(locationValidation.searchLocations),
  locationController.searchLocations
);

/**
 * @route GET /v1/locations/popular
 * @desc Get popular locations
 * @access Public
 */
router.get(
  '/popular',
  validate(locationValidation.getPopularLocations),
  locationController.getPopularLocations
);

/**
 * @route GET /v1/locations/popular-routes
 * @desc Get popular routes
 * @access Public
 */
router.get(
  '/popular-routes',
  validate(locationValidation.getPopularLocations),
  locationController.getPopularRoutes
);

export default router;
```

#### Task 2.5: Register Location Routes

```typescript
// File: backend/src/routes/v1/index.ts

// Add to existing imports
import locationRoute from './location.route';

// Add to router configuration
router.use('/locations', locationRoute);
```

---

### Phase 3: Search History Logging (Priority: 🟡 MEDIUM)
**Time Estimate:** 1-2 hours

#### Task 3.1: Create Search History Service

```typescript
// File: backend/src/services/searchhistory.service.ts

import mongoose from 'mongoose';
import SearchHistory from '../models/searchhistory.model';

interface LogSearchParams {
  userId?: string;
  sessionId?: string;
  originCity: string;
  destinationCity: string;
  travelDate?: Date;
  passengers?: number;
  filters?: Record<string, any>;
  resultsCount?: number;
}

/**
 * Log a search query
 */
const logSearch = async (params: LogSearchParams) => {
  const searchHistory = await SearchHistory.create({
    user: params.userId ? new mongoose.Types.ObjectId(params.userId) : undefined,
    sessionId: params.sessionId,
    originCity: params.originCity,
    destinationCity: params.destinationCity,
    travelDate: params.travelDate,
    passengers: params.passengers || 1,
    filters: params.filters,
    resultsCount: params.resultsCount,
  });
  return searchHistory;
};

/**
 * Get user's recent searches
 */
const getUserRecentSearches = async (userId: string, limit: number = 5) => {
  const searches = await SearchHistory.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('originCity destinationCity travelDate createdAt')
    .lean();
  return searches;
};

/**
 * Get session's recent searches (for guests)
 */
const getSessionRecentSearches = async (sessionId: string, limit: number = 5) => {
  const searches = await SearchHistory.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('originCity destinationCity travelDate createdAt')
    .lean();
  return searches;
};

export default {
  logSearch,
  getUserRecentSearches,
  getSessionRecentSearches,
};
```

#### Task 3.2: Integrate Search Logging into Trip Controller

```typescript
// File: backend/src/controllers/trip.controller.ts

// Add to searchTrips function
import searchHistoryService from '../services/searchhistory.service';

const searchTrips = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  
  // Perform search
  const results = await tripService.searchTrips(options);
  
  // Log search asynchronously (don't block response)
  if (options.origin && options.destination) {
    searchHistoryService.logSearch({
      userId: req.user?.id,
      sessionId: req.headers['x-session-id'] as string,
      originCity: options.origin as string,
      destinationCity: options.destination as string,
      travelDate: options.departureDate ? new Date(options.departureDate as string) : undefined,
      filters: {
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        busType: options.busType,
        amenities: options.amenities,
      },
      resultsCount: results.totalResults,
    }).catch((err) => {
      // Log error but don't fail the request
      console.error('Failed to log search:', err);
    });
  }
  
  res.send(results);
});
```

---

### Phase 4: Trip Details Enhancement (Priority: 🟡 MEDIUM)
**Time Estimate:** 2 hours

#### Task 4.1: Enhance Trip Details Service

```typescript
// File: backend/src/services/trip.service.ts

/**
 * Get trip by ID with full details for trip details page
 */
const getTripDetails = async (tripId: string) => {
  const trip = await Trip.findById(tripId)
    .populate({
      path: 'route',
      select: 'routeName origin destination stops distance estimatedDuration',
    })
    .populate({
      path: 'bus',
      select: 'busNumber busType totalSeats amenities seatMap images',
    })
    .populate({
      path: 'operator',
      select: 'companyName logoUrl rating description',
    })
    .lean();

  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  // Get locked seats
  const lockedSeats = await SeatLock.find({
    trip: tripId,
    expiresAt: { $gt: new Date() },
  }).select('seatNumbers');
  
  const lockedSeatNumbers = lockedSeats.flatMap((lock) => lock.seatNumbers);

  // Build seat availability map
  const seatAvailability = {};
  const bus = trip.bus as any;
  
  if (bus.seatMap?.seats) {
    bus.seatMap.seats.forEach((seat: any) => {
      const isBooked = trip.bookedSeats?.includes(seat.seatNumber);
      const isLocked = lockedSeatNumbers.includes(seat.seatNumber);
      
      seatAvailability[seat.seatNumber] = {
        ...seat,
        status: isBooked ? 'booked' : isLocked ? 'locked' : 'available',
        price: trip.pricePerSeat + (seat.priceModifier || 0),
      };
    });
  }

  // Calculate stats
  const bookedCount = trip.bookedSeats?.length || 0;
  const totalSeats = bus.totalSeats || 0;
  const availableSeats = totalSeats - bookedCount - lockedSeatNumbers.length;

  return {
    ...trip,
    id: trip._id,
    availableSeats,
    seatAvailability,
    policies: {
      cancellation: 'Free cancellation up to 24 hours before departure',
      modification: 'Free modification up to 12 hours before departure',
      refund: 'Full refund for cancellations made 24+ hours before departure',
    },
  };
};
```

---

## 📊 Summary

### API Endpoints After Implementation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/v1/trips/search` | Advanced trip search with filters | Public |
| `GET` | `/v1/trips/:tripId` | Get trip details with seat info | Public |
| `GET` | `/v1/trips/:tripId/available-seats` | Get available seats | Public |
| `GET` | `/v1/locations/search` | City autocomplete | Public |
| `GET` | `/v1/locations/popular` | Popular locations | Public |
| `GET` | `/v1/locations/popular-routes` | Popular routes | Public |
| `GET` | `/v1/users/search-history` | User's search history | Auth |

### Implementation Priority

```
Phase 1: Enhanced Trip Search ───────────────► 3-4 hours
    │
    ▼
Phase 2: City Autocomplete ──────────────────► 2 hours
    │
    ▼
Phase 3: Search History Logging ─────────────► 1-2 hours
    │
    ▼
Phase 4: Trip Details Enhancement ───────────► 2 hours
    │
    ▼
Total: ~8-10 hours
```

### Testing Checklist

- [ ] Trip search returns filtered results correctly
- [ ] Price range filter works
- [ ] Time range filter works
- [ ] Bus type filter works
- [ ] Amenities filter works
- [ ] Sorting by price, time, duration works
- [ ] Pagination returns correct pages
- [ ] City autocomplete returns relevant suggestions
- [ ] Popular locations reflect actual search patterns
- [ ] Search history is logged correctly
- [ ] User's recent searches are retrievable
- [ ] Trip details include seat availability

---

## 🔧 Files to Create/Modify

### New Files:
1. `backend/src/services/location.service.ts`
2. `backend/src/controllers/location.controller.ts`
3. `backend/src/validations/location.validation.ts`
4. `backend/src/routes/v1/location.route.ts`
5. `backend/src/services/searchhistory.service.ts`

### Files to Modify:
1. `backend/src/validations/trip.validation.ts` - Add advanced filters
2. `backend/src/services/trip.service.ts` - Update search logic
3. `backend/src/controllers/trip.controller.ts` - Add search logging
4. `backend/src/routes/v1/index.ts` - Register location routes
