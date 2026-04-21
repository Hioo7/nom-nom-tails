import { Request, Response, NextFunction } from 'express';

import DishService from '../services/dish.service';
import { parseCreateDishBody, parseUpdateDishBody } from '../validators/dish.validator';
import AppError from '../lib/AppError';

const dishService = DishService.getInstance();

export async function listDishes(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dishes = await dishService.listDishes();
    res.status(200).json({ data: dishes });
  } catch (err) {
    next(err);
  }
}

export async function getDish(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dish = await dishService.getDish(req.params['id'] as string);
    res.status(200).json({ data: dish });
  } catch (err) {
    next(err);
  }
}

export async function createDish(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseCreateDishBody(req.body);
    const dish = await dishService.createDish(input);
    res.status(201).json({ data: dish });
  } catch (err) {
    next(err);
  }
}

export async function updateDish(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseUpdateDishBody(req.body);
    const dish = await dishService.updateDish(req.params['id'] as string, input);
    res.status(200).json({ data: dish });
  } catch (err) {
    next(err);
  }
}

export async function deleteDish(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await dishService.deleteDish(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function uploadDishImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      return next(new AppError(400, 'No image file provided'));
    }
    const url = await dishService.uploadImage(
      req.params['id'] as string,
      req.file.buffer,
    );
    res.status(200).json({ data: { url } });

  } catch (err) {
    next(err);
  }
}
