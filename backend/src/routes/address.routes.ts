import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getCurrentLocation,
  upsertCurrentLocation,
} from '../controllers/address.controller';

const router = Router();

router.use(authenticate);

router.get('/', listAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);

// Current GPS location — stored as a special address entry
router.get('/current-location', getCurrentLocation);
router.put('/current-location', upsertCurrentLocation);

export default router;
