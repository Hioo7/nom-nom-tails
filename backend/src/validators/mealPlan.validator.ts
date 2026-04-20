import {
  CreateMealPlanSchema,
  UpdateMealPlanSchema,
  CreateMealPlanInput,
  UpdateMealPlanInput,
} from '../schema/mealPlan.schema';
import { parseBody } from './validate';

export function parseCreateMealPlanBody(body: unknown): CreateMealPlanInput {
  return parseBody(CreateMealPlanSchema, body);
}

export function parseUpdateMealPlanBody(body: unknown): UpdateMealPlanInput {
  return parseBody(UpdateMealPlanSchema, body);
}
