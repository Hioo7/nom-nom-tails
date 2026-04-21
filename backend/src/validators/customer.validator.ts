import {
  CustomerParamsInput,
  CustomerParamsSchema,
  UpdateCustomerLoyaltyInput,
  UpdateCustomerLoyaltySchema,
} from '../schema/customer.schema';
import { parseBody } from './validate';

export function parseCustomerParams(params: object): CustomerParamsInput {
  return CustomerParamsSchema.parse(params);
}

export function parseUpdateCustomerLoyaltyBody(body: unknown): UpdateCustomerLoyaltyInput {
  return parseBody(UpdateCustomerLoyaltySchema, body);
}
