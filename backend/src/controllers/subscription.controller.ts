import { NextFunction, Request, Response } from 'express';
import { ListSubscriptionsQuerySchema } from '../schema/subscription.schema';
import SubscriptionService from '../services/subscription.service';
import AppError from '../lib/AppError';

const subscriptionService = SubscriptionService.getInstance();

export async function listSubscriptions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = ListSubscriptionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }
    const subscriptions = await subscriptionService.listAllSubscriptions(parsed.data);
    res.status(200).json({ data: subscriptions });
  } catch (error) {
    next(error);
  }
}
