import { z } from 'zod';
import { DayOfWeek } from '@prisma/client';

const dayValues = Object.values(DayOfWeek) as [DayOfWeek, ...DayOfWeek[]];
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CreateTimeSlotSchema = z.object({
  day: z.enum(dayValues),
  startTime: z.string().regex(timePattern, 'startTime must be in HH:mm format'),
  endTime: z.string().regex(timePattern, 'endTime must be in HH:mm format'),
  isActive: z.boolean().default(true),
});

export const UpdateTimeSlotSchema = z
  .object({
    startTime: z.string().regex(timePattern, 'startTime must be in HH:mm format').optional(),
    endTime: z.string().regex(timePattern, 'endTime must be in HH:mm format').optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const ListTimeSlotsByDaySchema = z.object({
  day: z.enum(dayValues),
});

export type CreateTimeSlotInput = z.infer<typeof CreateTimeSlotSchema>;
export type UpdateTimeSlotInput = z.infer<typeof UpdateTimeSlotSchema>;
export type ListTimeSlotsByDayInput = z.infer<typeof ListTimeSlotsByDaySchema>;
