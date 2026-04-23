import { NextFunction, Request, Response } from 'express';
import SubscriptionService from '../services/subscription.service';
import {
  parseCreateSubscriptionBody,
  parseRenewSubscriptionBody,
} from '../validators/subscription.validator';

const subscriptionService = SubscriptionService.getInstance();

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseCreateSubscriptionBody(req.body as object);
    const subscription = await subscriptionService.subscribe(req.user!.id, input);
    res.status(201).json({ data: subscription });
  } catch (error) {
    next(error);
  }
}

export async function listMySubscriptions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const subscriptions = await subscriptionService.listMySubscriptions(req.user!.id);
    res.status(200).json({ data: subscriptions });
  } catch (error) {
    next(error);
  }
}

export async function renew(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseRenewSubscriptionBody(req.body as object);
    const subscription = await subscriptionService.renewSubscription(
      req.user!.id,
      req.params['id'] as string,
      input.addressId,
    );
    res.status(200).json({ data: subscription });
  } catch (error) {
    next(error);
  }
}
