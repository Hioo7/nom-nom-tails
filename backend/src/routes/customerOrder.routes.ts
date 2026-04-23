import { Router } from 'express';
import { Role } from '@prisma/client';
import { createOrder, listMyOrders, listActiveTimeSlots } from '../controllers/customerOrder.controller';
import { createSubscription, listMySubscriptions } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.CUSTOMER));

router.get('/timeslots', listActiveTimeSlots);
router.post('/orders', createOrder);
router.get('/orders', listMyOrders);
router.post('/subscriptions', createSubscription);
router.get('/subscriptions', listMySubscriptions);

export default router;
