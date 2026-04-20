import {
  DeliveryTaskParamsInput,
  DeliveryTaskParamsSchema,
} from '../schema/deliveryPartner.schema';
import { parseBody } from './validate';

export function parseDeliveryTaskParams(params: object): DeliveryTaskParamsInput {
  return parseBody(DeliveryTaskParamsSchema, params);
}
