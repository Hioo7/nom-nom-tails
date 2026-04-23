import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getMe, updateMe, getDonationSummary } from '../controllers/me.controller';

const router = Router();

router.get('/', authenticate, getMe);
router.patch('/', authenticate, updateMe);
router.get('/donation-summary', authenticate, getDonationSummary);

export default router;
