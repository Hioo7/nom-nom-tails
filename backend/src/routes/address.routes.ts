import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/address.controller';

const router = Router();

router.use(authenticate);

router.get('/', listAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
