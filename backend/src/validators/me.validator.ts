import { UpdateMeSchema, UpdateMeInput, UpdateLocationSchema, UpdateLocationInput } from '../schema/me.schema';
import { parseBody } from './validate';

export function parseUpdateMeBody(body: unknown): UpdateMeInput {
  return parseBody(UpdateMeSchema, body);
}

export function parseUpdateLocationBody(body: unknown): UpdateLocationInput {
  return parseBody(UpdateLocationSchema, body);
}
