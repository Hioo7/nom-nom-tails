import { z } from 'zod';

export const CustomerParamsSchema = z.object({
  id: z.string().trim().min(1, 'Customer id is required'),
});

export const UpdateCustomerLoyaltySchema = z.object({
  isLoyalty: z.boolean(),
});

export type CustomerParamsInput = z.infer<typeof CustomerParamsSchema>;
export type UpdateCustomerLoyaltyInput = z.infer<typeof UpdateCustomerLoyaltySchema>;
