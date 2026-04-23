import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getMe, updateMe, updateLocation } from '../controllers/me.controller';

const router = Router();

router.get('/', authenticate, getMe);
router.patch('/', authenticate, updateMe);
router.patch('/location', authenticate, updateLocation);

export default router;
