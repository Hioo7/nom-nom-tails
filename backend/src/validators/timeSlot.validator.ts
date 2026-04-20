import {
  CreateTimeSlotSchema,
  UpdateTimeSlotSchema,
  ListTimeSlotsByDaySchema,
  CreateTimeSlotInput,
  UpdateTimeSlotInput,
  ListTimeSlotsByDayInput,
} from '../schema/timeSlot.schema';
import { parseBody } from './validate';

export function parseCreateTimeSlotBody(body: unknown): CreateTimeSlotInput {
  return parseBody(CreateTimeSlotSchema, body);
}

export function parseUpdateTimeSlotBody(body: unknown): UpdateTimeSlotInput {
  return parseBody(UpdateTimeSlotSchema, body);
}

export function parseListTimeSlotsByDayQuery(query: unknown): ListTimeSlotsByDayInput {
  return parseBody(ListTimeSlotsByDaySchema, query);
}
