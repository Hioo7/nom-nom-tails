import { z } from 'zod';

const AddressTypeEnum = z.enum(['HOME', 'WORK', 'OTHER']);

export const CreateAddressSchema = z.object({
  type: AddressTypeEnum.default('HOME'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  line1: z.string().trim().min(1, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pin: z.string().trim().min(1, 'PIN code is required'),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
