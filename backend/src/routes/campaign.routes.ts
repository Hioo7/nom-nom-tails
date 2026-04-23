import { Router } from 'express';
import { Role } from '@prisma/client';
import multer from 'multer';
import {
  createCampaign,
  deactivateCampaign,
  getCampaign,
  listCampaignContributions,
  listCampaigns,
  updateCampaign,
  uploadCampaignImage,
} from '../controllers/campaign.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

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

router.use(...guard);

router.get('/', listCampaigns);
router.post('/', createCampaign);
router.get('/:id', getCampaign);
router.patch('/:id', updateCampaign);
router.patch('/:id/deactivate', deactivateCampaign);
router.get('/:id/contributions', listCampaignContributions);
router.post('/:id/image', upload.single('image'), uploadCampaignImage);

export default router;
