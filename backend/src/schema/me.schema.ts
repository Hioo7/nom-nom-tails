import { z } from 'zod';

export const UpdateMeSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    email: z.string().trim().pipe(z.email()).optional(),
    phone: z.string().trim().refine((v) => /^\+?[\d\s\-()\\.]{7,20}$/.test(v), 'Invalid phone number').optional().nullable(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: 'currentPassword is required when setting a new password', path: ['currentPassword'] },
  )
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;
