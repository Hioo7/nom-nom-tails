import { z } from 'zod';

export const DeliveryTaskParamsSchema = z.object({
  id: z.string().trim().min(1, 'Task id is required'),
});

export type DeliveryTaskParamsInput = z.infer<typeof DeliveryTaskParamsSchema>;
