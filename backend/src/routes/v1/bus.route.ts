import express from 'express';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').post(auth('manageBuses')).get(auth('getBuses'));

router.route('/:busId').get(auth('getBuses')).patch(auth('manageBuses')).delete(auth('manageBuses'));

export default router;
