import { Role } from '@prisma/client';
import { Router } from 'express';
import { fulfillOrder, getTodayOrders } from '../controllers/chef.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const chefGuard = [authenticate, requireRole(Role.CHEF)];

router.get('/', ...chefGuard, getTodayOrders);
router.post('/:id/fulfill', ...chefGuard, fulfillOrder);

export default router;
