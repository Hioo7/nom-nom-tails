import { Request, Response, NextFunction } from 'express';
import RegisterService from '../services/register.service';
import { RegisterSchema } from '../schema/register.schema';
import AppError from '../lib/AppError';

const registerService = RegisterService.getInstance();

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }
    const result = await registerService.register(parsed.data);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}
