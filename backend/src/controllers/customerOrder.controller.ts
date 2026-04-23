import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { CreateCustomerOrderSchema } from '../schema/customerOrder.schema';
import AppError from '../lib/AppError';

const JS_DAY_TO_DOW: Record<number, string> = {
  0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
  4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
};

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.user!.id;

    const parsed = CreateCustomerOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { items, deliveryDate, addressId, timeSlotId } = parsed.data;

    // Delivery date must not be in the past
    const [y, m, d] = deliveryDate.split('-').map(Number);
    const deliveryDateObj = new Date(y, m - 1, d);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (deliveryDateObj < todayMidnight) {
      throw new AppError(400, 'Delivery date cannot be in the past');
    }

    // Verify the address belongs to this customer and is a proper delivery address
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== customerId) {
      throw new AppError(404, 'Address not found');
    }
    if (address.isCurrentLocation) {
      throw new AppError(400, 'Please select a saved delivery address, not a GPS location');
    }

    // Fetch the customer-selected time slot
    const timeSlot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!timeSlot || !timeSlot.isActive) {
      throw new AppError(404, 'Time slot not found or unavailable');
    }

    // Delivery date's day-of-week must match the slot's day
    if (JS_DAY_TO_DOW[deliveryDateObj.getDay()] !== timeSlot.day) {
      throw new AppError(400, 'Selected time slot is not available on that delivery date');
    }

    // Same-day validation: slot must not have started yet
    let isSameDay = false;
    if (deliveryDateObj.getTime() === todayMidnight.getTime()) {
      const [slotH, slotM] = timeSlot.startTime.split(':').map(Number);
      const slotStart = new Date();
      slotStart.setHours(slotH, slotM, 0, 0);
      if (new Date() >= slotStart) {
        throw new AppError(400, 'This time slot has already passed for today');
      }
      isSameDay = true;
    }

    // Validate all dishes exist and are active
    const dishIds = items.map((i) => i.dishId);
    const dishes = await prisma.dish.findMany({ where: { id: { in: dishIds }, isActive: true } });
    if (dishes.length !== dishIds.length) {
      throw new AppError(400, 'One or more items are unavailable');
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        timeSlotId: timeSlot.id,
        status: isSameDay ? OrderStatus.AWAITING_APPROVAL : OrderStatus.CONFIRMED,
        deliveryDate: new Date(deliveryDate),
        deliveryFullName: address.fullName ?? '',
        deliveryPhone: address.phone ?? '',
        deliveryLine1: address.line1 ?? '',
        deliveryLine2: address.line2 ?? null,
        deliveryCity: address.city ?? '',
        deliveryState: address.state ?? '',
        deliveryPin: address.pin ?? '',
        deliveryLat: address.lat ?? null,
        deliveryLng: address.lng ?? null,
        deliveryAddressType: address.type,
        items: {
          create: items.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
          })),
        },
        settlement: {
          create: {
            totalAmount: dishes.reduce((sum, dish) => {
              const item = items.find((i) => i.dishId === dish.id)!;
              return sum + dish.price * item.quantity;
            }, 0),
          },
        },
      },
      include: {
        items: { include: { dish: true } },
        settlement: true,
      },
    });

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.user!.id;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { dish: true } },
        settlement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
}
