import { TimeSlot } from '@prisma/client';
import AppError from '../lib/AppError';
import { JS_DAY_TO_DOW, addDays, parseDateLocal } from '../lib/dateUtils';
import prisma from '../lib/prisma';

const SUBSCRIPTION_BUFFER_DAYS = 3;

class CustomerTimeSlotService {
  private static instance: CustomerTimeSlotService;

  static getInstance(): CustomerTimeSlotService {
    if (!CustomerTimeSlotService.instance) {
      CustomerTimeSlotService.instance = new CustomerTimeSlotService();
    }
    return CustomerTimeSlotService.instance;
  }

  async listForOrderDate(dateStr: string): Promise<TimeSlot[]> {
    const deliveryDate = parseDateLocal(dateStr);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    if (deliveryDate < todayMidnight) {
      throw new AppError(400, 'Delivery date cannot be in the past');
    }

    const targetDow = JS_DAY_TO_DOW[deliveryDate.getDay()];
    const slots = await prisma.timeSlot.findMany({
      where: { isActive: true, day: targetDow },
      orderBy: { startTime: 'asc' },
    });

    const isToday = deliveryDate.getTime() === todayMidnight.getTime();
    if (!isToday) return slots;

    const now = new Date();
    return slots.filter((slot) => {
      const [h, m] = slot.startTime.split(':').map(Number);
      const slotStart = new Date();
      slotStart.setHours(h, m, 0, 0);
      return now < slotStart;
    });
  }

  async listForSubscriptionDate(dateStr: string): Promise<TimeSlot[]> {
    const deliveryDate = parseDateLocal(dateStr);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const minDate = addDays(todayMidnight, SUBSCRIPTION_BUFFER_DAYS);

    if (deliveryDate < minDate) {
      throw new AppError(
        400,
        `Subscription start date must be at least ${SUBSCRIPTION_BUFFER_DAYS} days from today`,
      );
    }

    const targetDow = JS_DAY_TO_DOW[deliveryDate.getDay()];
    return prisma.timeSlot.findMany({
      where: { isActive: true, day: targetDow },
      orderBy: { startTime: 'asc' },
    });
  }
}

export default CustomerTimeSlotService;
