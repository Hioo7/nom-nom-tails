import { z } from 'zod';

export const CreateCustomerOrderSchema = z.object({
  items: z
    .array(
      z.object({
        dishId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, 'Order must have at least one item'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  addressId: z.string().min(1, 'Delivery address is required'),
  timeSlotId: z.string().min(1, 'Time slot is required'),
});

export type CreateCustomerOrderInput = z.infer<typeof CreateCustomerOrderSchema>;
