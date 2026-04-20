import { Role } from '@prisma/client';
import { Router } from 'express';
import {
  fulfillOrder,
  getOrderDetails,
  getUpcomingProcurementSummary,
  listPendingSettlements,
  listUpcomingOrders,
  recordSettlementPayment,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const adminGuard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

router.get('/upcoming', ...adminGuard, listUpcomingOrders);
router.get('/upcoming/procurement', ...adminGuard, getUpcomingProcurementSummary);
router.get('/settlements', ...adminGuard, listPendingSettlements);
router.get('/:id', ...adminGuard, getOrderDetails);
router.post('/:id/fulfill', ...adminGuard, fulfillOrder);
router.post('/:id/payments', ...adminGuard, recordSettlementPayment);

export default router;
