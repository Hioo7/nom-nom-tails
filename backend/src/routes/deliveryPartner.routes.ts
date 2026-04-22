import { Role } from '@prisma/client';
import multer from 'multer';
import { Router } from 'express';
import {
  acceptDeliveryTask,
  completeDeliveryTask,
  failDeliveryTask,
  listAvailableDeliveryTasks,
  listDeliveryPartners,
  listMyDeliveryTasks,
} from '../controllers/deliveryPartner.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();
const adminGuard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];
const partnerGuard = [authenticate, requireRole(Role.DELIVERY_PARTNER)];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', ...adminGuard, listDeliveryPartners);
router.get('/me/available-tasks', ...partnerGuard, listAvailableDeliveryTasks);
router.get('/me/tasks', ...partnerGuard, listMyDeliveryTasks);
router.post('/tasks/:id/accept', ...partnerGuard, acceptDeliveryTask);
router.post('/tasks/:id/fail', ...partnerGuard, failDeliveryTask);
router.post(
  '/tasks/:id/complete',
  ...partnerGuard,
  upload.single('image'),
  completeDeliveryTask,
);

export default router;
