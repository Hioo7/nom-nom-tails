import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import meRouter from './me.routes';
import userRouter from './user.routes';
import dishRouter from './dish.routes';
import ingredientRouter from './ingredient.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/users', userRouter);
router.use('/dishes', dishRouter);
router.use('/ingredients', ingredientRouter);

export default router;
