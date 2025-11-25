import httpStatus from 'http-status';
import mongoose, { PaginateOptions } from 'mongoose';
import Trip, { ITrip } from '../models/trip.model';
import Bus from '../models/bus.model';
import ApiError from '../utils/ApiError';

/**
 * Create a trip
 * @param {Object} tripBody
 * @returns {Promise<ITrip>}
 */
const createTrip = async (tripBody: Partial<ITrip>): Promise<ITrip> => {
  // Verify bus exists
  const bus = await Bus.findById(tripBody.bus);
  if (!bus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  // Set available seats from bus total seats
  const trip = await Trip.create({
    ...tripBody,
    availableSeats: tripBody.availableSeats || bus.totalSeats,
  });
  return trip;
};

/**
 * Query for trips
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryTrips = async (filter: any, options: PaginateOptions) => {
  const trips = await Trip.paginate(filter, options);
  return trips;
};

/**
 * Get trip by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITrip | null>}
 */
const getTripById = async (id: mongoose.Types.ObjectId): Promise<ITrip | null> => {
  return Trip.findById(id).populate('bus').populate('route');
};

/**
 * Update trip by id
 * @param {mongoose.Types.ObjectId} tripId
 * @param {Object} updateBody
 * @returns {Promise<ITrip | null>}
 */
const updateTripById = async (
  tripId: mongoose.Types.ObjectId,
  updateBody: Partial<ITrip>
): Promise<ITrip | null> => {
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }
  Object.assign(trip, updateBody);
  await trip.save();
  return trip;
};

/**
 * Delete trip by id
 * @param {mongoose.Types.ObjectId} tripId
 * @returns {Promise<ITrip | null>}
 */
const deleteTripById = async (tripId: mongoose.Types.ObjectId): Promise<ITrip | null> => {
  const trip = await getTripById(tripId);
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }
  await trip.deleteOne();
  return trip;
};

/**
 * Search trips by route and date
 * @param {mongoose.Types.ObjectId} routeId
 * @param {Date} departureDate
 * @returns {Promise<ITrip[]>}
 */
const searchTrips = async (routeId: mongoose.Types.ObjectId, departureDate: Date) => {
  const startOfDay = new Date(departureDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(departureDate);
  endOfDay.setHours(23, 59, 59, 999);

  const trips = await Trip.find({
    route: routeId,
    departureTime: { $gte: startOfDay, $lte: endOfDay },
    status: 'scheduled',
  })
    .populate('bus')
    .populate('route');

  return trips;
};

export default {
  createTrip,
  queryTrips,
  getTripById,
  updateTripById,
  deleteTripById,
  searchTrips,
};
