import { Role } from '@prisma/client';
import { Router } from 'express';
import {
  listCustomers,
  updateCustomerLoyalty,
} from '../controllers/customer.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const guard = [authenticate, requireRole(Role.ADMIN)];

router.get('/', ...guard, listCustomers);
router.patch('/:id/loyalty', ...guard, updateCustomerLoyalty);

export default router;
