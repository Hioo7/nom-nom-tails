import { Request, Response, NextFunction } from 'express';
import IngredientService from '../services/ingredient.service';
import {
  parseAdjustIngredientStockBody,
  parseCreateIngredientBody,
  parseUpdateIngredientBody,
} from '../validators/ingredient.validator';

const ingredientService = IngredientService.getInstance();

export async function listIngredients(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ingredients = await ingredientService.listIngredients();
    res.status(200).json({ data: ingredients });
  } catch (err) {
    next(err);
  }
}

export async function createIngredient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseCreateIngredientBody(req.body as object);
    const ingredient = await ingredientService.createIngredient(input);
    res.status(201).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
}

export async function updateIngredient(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseUpdateIngredientBody(req.body as object);
    const ingredient = await ingredientService.updateIngredient(req.params['id'] as string, input);
    res.status(200).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
}

export async function increaseIngredientStock(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseAdjustIngredientStockBody(req.body as object);
    const ingredient = await ingredientService.increaseStock(req.params['id'] as string, input);
    res.status(200).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
}

export async function decreaseIngredientStock(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseAdjustIngredientStockBody(req.body as object);
    const ingredient = await ingredientService.decreaseStock(req.params['id'] as string, input);
    res.status(200).json({ data: ingredient });
  } catch (err) {
    next(err);
  }
}
