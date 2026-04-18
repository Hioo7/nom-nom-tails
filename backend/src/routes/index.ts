import { Router, Request, Response } from 'express';
import authRouter from './auth.routes';
import meRouter from './me.routes';
import userRouter from './user.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/users', userRouter);

export default router;
