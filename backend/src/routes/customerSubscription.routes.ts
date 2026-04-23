import { Router } from 'express';
import {
  listMySubscriptions,
  renew,
  subscribe,
} from '../controllers/customerSubscription.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole('CUSTOMER'));

router.post('/', subscribe);
router.get('/', listMySubscriptions);
router.post('/:id/renew', renew);

export default router;
