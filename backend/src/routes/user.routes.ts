import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';

const router = Router();
const guard = [authenticate, requireRole(Role.SUPER_ADMIN)];

router.get('/', ...guard, listUsers);
router.post('/', ...guard, createUser);
router.get('/:id', ...guard, getUser);
router.patch('/:id', ...guard, updateUser);
router.delete('/:id', ...guard, deleteUser);

export default router;
