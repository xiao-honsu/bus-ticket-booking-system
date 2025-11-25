const allRoles = {
  user: ['bookTicket', 'manageOwnBookings', 'getTrips', 'getBuses'],
  admin: ['getUsers', 'manageUsers', 'manageBuses', 'manageRoutes', 'manageTrips', 'manageBookings'],
  operator: ['manageBuses', 'manageTrips', 'getBookings'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
