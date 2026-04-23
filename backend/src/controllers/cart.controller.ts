import { Request, Response, NextFunction } from 'express';
import CartService from '../services/cart.service';
import { parseBody } from '../validators/validate';
import { UpsertCartItemSchema, SyncCartSchema } from '../schema/cart.schema';

const cartService = CartService.getInstance();

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await cartService.getCart(req.user!.id);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
}

export async function upsertItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseBody(UpsertCartItemSchema, req.body);
    const item = await cartService.upsertItem(req.user!.id, input);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.removeItem(req.user!.id, String(req.params.dishId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await cartService.clearCart(req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function syncCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseBody(SyncCartSchema, req.body);
    const items = await cartService.syncCart(req.user!.id, input);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
}
