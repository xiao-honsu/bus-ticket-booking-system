import express from 'express';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').get(auth('getUsers'));

router.route('/:userId').get(auth('getUsers')).patch(auth('manageUsers')).delete(auth('manageUsers'));

export default router;
