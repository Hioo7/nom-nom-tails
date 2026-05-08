import {
  FulfillOrderInput,
  FulfillOrderSchema,
  RecordSettlementPaymentInput,
  RecordSettlementPaymentSchema,
} from '../schema/order.schema';
import { parseBody } from './validate';

export function parseRecordSettlementPaymentBody(
  body: object,
): RecordSettlementPaymentInput {
  return parseBody(RecordSettlementPaymentSchema, body);
}

export function parseFulfillOrderBody(body: object): FulfillOrderInput {
  return parseBody(FulfillOrderSchema, body);
}
