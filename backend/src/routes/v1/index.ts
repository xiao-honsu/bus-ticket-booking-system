import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import busRoute from './bus.route';
import routeRoute from './route.route';
import tripRoute from './trip.route';
import bookingRoute from './booking.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/buses',
    route: busRoute,
  },
  {
    path: '/routes',
    route: routeRoute,
  },
  {
    path: '/trips',
    route: tripRoute,
  },
  {
    path: '/bookings',
    route: bookingRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
