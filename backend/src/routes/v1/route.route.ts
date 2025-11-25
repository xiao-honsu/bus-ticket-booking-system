import express from 'express';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').post(auth('manageRoutes')).get(auth());

router.route('/search').get(auth());

router.route('/:routeId').get(auth()).patch(auth('manageRoutes')).delete(auth('manageRoutes'));

export default router;
