import {
  AdjustIngredientStockInput,
  AdjustIngredientStockSchema,
  CreateIngredientInput,
  CreateIngredientSchema,
  UpdateIngredientInput,
  UpdateIngredientSchema,
} from '../schema/ingredient.schema';
import { parseBody } from './validate';

export function parseCreateIngredientBody(body: object): CreateIngredientInput {
  return parseBody(CreateIngredientSchema, body);
}

export function parseUpdateIngredientBody(body: object): UpdateIngredientInput {
  return parseBody(UpdateIngredientSchema, body);
}

export function parseAdjustIngredientStockBody(body: object): AdjustIngredientStockInput {
  return parseBody(AdjustIngredientStockSchema, body);
}
