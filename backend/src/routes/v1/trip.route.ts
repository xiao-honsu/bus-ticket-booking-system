import express from 'express';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').post(auth('manageTrips')).get(auth('getTrips'));

router.route('/search').get(auth('getTrips'));

router.route('/:tripId').get(auth('getTrips')).patch(auth('manageTrips')).delete(auth('manageTrips'));

export default router;
