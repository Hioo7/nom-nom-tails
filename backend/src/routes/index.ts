
import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import meRouter from './me.routes';
import addressRouter from './address.routes';
import userRouter from './user.routes';
import dishRouter from './dish.routes';
import ingredientRouter from './ingredient.routes';
import mealPlanRouter from './mealPlan.routes';
import orderRouter from './order.routes';
import timeSlotRouter from './timeSlot.routes';
import deliveryPartnerRouter from './deliveryPartner.routes';
import customerRouter from './customer.routes';
import cartRouter from './cart.routes';
import customerOrderRouter from './customerOrder.routes';
import customerSubscriptionRouter from './customerSubscription.routes';
import customerTimeSlotRouter from './customerTimeSlot.routes';
import subscriptionRouter from './subscription.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/me/addresses', addressRouter);
router.use('/users', userRouter);
router.use('/dishes', dishRouter);
router.use('/ingredients', ingredientRouter);
router.use('/meal-plans', mealPlanRouter);
router.use('/orders', orderRouter);
router.use('/time-slots', timeSlotRouter);
router.use('/delivery-partners', deliveryPartnerRouter);
router.use('/customers', customerRouter);
router.use('/me/cart', cartRouter);
router.use('/customer', customerOrderRouter);
router.use('/customer/subscriptions', customerSubscriptionRouter);
router.use('/customer/time-slots', customerTimeSlotRouter);
router.use('/subscriptions', subscriptionRouter);

export default router;
