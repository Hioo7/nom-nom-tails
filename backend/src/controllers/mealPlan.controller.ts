import { Request, Response, NextFunction } from 'express';

import MealPlanService from '../services/mealPlan.service';
import { parseCreateMealPlanBody, parseUpdateMealPlanBody } from '../validators/mealPlan.validator';
import AppError from '../lib/AppError';

const mealPlanService = MealPlanService.getInstance();

export async function listMealPlans(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plans = await mealPlanService.listMealPlans();
    res.status(200).json({ data: plans });
  } catch (err) {
    next(err);
  }
}

export async function getMealPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plan = await mealPlanService.getMealPlan(req.params['id'] as string);
    res.status(200).json({ data: plan });
  } catch (err) {
    next(err);
  }
}

export async function createMealPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseCreateMealPlanBody(req.body);
    const plan = await mealPlanService.createMealPlan(input);
    res.status(201).json({ data: plan });
  } catch (err) {
    next(err);
  }
}

export async function updateMealPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = parseUpdateMealPlanBody(req.body);
    const plan = await mealPlanService.updateMealPlan(req.params['id'] as string, input);
    res.status(200).json({ data: plan });
  } catch (err) {
    next(err);
  }
}

export async function deleteMealPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await mealPlanService.deleteMealPlan(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function uploadMealPlanImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      return next(new AppError(400, 'No image file provided'));
    }
    const url = await mealPlanService.uploadImage(req.params['id'] as string, req.file.buffer);
    res.status(200).json({ data: { url } });

  } catch (err) {
    next(err);
  }
}
