import { CreateUserSchema, UpdateUserSchema, CreateUserInput, UpdateUserInput } from '../schema/user.schema';
import { parseBody } from './validate';

export function parseCreateUserBody(body: unknown): CreateUserInput {
  return parseBody(CreateUserSchema, body);
}

export function parseUpdateUserBody(body: unknown): UpdateUserInput {
  return parseBody(UpdateUserSchema, body);
}
