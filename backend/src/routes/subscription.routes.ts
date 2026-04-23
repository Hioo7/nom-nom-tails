import { Router } from 'express';
import { listSubscriptions } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/', listSubscriptions);

export default router;
