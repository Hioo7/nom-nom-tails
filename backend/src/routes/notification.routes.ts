import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { listNotifications, getUnreadCount, markAllRead } from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, listNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/mark-read', authenticate, markAllRead);

export default router;
