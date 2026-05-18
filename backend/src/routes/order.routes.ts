import { Role } from '@prisma/client';
import { Router } from 'express';
import {
  approveOrder,
  fulfillOrder,
  getOrderDetails,
  getUpcomingProcurementSummary,
  listOrdersByMonth,
  listPendingSettlements,
  listUpcomingOrders,
  recordSettlementPayment,
  rejectOrder,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const adminGuard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

router.get('/upcoming', ...adminGuard, listUpcomingOrders);
router.get('/by-month', ...adminGuard, listOrdersByMonth);
router.get('/upcoming/procurement', ...adminGuard, getUpcomingProcurementSummary);
router.get('/settlements', ...adminGuard, listPendingSettlements);
router.get('/:id', ...adminGuard, getOrderDetails);
router.post('/:id/approve', ...adminGuard, approveOrder);
router.post('/:id/reject', ...adminGuard, rejectOrder);
router.post('/:id/fulfill', ...adminGuard, fulfillOrder);
router.post('/:id/payments', ...adminGuard, recordSettlementPayment);

export default router;
