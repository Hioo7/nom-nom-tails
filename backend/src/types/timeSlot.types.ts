import { DayOfWeek } from '@prisma/client';

export interface SafeTimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
