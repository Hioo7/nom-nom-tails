import { z } from 'zod';

export const CreateSubscriptionSchema = z.object({
  mealPlanId: z.string().min(1, 'Meal plan is required'),
  timeSlotId: z.string().min(1, 'Time slot is required'),
  addressId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isAutoRenew: z.boolean().default(false),
});

export const RenewSubscriptionSchema = z.object({
  addressId: z.string().min(1, 'Delivery address is required'),
});

export const ListSubscriptionsQuerySchema = z.object({
  mealPlanId: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type RenewSubscriptionInput = z.infer<typeof RenewSubscriptionSchema>;
export type ListSubscriptionsQueryInput = z.infer<typeof ListSubscriptionsQuerySchema>;
