import { Router } from 'express';

import { Role } from '@prisma/client';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  listMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  uploadMealPlanImage,
} from '../controllers/mealPlan.controller';

const router = Router();
const guard = [authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN)];

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

router.get('/', ...guard, listMealPlans);
router.post('/', ...guard, createMealPlan);
router.get('/:id', ...guard, getMealPlan);
router.patch('/:id', ...guard, updateMealPlan);
router.delete('/:id', ...guard, deleteMealPlan);
router.post('/:id/image', ...guard, upload.single('image'), uploadMealPlanImage);


export default router;
