import { LoginSchema, LoginInput } from '../schema/auth.schema';
import { parseBody } from './validate';

export function parseLoginBody(body: unknown): LoginInput {
  return parseBody(LoginSchema, body);
}
