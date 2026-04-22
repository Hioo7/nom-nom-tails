import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { CreateCustomerOrderSchema } from '../schema/customerOrder.schema';
import AppError from '../lib/AppError';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.user!.id;

    const parsed = CreateCustomerOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0].message);
    }

    const { items, deliveryDate, addressId } = parsed.data;

    // Verify the address belongs to this customer
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== customerId) {
      throw new AppError(404, 'Address not found');
    }

    // Pick first active time slot
    const timeSlot = await prisma.timeSlot.findFirst({ where: { isActive: true } });
    if (!timeSlot) {
      throw new AppError(503, 'No delivery time slots available at the moment');
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
        deliveryDate: new Date(deliveryDate),
        deliveryFullName: address.fullName,
        deliveryPhone: address.phone,
        deliveryLine1: address.line1,
        deliveryLine2: address.line2,
        deliveryCity: address.city,
        deliveryState: address.state,
        deliveryPin: address.pin,
        deliveryLat: address.lat,
        deliveryLng: address.lng,
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
