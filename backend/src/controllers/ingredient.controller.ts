import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CreateIngredientSchema } from '../schema/ingredient.schema';
import AppError from '../lib/AppError';

export async function listIngredients(_req: Request, res: Response): Promise<void> {
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true, unit: true, availableQty: true },
    orderBy: { name: 'asc' },
  });
  res.json({ data: ingredients });
}

export async function createIngredient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = CreateIngredientSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(422, parsed.error.issues.map((i) => i.message).join(', '));
    }
    const { name, unit, availableQty } = parsed.data;
    const ingredient = await prisma.ingredient.create({
      data: { name, unit, availableQty },
      select: { id: true, name: true, unit: true, availableQty: true },
    });
    res.status(201).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
}
