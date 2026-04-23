import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getMe, updateMe } from '../controllers/me.controller';

const router = Router();

router.get('/', authenticate, getMe);
router.patch('/', authenticate, updateMe);

export default router;
