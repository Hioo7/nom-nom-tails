import { NextFunction, Request, Response } from 'express';
import ChefService from '../services/chef.service';
import OrderService from '../services/order.service';
import { parseFulfillOrderBody } from '../validators/order.validator';

const chefService = ChefService.getInstance();
const orderService = OrderService.getInstance();

export async function getTodayOrders(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orders = await chefService.getTodayOrders();
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
}

export async function fulfillOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { handlingNotes } = parseFulfillOrderBody(req.body as object);
    await orderService.fulfillOrder(req.params['id'] as string, handlingNotes);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
