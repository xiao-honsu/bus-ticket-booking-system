import httpStatus from 'http-status';
import mongoose, { PaginateOptions } from 'mongoose';
import Bus, { IBus } from '../models/bus.model';
import ApiError from '../utils/ApiError';

/**
 * Create a bus
 * @param {Object} busBody
 * @returns {Promise<IBus>}
 */
const createBus = async (busBody: Partial<IBus>): Promise<IBus> => {
  return Bus.create(busBody);
};

/**
 * Query for buses
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryBuses = async (filter: any, options: PaginateOptions) => {
  const buses = await Bus.paginate(filter, options);
  return buses;
};

/**
 * Get bus by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IBus | null>}
 */
const getBusById = async (id: mongoose.Types.ObjectId): Promise<IBus | null> => {
  return Bus.findById(id).populate('operator');
};

/**
 * Update bus by id
 * @param {mongoose.Types.ObjectId} busId
 * @param {Object} updateBody
 * @returns {Promise<IBus | null>}
 */
const updateBusById = async (busId: mongoose.Types.ObjectId, updateBody: Partial<IBus>): Promise<IBus | null> => {
  const bus = await getBusById(busId);
  if (!bus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bus not found');
  }
  Object.assign(bus, updateBody);
  await bus.save();
  return bus;
};

/**
 * Delete bus by id
 * @param {mongoose.Types.ObjectId} busId
 * @returns {Promise<IBus | null>}
 */
const deleteBusById = async (busId: mongoose.Types.ObjectId): Promise<IBus | null> => {
  const bus = await getBusById(busId);
  if (!bus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bus not found');
  }
  await bus.deleteOne();
  return bus;
};

export default {
  createBus,
  queryBuses,
  getBusById,
  updateBusById,
  deleteBusById,
};
