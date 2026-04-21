import { z } from 'zod';
import { hasAtMostTwoDecimalPlaces } from '../lib/money';

const PriceSchema = z
  .number()
  .positive('Price must be positive')
  .refine(hasAtMostTwoDecimalPlaces, {
    message: 'Price can have at most 2 decimal places',
  });

export const IngredientInputSchema = z.object({
  ingredientId: z.string().min(1, 'Ingredient is required'),
  quantity: z.number().positive('Quantity must be positive'),
});

export const CreateDishSchema = z.object({
  name: z.string().trim().min(1, 'Dish name is required'),
  description: z.string().trim().default(''),
  price: PriceSchema,
  imageUrl: z.string().url('Invalid image URL').optional(),
  isActive: z.boolean().default(true),
  ingredients: z.array(IngredientInputSchema).min(1, 'At least one ingredient is required'),
});

export const UpdateDishSchema = z
  .object({
    name: z.string().trim().min(1, 'Dish name is required').optional(),
    description: z.string().trim().optional(),
    price: PriceSchema.optional(),
    imageUrl: z.string().url('Invalid image URL').nullable().optional(),
    isActive: z.boolean().optional(),
    ingredients: z
      .array(IngredientInputSchema)
      .min(1, 'At least one ingredient is required')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type IngredientInput = z.infer<typeof IngredientInputSchema>;
export type CreateDishInput = z.infer<typeof CreateDishSchema>;
export type UpdateDishInput = z.infer<typeof UpdateDishSchema>;
