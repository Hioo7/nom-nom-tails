import { Router } from 'express';
import { Role } from '@prisma/client';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import {
  listDishes,
  getDish,
  createDish,
  updateDish,
  deleteDish,
  uploadDishImage,
} from '../controllers/dish.controller';

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

router.get('/', ...guard, listDishes);
router.post('/', ...guard, createDish);
router.get('/:id', ...guard, getDish);
router.patch('/:id', ...guard, updateDish);
router.delete('/:id', ...guard, deleteDish);
router.post('/:id/image', ...guard, upload.single('image'), uploadDishImage);

export default router;
