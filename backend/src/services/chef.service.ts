import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { SafeChefOrder } from '../types/order.types';

type ChefOrderRecord = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    timeSlot: true;
    items: {
      include: {
        dish: true;
      };
    };
  };
}>;

const CHEF_ORDER_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED];

function toOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function toSafeChefOrder(order: ChefOrderRecord): SafeChefOrder {
  return {
    id: order.id,
    orderNumber: toOrderNumber(order.id),
    customerName: order.customer.name,
    deliveryDate: order.deliveryDate,
    status: order.status,
    timeSlot: {
      id: order.timeSlot.id,
      day: order.timeSlot.day,
      startTime: order.timeSlot.startTime,
      endTime: order.timeSlot.endTime,
    },
    dishes: order.items.map((item) => ({
      id: item.id,
      dishId: item.dishId,
      name: item.dish.name,
      description: item.dish.description,
      imageUrl: item.dish.imageUrl ?? null,
      quantity: item.quantity,
    })),
  };
}

class ChefService {
  private static instance: ChefService;

  static getInstance(): ChefService {
    if (!ChefService.instance) {
      ChefService.instance = new ChefService();
    }
    return ChefService.instance;
  }

  async getTodayOrders(): Promise<SafeChefOrder[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        deliveryDate: { gte: start, lte: end },
        status: { in: CHEF_ORDER_STATUSES },
      },
      include: {
        customer: true,
        timeSlot: true,
        items: {
          include: { dish: true },
        },
      },
      orderBy: [{ timeSlot: { startTime: 'asc' } }, { createdAt: 'asc' }],
    });

    return orders.map(toSafeChefOrder);
  }
}

export default ChefService;
