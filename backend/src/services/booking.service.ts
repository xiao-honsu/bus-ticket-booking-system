import httpStatus from 'http-status';
import mongoose, { PaginateOptions } from 'mongoose';
import Booking, { IBooking } from '../models/booking.model';
import Trip from '../models/trip.model';
import ApiError from '../utils/ApiError';

/**
 * Create a booking
 * @param {Object} bookingBody
 * @returns {Promise<IBooking>}
 */
const createBooking = async (bookingBody: Partial<IBooking>): Promise<IBooking> => {
  // Verify trip exists and has available seats
  const trip = await Trip.findById(bookingBody.trip);
  if (!trip) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  const requestedSeats = bookingBody.passengers?.map((p) => p.seatNumber) || [];
  
  // Check if seats are already booked
  const alreadyBookedSeats = requestedSeats.filter((seat) => trip.bookedSeats.includes(seat));
  if (alreadyBookedSeats.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Seats ${alreadyBookedSeats.join(', ')} are already booked`);
  }

  // Check if enough seats available
  if (trip.availableSeats < requestedSeats.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough available seats');
  }

  // Create booking
  const booking = await Booking.create(bookingBody);

  // Update trip's booked seats and available seats
  trip.bookedSeats.push(...requestedSeats);
  trip.availableSeats -= requestedSeats.length;
  await trip.save();

  return booking;
};

/**
 * Query for bookings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryBookings = async (filter: any, options: PaginateOptions) => {
  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get booking by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBooking | null>}
 */
const getBookingById = async (id: mongoose.Types.ObjectId): Promise<IBooking | null> => {
  return Booking.findById(id).populate('user').populate({ path: 'trip', populate: { path: 'bus route' } });
};

/**
 * Update booking by id
 * @param {mongoose.Types.ObjectId} bookingId
 * @param {Object} updateBody
 * @returns {Promise<IBooking | null>}
 */
const updateBookingById = async (
  bookingId: mongoose.Types.ObjectId,
  updateBody: Partial<IBooking>
): Promise<IBooking | null> => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  Object.assign(booking, updateBody);
  await booking.save();
  return booking;
};

/**
 * Cancel booking
 * @param {mongoose.Types.ObjectId} bookingId
 * @param {string} reason
 * @returns {Promise<IBooking | null>}
 */
const cancelBooking = async (bookingId: mongoose.Types.ObjectId, reason: string): Promise<IBooking | null> => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already cancelled');
  }

  // Update trip's available seats
  const trip = await Trip.findById(booking.trip);
  if (trip) {
    const seatNumbers = booking.passengers.map((p) => p.seatNumber);
    trip.bookedSeats = trip.bookedSeats.filter((seat) => !seatNumbers.includes(seat));
    trip.availableSeats += seatNumbers.length;
    await trip.save();
  }

  booking.status = 'cancelled';
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  return booking;
};

export default {
  createBooking,
  queryBookings,
  getBookingById,
  updateBookingById,
  cancelBooking,
};
