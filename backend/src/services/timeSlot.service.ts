import { DayOfWeek, Prisma } from '@prisma/client';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { CreateTimeSlotInput, UpdateTimeSlotInput } from '../schema/timeSlot.schema';
import { SafeTimeSlot } from '../types/timeSlot.types';

type TimeSlotRecord = Prisma.TimeSlotGetPayload<Record<string, never>>;

function toSafeTimeSlot(slot: TimeSlotRecord): SafeTimeSlot {
  return {
    id: slot.id,
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isActive: slot.isActive,
    createdAt: slot.createdAt,
    updatedAt: slot.updatedAt,
  };
}

class TimeSlotService {
  private static instance: TimeSlotService;

  static getInstance(): TimeSlotService {
    if (!TimeSlotService.instance) {
      TimeSlotService.instance = new TimeSlotService();
    }
    return TimeSlotService.instance;
  }

  async listByDay(day: DayOfWeek): Promise<SafeTimeSlot[]> {
    const slots = await prisma.timeSlot.findMany({
      where: { day },
      orderBy: { startTime: 'asc' },
    });
    return slots.map(toSafeTimeSlot);
  }

  async getTimeSlot(id: string): Promise<SafeTimeSlot> {
    return this.findOrThrow(id);
  }

  async createTimeSlot(data: CreateTimeSlotInput): Promise<SafeTimeSlot> {
    this.assertStartBeforeEnd(data.startTime, data.endTime);
    await this.assertNoDuplicate(data.day, data.startTime, data.endTime);
    const slot = await prisma.timeSlot.create({ data });
    return toSafeTimeSlot(slot);
  }

  async updateTimeSlot(id: string, data: UpdateTimeSlotInput): Promise<SafeTimeSlot> {
    const existing = await this.findOrThrow(id);

    const newStart = data.startTime ?? existing.startTime;
    const newEnd = data.endTime ?? existing.endTime;
    this.assertStartBeforeEnd(newStart, newEnd);
    await this.assertNoDuplicate(existing.day, newStart, newEnd, id);

    const slot = await prisma.timeSlot.update({ where: { id }, data });
    return toSafeTimeSlot(slot);
  }

  async deleteTimeSlot(id: string): Promise<void> {
    await this.findOrThrow(id);
    const orderCount = await prisma.order.count({ where: { timeSlotId: id } });
    if (orderCount > 0) {
      throw new AppError(409, 'Cannot delete a time slot that has associated orders');
    }
    const subscriptionCount = await prisma.subscription.count({ where: { timeSlotId: id } });
    if (subscriptionCount > 0) {
      throw new AppError(409, 'Cannot delete a time slot that has associated subscriptions');
    }
    await prisma.timeSlot.delete({ where: { id } });
  }

  private async findOrThrow(id: string): Promise<SafeTimeSlot> {
    const slot = await prisma.timeSlot.findUnique({ where: { id } });
    if (!slot) throw new AppError(404, 'Time slot not found');
    return toSafeTimeSlot(slot);
  }

  private assertStartBeforeEnd(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new AppError(400, 'Start time must be before end time');
    }
  }

  private async assertNoDuplicate(
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await prisma.timeSlot.findFirst({
      where: { day, startTime, endTime, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (existing) {
      throw new AppError(409, 'A time slot with these times already exists for this day');
    }
  }
}

export default TimeSlotService;
