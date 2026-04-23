import { Request, Response, NextFunction } from 'express';
import MeService from '../services/me.service';
import { parseUpdateMeBody } from '../validators/me.validator';

const meService = MeService.getInstance();

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await meService.getMe(req.user!.id);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseUpdateMeBody(req.body);
    const user = await meService.updateMe(req.user!.id, input);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}
