import {
  CreateSubscriptionInput,
  CreateSubscriptionSchema,
  RenewSubscriptionInput,
  RenewSubscriptionSchema,
} from '../schema/subscription.schema';
import { parseBody } from './validate';

export function parseCreateSubscriptionBody(body: object): CreateSubscriptionInput {
  return parseBody(CreateSubscriptionSchema, body);
}

export function parseRenewSubscriptionBody(body: object): RenewSubscriptionInput {
  return parseBody(RenewSubscriptionSchema, body);
}
