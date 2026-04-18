import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';
import { listIngredients, createIngredient } from '../controllers/ingredient.controller';

const router = Router();
const adminGuard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

router.get('/', ...adminGuard, listIngredients);
router.post('/', ...adminGuard, createIngredient);

export default router;
