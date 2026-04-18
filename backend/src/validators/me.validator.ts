import { UpdateMeSchema, UpdateMeInput } from '../schema/me.schema';
import { parseBody } from './validate';

export function parseUpdateMeBody(body: unknown): UpdateMeInput {
  return parseBody(UpdateMeSchema, body);
}
