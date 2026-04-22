import { z } from 'zod';

export const DeliveryTaskParamsSchema = z.object({
  id: z.string().trim().min(1, 'Task id is required'),
});

export type DeliveryTaskParamsInput = z.infer<typeof DeliveryTaskParamsSchema>;

export const FailDeliveryTaskBodySchema = z.object({
  failureReason: z
    .string()
    .trim()
    .min(1, 'Failure note is required')
    .max(250, 'Failure note must be 250 characters or fewer'),
});

export type FailDeliveryTaskBodyInput = z.infer<typeof FailDeliveryTaskBodySchema>;
