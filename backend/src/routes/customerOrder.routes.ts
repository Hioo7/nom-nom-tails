import { Router } from 'express';
import { createOrder, listMyOrders } from '../controllers/customerOrder.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole('CUSTOMER'));

router.post('/', createOrder);
router.get('/', listMyOrders);

export default router;
