const allRoles = {
  user: [
    'bookTicket',
    'manageOwnBookings',
    'getTrips',
    'getBuses',
    'getRoutes',
    'createReview',
    'manageOwnReviews',
    'getSearchHistory'
  ],
  admin: [
    'getUsers',
    'manageUsers',
    'manageBuses',
    'manageRoutes',
    'manageTrips',
    'manageBookings',
    'manageOperators',
    'viewAnalytics',
    'manageReviews'
  ]
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
