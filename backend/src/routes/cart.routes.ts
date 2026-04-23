import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getCart, upsertItem, removeItem, clearCart, syncCart } from '../controllers/cart.controller';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, upsertItem);
router.delete('/items/:dishId', authenticate, removeItem);
router.delete('/', authenticate, clearCart);
router.put('/sync', authenticate, syncCart);

export default router;
