import {
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  Prisma,
  SettlementStatus,
} from '@prisma/client';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { RecordSettlementPaymentInput } from '../schema/order.schema';
import {
  SafeOrderDetails,
  SafeProcurementItem,
  SafeProcurementSummary,
  SafeSettlementOrder,
  SafeSettlementPayment,
  SafeUpcomingOrder,
} from '../types/order.types';

type UpcomingOrderRecord = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    timeSlot: true;
    items: true;
  };
}>;

type OrderDetailRecord = Prisma.OrderGetPayload<{
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

type UpcomingProcurementOrderRecord = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        dish: {
          include: {
            ingredients: {
              include: {
                ingredient: true;
              };
            };
          };
        };
      };
    };
  };
}>;

type SettlementRecord = Prisma.SettlementGetPayload<{
  include: {
    order: {
      include: {
        customer: true;
        timeSlot: true;
      };
    };
    payments: true;
  };
}>;

interface IngredientAggregation {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredQty: number;
  availableQty: number;
}

const UPCOMING_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

function roundQuantity(value: number): number {
  return Number(value.toFixed(3));
}

function getUpcomingWindow(referenceDate: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getTodayWindow(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isWithinUpcomingWindow(deliveryDate: Date, referenceDate: Date = new Date()): boolean {
  const { start, end } = getUpcomingWindow(referenceDate);
  return deliveryDate >= start && deliveryDate <= end;
}

function toOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function toItemCount(items: { quantity: number }[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function toSafeUpcomingOrder(order: UpcomingOrderRecord): SafeUpcomingOrder {
  return {
    id: order.id,
    orderNumber: toOrderNumber(order.id),
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    deliveryDate: order.deliveryDate,
    itemCount: toItemCount(order.items),
    status: order.status,
    timeSlot: {
      id: order.timeSlot.id,
      day: order.timeSlot.day,
      startTime: order.timeSlot.startTime,
      endTime: order.timeSlot.endTime,
    },
  };
}

function toSafeOrderDetails(order: OrderDetailRecord): SafeOrderDetails {
  return {
    id: order.id,
    orderNumber: toOrderNumber(order.id),
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    deliveryDate: order.deliveryDate,
    itemCount: toItemCount(order.items),
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

function toSafeSettlementPayment(payment: {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  note: string | null;
}): SafeSettlementPayment {
  return {
    id: payment.id,
    amount: payment.amount,
    method: payment.method,
    paidAt: payment.paidAt,
    note: payment.note,
  };
}

function toSafeSettlementOrder(settlement: SettlementRecord): SafeSettlementOrder {
  return {
    orderId: settlement.orderId,
    orderNumber: toOrderNumber(settlement.orderId),
    customerName: settlement.order.customer.name,
    customerEmail: settlement.order.customer.email,
    customerPhone: settlement.order.deliveryPhone,
    deliveryDate: settlement.order.deliveryDate,
    status: settlement.status,
    totalAmount: settlement.totalAmount,
    paidAmount: settlement.paidAmount,
    balanceAmount: Math.max(settlement.totalAmount - settlement.paidAmount, 0),
    timeSlot: {
      id: settlement.order.timeSlot.id,
      day: settlement.order.timeSlot.day,
      startTime: settlement.order.timeSlot.startTime,
      endTime: settlement.order.timeSlot.endTime,
    },
    payments: settlement.payments
      .slice()
      .sort((left, right) => right.paidAt.getTime() - left.paidAt.getTime())
      .map(toSafeSettlementPayment),
  };
}

function aggregateProcurementRequirements(
  orders: UpcomingProcurementOrderRecord[],
): IngredientAggregation[] {
  const ingredientMap = new Map<string, IngredientAggregation>();

  for (const order of orders) {
    for (const item of order.items) {
      for (const dishIngredient of item.dish.ingredients) {
        const requiredQty = roundQuantity((dishIngredient.quantity / 1000) * item.quantity);
        const current = ingredientMap.get(dishIngredient.ingredientId);

        if (current) {
          current.requiredQty = roundQuantity(current.requiredQty + requiredQty);
          continue;
        }

        ingredientMap.set(dishIngredient.ingredientId, {
          ingredientId: dishIngredient.ingredientId,
          ingredientName: dishIngredient.ingredient.name,
          unit: dishIngredient.ingredient.unit,
          requiredQty,
          availableQty: roundQuantity(dishIngredient.ingredient.availableQty),
        });
      }
    }
  }

  return Array.from(ingredientMap.values()).sort((left, right) =>
    left.ingredientName.localeCompare(right.ingredientName),
  );
}

class OrderService {
  private static instance: OrderService;

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }

    return OrderService.instance;
  }

  async listUpcomingOrders(): Promise<SafeUpcomingOrder[]> {
    const { start: upcomingStart, end: upcomingEnd } = getUpcomingWindow();
    const { start: todayStart, end: todayEnd } = getTodayWindow();

    const include = { customer: true, timeSlot: true, items: true } as const;
    const orderBy = [{ deliveryDate: 'asc' as const }, { createdAt: 'asc' as const }];

    const [regularOrders, todayOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          deliveryDate: { gte: upcomingStart, lte: upcomingEnd },
          status: { in: UPCOMING_ORDER_STATUSES },
        },
        include,
        orderBy,
      }),
      prisma.order.findMany({
        where: {
          deliveryDate: { gte: todayStart, lte: todayEnd },
          status: { in: [OrderStatus.AWAITING_APPROVAL, OrderStatus.CONFIRMED] },
        },
        include,
        orderBy,
      }),
    ]);

    return [...todayOrders, ...regularOrders].map(toSafeUpcomingOrder);
  }

  async getOrderDetails(orderId: string): Promise<SafeOrderDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        timeSlot: true,
        items: {
          include: {
            dish: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    return toSafeOrderDetails(order);
  }

  async getUpcomingProcurementSummary(): Promise<SafeProcurementSummary> {
    const { start: upcomingStart, end: upcomingEnd } = getUpcomingWindow();
    const { start: todayStart, end: todayEnd } = getTodayWindow();

    const include = {
      items: {
        include: {
          dish: {
            include: {
              ingredients: { include: { ingredient: true } },
            },
          },
        },
      },
    } as const;

    const [regularOrders, todayApprovedOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          deliveryDate: { gte: upcomingStart, lte: upcomingEnd },
          status: { in: UPCOMING_ORDER_STATUSES },
        },
        include,
      }),
      prisma.order.findMany({
        where: {
          deliveryDate: { gte: todayStart, lte: todayEnd },
          status: OrderStatus.CONFIRMED,
        },
        include,
      }),
    ]);

    const allOrders = [...todayApprovedOrders, ...regularOrders];
    const items: SafeProcurementItem[] = aggregateProcurementRequirements(allOrders).map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      unit: item.unit,
      requiredQty: item.requiredQty,
      availableQty: item.availableQty,
      procurementQty: roundQuantity(Math.max(item.requiredQty - item.availableQty, 0)),
    }));

    return {
      orderCount: allOrders.length,
      items,
    };
  }

  async fulfillOrder(orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              dish: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new AppError(404, 'Order not found');
      }

      const { start: todayStart, end: todayEnd } = getTodayWindow();
      const isTodayOrder = order.deliveryDate >= todayStart && order.deliveryDate <= todayEnd;
      if (!isTodayOrder && !isWithinUpcomingWindow(order.deliveryDate)) {
        throw new AppError(400, 'Only upcoming orders can be fulfilled here');
      }

      if (!UPCOMING_ORDER_STATUSES.includes(order.status)) {
        throw new AppError(400, 'Order is already fulfilled or cannot be fulfilled');
      }

      const requiredIngredients = aggregateProcurementRequirements([order]);
      const shortages = requiredIngredients.filter(
        (ingredient) => ingredient.requiredQty > ingredient.availableQty,
      );

      if (shortages.length > 0) {
        const ingredientNames = shortages.map((ingredient) => ingredient.ingredientName).join(', ');
        throw new AppError(409, `Insufficient ingredient stock for: ${ingredientNames}`);
      }

      for (const ingredient of requiredIngredients) {
        if (ingredient.requiredQty <= 0) {
          continue;
        }

        const result = await tx.ingredient.updateMany({
          where: {
            id: ingredient.ingredientId,
            availableQty: {
              gte: ingredient.requiredQty,
            },
          },
          data: {
            availableQty: {
              decrement: ingredient.requiredQty,
            },
          },
        });

        if (result.count !== 1) {
          throw new AppError(
            409,
            `Ingredient stock changed before fulfillment for ${ingredient.ingredientName}`,
          );
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.READY_FOR_DELIVERY },
      });

      await tx.deliveryTask.upsert({
        where: { orderId },
        update: {
          status: DeliveryStatus.AVAILABLE,
          deliveryPartnerId: null,
          capturedAt: null,
          completedAt: null,
          failureReason: null,
        },
        create: {
          orderId,
          status: DeliveryStatus.AVAILABLE,
        },
      });
    });
  }

  async approveOrder(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(404, 'Order not found');
    }
    if (order.status !== OrderStatus.AWAITING_APPROVAL) {
      throw new AppError(400, 'Order is not awaiting approval');
    }
    await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CONFIRMED } });
  }

  async rejectOrder(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(404, 'Order not found');
    }
    if (order.status !== OrderStatus.AWAITING_APPROVAL) {
      throw new AppError(400, 'Order is not awaiting approval');
    }
    await prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.CANCELLED } });
  }

  async listPendingSettlements(): Promise<SafeSettlementOrder[]> {
    const settlements = await prisma.settlement.findMany({
      where: {
        status: { in: [SettlementStatus.UNSETTLED, SettlementStatus.PARTIAL] },
      },
      include: {
        order: {
          include: {
            customer: true,
            timeSlot: true,
          },
        },
        payments: true,
      },
      orderBy: [
        { order: { deliveryDate: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    return settlements.map(toSafeSettlementOrder);
  }

  async recordSettlementPayment(
    orderId: string,
    input: RecordSettlementPaymentInput,
  ): Promise<SafeSettlementOrder> {
    const paymentAmount = Math.round(input.amount * 100);

    if (paymentAmount <= 0) {
      throw new AppError(400, 'Amount must be greater than zero');
    }

    const settlement = await prisma.$transaction(async (tx) => {
      const existingSettlement = await tx.settlement.findUnique({
        where: { orderId },
        include: {
          order: {
            include: {
              customer: true,
              timeSlot: true,
            },
          },
          payments: true,
        },
      });

      if (!existingSettlement) {
        throw new AppError(404, 'Settlement not found for this order');
      }

      if (existingSettlement.status === SettlementStatus.SETTLED) {
        throw new AppError(400, 'Settlement is already completed');
      }

      const remainingAmount = existingSettlement.totalAmount - existingSettlement.paidAmount;
      if (paymentAmount > remainingAmount) {
        throw new AppError(400, 'Payment amount cannot exceed the outstanding balance');
      }

      await tx.payment.create({
        data: {
          settlementId: existingSettlement.id,
          amount: paymentAmount,
          method: input.method,
          paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
          note: input.note ? input.note : null,
        },
      });

      const nextPaidAmount = existingSettlement.paidAmount + paymentAmount;
      const nextStatus =
        nextPaidAmount >= existingSettlement.totalAmount
          ? SettlementStatus.SETTLED
          : SettlementStatus.PARTIAL;

      await tx.settlement.update({
        where: { id: existingSettlement.id },
        data: {
          paidAmount: nextPaidAmount,
          status: nextStatus,
        },
      });

      return tx.settlement.findUniqueOrThrow({
        where: { id: existingSettlement.id },
        include: {
          order: {
            include: {
              customer: true,
              timeSlot: true,
            },
          },
          payments: true,
        },
      });
    });

    return toSafeSettlementOrder(settlement);
  }
}

export default OrderService;
