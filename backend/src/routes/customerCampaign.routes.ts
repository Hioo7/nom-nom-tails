import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createCustomerCampaignContribution,
  getCustomerCampaign,
  listCustomerCampaigns,
  listMyCampaignContributions,
} from '../controllers/customerCampaign.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.CUSTOMER));

router.get('/', listCustomerCampaigns);
router.get('/contributions/me', listMyCampaignContributions);
router.get('/:id', getCustomerCampaign);
router.post('/:id/contributions', createCustomerCampaignContribution);

export default router;
