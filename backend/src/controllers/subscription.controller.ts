import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { CreateSubscriptionSchema, ListSubscriptionsQuerySchema } from '../schema/subscription.schema';
import SubscriptionService from '../services/subscription.service';
import AppError from '../lib/AppError';

const subscriptionService = SubscriptionService.getInstance();

// Admin: list all subscriptions
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

// Customer: create a subscription
export async function createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.user!.id;

    const parsed = CreateSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { mealPlanId, timeSlotId, startDate, endDate, isAutoRenew } = parsed.data;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 28 * 24 * 60 * 60 * 1000);
    if (end <= start) throw new AppError(400, 'End date must be after start date');

    const mealPlan = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!mealPlan || !mealPlan.isActive) throw new AppError(404, 'Meal plan not found or inactive');

    const timeSlot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!timeSlot || !timeSlot.isActive) throw new AppError(400, 'Selected time slot is not available');

    const subscription = await prisma.subscription.create({
      data: { customerId, mealPlanId, timeSlotId, startDate: start, endDate: end, isAutoRenew },
      include: { mealPlan: true, timeSlot: true },
    });

    res.status(201).json({ data: subscription });
  } catch (err) {
    next(err);
  }
}

// Customer: list own subscriptions
export async function listMySubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.user!.id;
    const subscriptions = await prisma.subscription.findMany({
      where: { customerId },
      include: { mealPlan: true, timeSlot: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: subscriptions });
  } catch (err) {
    next(err);
  }
}
