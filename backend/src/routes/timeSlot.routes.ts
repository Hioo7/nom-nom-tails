import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  listTimeSlotsByDay,
  getTimeSlot,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from '../controllers/timeSlot.controller';

const router = Router();
const guard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

router.get('/', ...guard, listTimeSlotsByDay);
router.post('/', ...guard, createTimeSlot);
router.get('/:id', ...guard, getTimeSlot);
router.patch('/:id', ...guard, updateTimeSlot);
router.delete('/:id', ...guard, deleteTimeSlot);

export default router;
