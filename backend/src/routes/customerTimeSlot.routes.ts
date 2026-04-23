import { Router } from 'express';
import {
  getOrderTimeSlots,
  getSubscriptionTimeSlots,
} from '../controllers/customerTimeSlot.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/order', getOrderTimeSlots);
router.get('/subscription', getSubscriptionTimeSlots);

export default router;
