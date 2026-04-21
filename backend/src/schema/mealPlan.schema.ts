import { z } from 'zod';
import { hasAtMostTwoDecimalPlaces } from '../lib/money';

const PriceSchema = z
  .number()
  .positive('Price must be positive')
  .refine(hasAtMostTwoDecimalPlaces, {
    message: 'Price can have at most 2 decimal places',
  });

export const CreateMealPlanSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().default(''),
  price: PriceSchema,
  imageUrl: z.string().default(''),
  isActive: z.boolean().default(true),
  dishIds: z.array(z.string().min(1)).min(1, 'At least one dish is required'),
});

export const UpdateMealPlanSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    description: z.string().trim().optional(),
    price: PriceSchema.optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean().optional(),
    dishIds: z.array(z.string().min(1)).min(1, 'At least one dish is required').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateMealPlanInput = z.infer<typeof CreateMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof UpdateMealPlanSchema>;
