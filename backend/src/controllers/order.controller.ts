import { NextFunction, Request, Response } from 'express';
import OrderService from '../services/order.service';
import { parseFulfillOrderBody, parseRecordSettlementPaymentBody } from '../validators/order.validator';

const orderService = OrderService.getInstance();

export async function listUpcomingOrders(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const orders = await orderService.listUpcomingOrders();
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrderDetails(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const order = await orderService.getOrderDetails(req.params['id'] as string);
    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingProcurementSummary(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await orderService.getUpcomingProcurementSummary();
    res.status(200).json({ data: summary });
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

export async function approveOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await orderService.approveOrder(req.params['id'] as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function rejectOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await orderService.rejectOrder(req.params['id'] as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listPendingSettlements(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settlements = await orderService.listPendingSettlements();
    res.status(200).json({ data: settlements });
  } catch (error) {
    next(error);
  }
}

export async function recordSettlementPayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseRecordSettlementPaymentBody(req.body as object);
    const settlement = await orderService.recordSettlementPayment(
      req.params['id'] as string,
      input,
    );
    res.status(200).json({ data: settlement });
  } catch (error) {
    next(error);
  }
}
