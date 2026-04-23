import { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';
import CustomerTimeSlotService from '../services/customerTimeSlot.service';

const customerTimeSlotService = CustomerTimeSlotService.getInstance();

export async function getOrderTimeSlots(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const date = req.query['date'];
    if (typeof date !== 'string' || !date) {
      throw new AppError(400, 'date query parameter is required (YYYY-MM-DD)');
    }
    const slots = await customerTimeSlotService.listForOrderDate(date);
    res.status(200).json({ data: slots });
  } catch (err) {
    next(err);
  }
}

export async function getSubscriptionTimeSlots(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const date = req.query['date'];
    if (typeof date !== 'string' || !date) {
      throw new AppError(400, 'date query parameter is required (YYYY-MM-DD)');
    }
    const slots = await customerTimeSlotService.listForSubscriptionDate(date);
    res.status(200).json({ data: slots });
  } catch (err) {
    next(err);
  }
}
