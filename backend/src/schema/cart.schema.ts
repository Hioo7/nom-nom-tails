import { z } from 'zod';

export const UpsertCartItemSchema = z.object({
  dishId: z.string().cuid(),
  quantity: z.number().int().min(1),
});

export type UpsertCartItemInput = z.infer<typeof UpsertCartItemSchema>;

export const SyncCartSchema = z.object({
  items: z.array(UpsertCartItemSchema),
});

export type SyncCartInput = z.infer<typeof SyncCartSchema>;
