import { AddressType, OrderStatus, Prisma, SubscriptionStatus } from '@prisma/client';
import AppError from '../lib/AppError';
import { JS_DAY_TO_DOW, addDays, nextOccurrenceOfDow, parseDateLocal } from '../lib/dateUtils';
import prisma from '../lib/prisma';
import {
  CreateSubscriptionInput,
  ListSubscriptionsQueryInput,
} from '../schema/subscription.schema';

const SUBSCRIPTION_WEEKS = 4;
const BUFFER_DAYS = 3;

const includeSubscriptionDetails = {
  mealPlan: { include: { dishes: { include: { dish: true } } } },
  timeSlot: true,
  orders: { include: { items: { include: { dish: true } }, settlement: true } },
} satisfies Prisma.SubscriptionInclude;

type SubscriptionWithDetails = Prisma.SubscriptionGetPayload<{
  include: typeof includeSubscriptionDetails;
}>;

type SubscriptionWithCustomer = Prisma.SubscriptionGetPayload<{
  include: {
    customer: { select: { id: true; name: true; email: true } };
    mealPlan: { select: { id: true; name: true } };
    timeSlot: true;
    _count: { select: { orders: true } };
  };
}>;

function buildOrderInputs(
  weeks: number,
  firstDelivery: Date,
  customerId: string,
  timeSlotId: string,
  subscriptionId: string,
  address: {
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    pin: string | null;
    lat: number | null;
    lng: number | null;
    type: AddressType;
  },
): Prisma.OrderCreateManyInput[] {
  return Array.from({ length: weeks }, (_, i) => ({
    customerId,
    timeSlotId,
    subscriptionId,
    deliveryDate: addDays(firstDelivery, i * 7),
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
    status: OrderStatus.CONFIRMED,
  }));
}

class SubscriptionService {
  private static instance: SubscriptionService;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async subscribe(
    customerId: string,
    data: CreateSubscriptionInput,
  ): Promise<SubscriptionWithDetails> {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: data.mealPlanId },
      include: { dishes: { include: { dish: true } } },
    });
    if (!mealPlan || !mealPlan.isActive) {
      throw new AppError(404, 'Meal plan not found or unavailable');
    }

    const timeSlot = await prisma.timeSlot.findUnique({ where: { id: data.timeSlotId } });
    if (!timeSlot || !timeSlot.isActive) {
      throw new AppError(404, 'Time slot not found or unavailable');
    }

    const address = await prisma.address.findUnique({ where: { id: data.addressId } });
    if (!address || address.userId !== customerId) {
      throw new AppError(404, 'Address not found');
    }
    if (address.isCurrentLocation) {
      throw new AppError(400, 'Please select a saved delivery address, not a GPS location');
    }

    const startDate = parseDateLocal(data.startDate);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    if (startDate < addDays(todayMidnight, BUFFER_DAYS)) {
      throw new AppError(400, `Start date must be at least ${BUFFER_DAYS} days from today`);
    }
    if (JS_DAY_TO_DOW[startDate.getDay()] !== timeSlot.day) {
      throw new AppError(400, 'Start date day-of-week does not match the selected time slot');
    }

    const endDate = addDays(startDate, SUBSCRIPTION_WEEKS * 7);
    const dishes = mealPlan.dishes.map((mpd) => mpd.dish);
    const totalAmount = dishes.reduce((sum, dish) => sum + dish.price, 0);

    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          customerId,
          mealPlanId: data.mealPlanId,
          timeSlotId: data.timeSlotId,
          startDate,
          endDate,
          isAutoRenew: data.isAutoRenew,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      await tx.order.createMany({
        data: buildOrderInputs(
          SUBSCRIPTION_WEEKS,
          startDate,
          customerId,
          data.timeSlotId,
          subscription.id,
          address,
        ),
      });

      const orders = await tx.order.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { deliveryDate: 'asc' },
      });

      await tx.orderItem.createMany({
        data: orders.flatMap((order) =>
          dishes.map((dish) => ({ orderId: order.id, dishId: dish.id, quantity: 1 })),
        ),
      });

      await tx.settlement.createMany({
        data: orders.map((order) => ({ orderId: order.id, totalAmount })),
      });

      return tx.subscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: includeSubscriptionDetails,
      });
    });
  }

  async listMySubscriptions(customerId: string): Promise<SubscriptionWithDetails[]> {
    return prisma.subscription.findMany({
      where: { customerId, mealPlan: { isActive: true } },
      include: includeSubscriptionDetails,
      orderBy: { createdAt: 'desc' },
    });
  }

  async renewSubscription(
    customerId: string,
    subscriptionId: string,
    addressId: string,
  ): Promise<SubscriptionWithDetails> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        timeSlot: true,
        mealPlan: { include: { dishes: { include: { dish: true } } } },
      },
    });
    if (!subscription || subscription.customerId !== customerId) {
      throw new AppError(404, 'Subscription not found');
    }
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new AppError(400, 'Cancelled subscriptions cannot be renewed');
    }
    if (!subscription.mealPlan.isActive) {
      throw new AppError(400, 'This meal plan is no longer active and cannot be renewed');
    }

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== customerId) {
      throw new AppError(404, 'Address not found');
    }
    if (address.isCurrentLocation) {
      throw new AppError(400, 'Please select a saved delivery address, not a GPS location');
    }

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const newStart =
      subscription.status === SubscriptionStatus.ACTIVE
        ? new Date(subscription.endDate)
        : nextOccurrenceOfDow(subscription.timeSlot.day, addDays(todayMidnight, BUFFER_DAYS));

    const newEndDate = addDays(newStart, SUBSCRIPTION_WEEKS * 7);
    const dishes = subscription.mealPlan.dishes.map((mpd) => mpd.dish);
    const totalAmount = dishes.reduce((sum, dish) => sum + dish.price, 0);

    return prisma.$transaction(async (tx) => {
      await tx.order.createMany({
        data: buildOrderInputs(
          SUBSCRIPTION_WEEKS,
          newStart,
          customerId,
          subscription.timeSlotId,
          subscription.id,
          address,
        ),
      });

      const newOrders = await tx.order.findMany({
        where: { subscriptionId: subscription.id, deliveryDate: { gte: newStart } },
        orderBy: { deliveryDate: 'asc' },
      });

      await tx.orderItem.createMany({
        data: newOrders.flatMap((order) =>
          dishes.map((dish) => ({ orderId: order.id, dishId: dish.id, quantity: 1 })),
        ),
      });

      await tx.settlement.createMany({
        data: newOrders.map((order) => ({ orderId: order.id, totalAmount })),
      });

      await tx.subscription.update({
        where: { id: subscription.id },
        data: { endDate: newEndDate, status: SubscriptionStatus.ACTIVE },
      });

      return tx.subscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: includeSubscriptionDetails,
      });
    });
  }

  async listAllSubscriptions(
    filters: ListSubscriptionsQueryInput,
  ): Promise<SubscriptionWithCustomer[]> {
    const where: Prisma.SubscriptionWhereInput = {};
    if (filters.mealPlanId) where.mealPlanId = filters.mealPlanId;
    if (filters.status) where.status = filters.status as SubscriptionStatus;

    return prisma.subscription.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        mealPlan: { select: { id: true, name: true } },
        timeSlot: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default SubscriptionService;
