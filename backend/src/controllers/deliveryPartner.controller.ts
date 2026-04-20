import { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';
import DeliveryPartnerService from '../services/deliveryPartner.service';
import { parseDeliveryTaskParams } from '../validators/deliveryPartner.validator';

const deliveryPartnerService = DeliveryPartnerService.getInstance();

export async function listDeliveryPartners(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const partners = await deliveryPartnerService.listPartnersWithTodayDeliveries();
    res.status(200).json({ data: partners });
  } catch (err) {
    next(err);
  }
}

export async function listAvailableDeliveryTasks(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tasks = await deliveryPartnerService.listAvailableTasksForPartner();
    res.status(200).json({ data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function listMyDeliveryTasks(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tasks = await deliveryPartnerService.listActiveTasksForPartner(req.user!.id);
    res.status(200).json({ data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function acceptDeliveryTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params = parseDeliveryTaskParams(req.params as object);
    await deliveryPartnerService.acceptTask(params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function completeDeliveryTask(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      return next(new AppError(400, 'Photo is required'));
    }

    const params = parseDeliveryTaskParams(req.params as object);
    await deliveryPartnerService.completeTask(params.id, req.user!.id, req.file.buffer);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
