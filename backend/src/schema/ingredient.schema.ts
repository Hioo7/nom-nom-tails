import { z } from 'zod';

export const CreateIngredientSchema = z.object({
  name: z.string().trim().min(1, 'Ingredient name is required'),
  unit: z.string().trim().min(1, 'Unit is required'),
  availableQty: z.number().min(0).default(0),
});

export type CreateIngredientInput = z.infer<typeof CreateIngredientSchema>;
