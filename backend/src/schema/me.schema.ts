import { z } from 'zod';

export const UpdateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;

export const UpdateMeSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    email: z.string().trim().pipe(z.email()).optional(),
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
