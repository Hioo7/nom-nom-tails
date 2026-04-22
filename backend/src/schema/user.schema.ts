import { z } from 'zod';
import { Role } from '@prisma/client';

const staffRoles = [Role.ADMIN, Role.DELIVERY_PARTNER] as const;
const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number must be at least 7 characters')
  .max(20, 'Phone number must be 20 characters or fewer')
  .regex(/^\+?[0-9\s()-]+$/, 'Phone number must contain only digits and dialer symbols');

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: phoneSchema.optional(),
  role: z.enum(staffRoles, { error: 'Role must be ADMIN or DELIVERY_PARTNER' }),
});

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z.string().trim().pipe(z.email()).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: phoneSchema.optional(),
  role: z.enum(staffRoles, { error: 'Role must be ADMIN or DELIVERY_PARTNER' }).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
