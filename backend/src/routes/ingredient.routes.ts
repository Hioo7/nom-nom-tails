import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { Role } from '@prisma/client';
import {
  createIngredient,
  decreaseIngredientStock,
  increaseIngredientStock,
  listIngredients,
  updateIngredient,
} from '../controllers/ingredient.controller';

const router = Router();
const adminGuard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

router.get('/', ...adminGuard, listIngredients);
router.post('/', ...adminGuard, createIngredient);
router.patch('/:id', ...adminGuard, updateIngredient);
router.post('/:id/increase-stock', ...adminGuard, increaseIngredientStock);
router.post('/:id/decrease-stock', ...adminGuard, decreaseIngredientStock);

export default router;
