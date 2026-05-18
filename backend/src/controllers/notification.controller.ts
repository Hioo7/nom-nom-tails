import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/notification.service';

const notificationService = NotificationService.getInstance();

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await notificationService.listForUser(req.user!.id);
    res.status(200).json({ data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.status(200).json({ data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllRead(req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
