import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { parseLoginBody } from '../validators/auth.validator';

const authService = AuthService.getInstance();

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseLoginBody(req.body);
    const result = await authService.login(input);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
