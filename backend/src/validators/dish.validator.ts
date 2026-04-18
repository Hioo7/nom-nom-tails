import {
  CreateDishSchema,
  UpdateDishSchema,
  CreateDishInput,
  UpdateDishInput,
} from '../schema/dish.schema';
import { parseBody } from './validate';

export function parseCreateDishBody(body: unknown): CreateDishInput {
  return parseBody(CreateDishSchema, body);
}

export function parseUpdateDishBody(body: unknown): UpdateDishInput {
  return parseBody(UpdateDishSchema, body);
}
