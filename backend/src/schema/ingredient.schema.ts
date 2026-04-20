import { z } from 'zod';

export const CreateIngredientSchema = z.object({
  name: z.string().trim().min(1, 'Ingredient name is required'),
  unit: z.string().trim().min(1, 'Unit is required'),
  availableQty: z.number().min(0).default(0),
});

export const UpdateIngredientSchema = z
  .object({
    name: z.string().trim().min(1, 'Ingredient name is required').optional(),
    unit: z.string().trim().min(1, 'Unit is required').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const AdjustIngredientStockSchema = z.object({
  quantity: z.number().positive('Quantity must be greater than zero'),
});

export type CreateIngredientInput = z.infer<typeof CreateIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof UpdateIngredientSchema>;
export type AdjustIngredientStockInput = z.infer<typeof AdjustIngredientStockSchema>;
