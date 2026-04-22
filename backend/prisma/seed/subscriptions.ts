import {
  AddressType,
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  SettlementStatus,
  SubscriptionStatus,
} from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { StaffResult } from './adminAndDelivery';
import { CustomersResult } from './customers';
import { MealPlansResult } from './mealPlans';
import { TimeSlotsResult } from './timeSlots';
import { DishRecord } from './dishes';

interface DeliveryAddressSnapshot {
  deliveryFullName: string;
  deliveryPhone: string;
  deliveryLine1: string;
  deliveryLine2: string | null;
  deliveryCity: string;
  deliveryState: string;
  deliveryPin: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryAddressType: AddressType;
}

interface SeedOrderConfig {
  deliveryDate: Date;
  status: OrderStatus;
  settlement?: {
    totalAmount: number;
    paidAmount: number;
    settlementStatus: SettlementStatus;
    paymentMethod?: PaymentMethod;
    paidAt?: Date;
  };
  deliveryTaskStatus?: DeliveryStatus;
  deliveryPartnerId?: string;
  capturedAt?: Date;
  completedAt?: Date;
}

interface SeedSubscriptionConfig {
  customerId: string;
  mealPlanId: string;
  timeSlotId: string;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  isAutoRenew: boolean;
  address: DeliveryAddressSnapshot;
  dishes: DishRecord[];
  orders: SeedOrderConfig[];
}

function makeDate(year: number, month: number, day: number, hour = 9): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

function orderTotal(dishes: DishRecord[]): number {
  return dishes.reduce((sum, d) => sum + d.price, 0);
}

async function createSubscriptionWithOrders(
  config: SeedSubscriptionConfig,
): Promise<void> {
  const subscription = await prisma.subscription.create({
    data: {
      customerId: config.customerId,
      mealPlanId: config.mealPlanId,
      timeSlotId: config.timeSlotId,
      startDate: config.startDate,
      endDate: config.endDate,
      isAutoRenew: config.isAutoRenew,
      status: config.status,
    },
  });

  for (const orderConfig of config.orders) {
    const order = await prisma.order.create({
      data: {
        customerId: config.customerId,
        timeSlotId: config.timeSlotId,
        subscriptionId: subscription.id,
        deliveryDate: orderConfig.deliveryDate,
        deliveryFullName: config.address.deliveryFullName,
        deliveryPhone: config.address.deliveryPhone,
        deliveryLine1: config.address.deliveryLine1,
        deliveryLine2: config.address.deliveryLine2,
        deliveryCity: config.address.deliveryCity,
        deliveryState: config.address.deliveryState,
        deliveryPin: config.address.deliveryPin,
        deliveryLat: config.address.deliveryLat,
        deliveryLng: config.address.deliveryLng,
        deliveryAddressType: config.address.deliveryAddressType,
        status: orderConfig.status,
        items: {
          create: config.dishes.map((dish) => ({ dishId: dish.id, quantity: 1 })),
        },
      },
    });

    if (orderConfig.settlement) {
      const s = orderConfig.settlement;
      const settlement = await prisma.settlement.create({
        data: {
          orderId: order.id,
          totalAmount: s.totalAmount,
          paidAmount: s.paidAmount,
          status: s.settlementStatus,
        },
      });

      if (s.paidAmount > 0 && s.paymentMethod && s.paidAt) {
        await prisma.payment.create({
          data: {
            settlementId: settlement.id,
            amount: s.paidAmount,
            method: s.paymentMethod,
            paidAt: s.paidAt,
          },
        });
      }
    }

    if (orderConfig.deliveryTaskStatus !== undefined) {
      await prisma.deliveryTask.create({
        data: {
          orderId: order.id,
          status: orderConfig.deliveryTaskStatus,
          deliveryPartnerId: orderConfig.deliveryPartnerId ?? null,
          capturedAt: orderConfig.capturedAt ?? null,
          completedAt: orderConfig.completedAt ?? null,
        },
      });
    }
  }
}

interface SeedSubscriptionsInput {
  customers: CustomersResult;
  mealPlans: MealPlansResult;
  timeSlots: TimeSlotsResult;
  staff: StaffResult;
}

export async function seedSubscriptions(input: SeedSubscriptionsInput): Promise<void> {
  const { customers, mealPlans, timeSlots, staff } = input;
  const suresh = staff.deliveryPartner1.id;
  const meena = staff.deliveryPartner2.id;

  // Load all customer addresses up front
  const customerIds = Object.values(customers).map((c) => c.id);
  const addressRecords = await prisma.address.findMany({
    where: { userId: { in: customerIds } },
  });
  const addrByCustomer = new Map(addressRecords.map((a) => [a.userId, a]));

  function snapshotFor(customerId: string): DeliveryAddressSnapshot {
    const a = addrByCustomer.get(customerId);
    if (!a) throw new Error(`No address found for customer ${customerId}`);
    return {
      deliveryFullName: a.fullName,
      deliveryPhone: a.phone,
      deliveryLine1: a.line1,
      deliveryLine2: a.line2,
      deliveryCity: a.city,
      deliveryState: a.state,
      deliveryPin: a.pin,
      deliveryLat: a.lat,
      deliveryLng: a.lng,
      deliveryAddressType: a.type,
    };
  }

  const subscriptionConfigs: SeedSubscriptionConfig[] = [
    // ── Arjun: Weekly Wellness, ACTIVE, Mon morning ──────────────────────────
    {
      customerId: customers.arjun.id,
      mealPlanId: mealPlans.weeklyWellness.id,
      timeSlotId: timeSlots.mondayMorning.id,
      startDate: makeDate(2026, 4, 6),
      endDate: makeDate(2026, 5, 3),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: true,
      address: snapshotFor(customers.arjun.id),
      dishes: mealPlans.weeklyWellness.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 6),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 6, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 6, 9),
          completedAt: makeDate(2026, 4, 6, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 13),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.ONLINE,
            paidAt: makeDate(2026, 4, 13, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 13, 9),
          completedAt: makeDate(2026, 4, 13, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 20),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: 20000,
            settlementStatus: SettlementStatus.PARTIAL,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 20, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 20, 9),
          completedAt: makeDate(2026, 4, 20, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 27),
          status: OrderStatus.PENDING,
        },
      ],
    },

    // ── Arjun: South Indian Special, ACTIVE, Fri evening ─────────────────────
    {
      customerId: customers.arjun.id,
      mealPlanId: mealPlans.southIndianSpecial.id,
      timeSlotId: timeSlots.fridayEvening.id,
      startDate: makeDate(2026, 4, 3),
      endDate: makeDate(2026, 4, 30),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: false,
      address: snapshotFor(customers.arjun.id),
      dishes: mealPlans.southIndianSpecial.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 3, 18),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.UPI,
            paidAt: makeDate(2026, 4, 3, 19),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 3, 18, ),
          completedAt: makeDate(2026, 4, 3, 19),
        },
        {
          deliveryDate: makeDate(2026, 4, 10, 18),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 10, 19),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 10, 18),
          completedAt: makeDate(2026, 4, 10, 19),
        },
        {
          deliveryDate: makeDate(2026, 4, 17, 18),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 17, 18),
          completedAt: makeDate(2026, 4, 17, 19),
        },
        {
          deliveryDate: makeDate(2026, 4, 24, 18),
          status: OrderStatus.CONFIRMED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
        },
      ],
    },

    // ── Priya: South Indian Special, ACTIVE, Mon morning ─────────────────────
    {
      customerId: customers.priya.id,
      mealPlanId: mealPlans.southIndianSpecial.id,
      timeSlotId: timeSlots.mondayMorning.id,
      startDate: makeDate(2026, 4, 6),
      endDate: makeDate(2026, 5, 3),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: true,
      address: snapshotFor(customers.priya.id),
      dishes: mealPlans.southIndianSpecial.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 6),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.ONLINE,
            paidAt: makeDate(2026, 4, 6, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 6, 9),
          completedAt: makeDate(2026, 4, 6, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 13),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 13, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 13, 9),
          completedAt: makeDate(2026, 4, 13, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 20),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 15000,
            settlementStatus: SettlementStatus.PARTIAL,
            paymentMethod: PaymentMethod.UPI,
            paidAt: makeDate(2026, 4, 20, 11),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 20, 9),
          completedAt: makeDate(2026, 4, 20, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 27),
          status: OrderStatus.PENDING,
        },
      ],
    },

    // ── Vikram: Weekly Wellness, EXPIRED, Mon morning ─────────────────────────
    {
      customerId: customers.vikram.id,
      mealPlanId: mealPlans.weeklyWellness.id,
      timeSlotId: timeSlots.mondayMorning.id,
      startDate: makeDate(2026, 3, 9),
      endDate: makeDate(2026, 4, 6),
      status: SubscriptionStatus.EXPIRED,
      isAutoRenew: false,
      address: snapshotFor(customers.vikram.id),
      dishes: mealPlans.weeklyWellness.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 3, 9),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 3, 9, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 3, 9, 9),
          completedAt: makeDate(2026, 3, 9, 10),
        },
        {
          deliveryDate: makeDate(2026, 3, 16),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.UPI,
            paidAt: makeDate(2026, 3, 16, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 3, 16, 9),
          completedAt: makeDate(2026, 3, 16, 10),
        },
        {
          deliveryDate: makeDate(2026, 3, 23),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.ONLINE,
            paidAt: makeDate(2026, 3, 23, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 3, 23, 9),
          completedAt: makeDate(2026, 3, 23, 10),
        },
        {
          deliveryDate: makeDate(2026, 3, 30),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 3, 30, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 3, 30, 9),
          completedAt: makeDate(2026, 3, 30, 10),
        },
      ],
    },

    // ── Anjali: Quick Bites, CANCELLED, Fri evening ───────────────────────────
    {
      customerId: customers.anjali.id,
      mealPlanId: mealPlans.quickBites.id,
      timeSlotId: timeSlots.fridayEvening.id,
      startDate: makeDate(2026, 4, 3),
      endDate: makeDate(2026, 4, 30),
      status: SubscriptionStatus.CANCELLED,
      isAutoRenew: false,
      address: snapshotFor(customers.anjali.id),
      dishes: mealPlans.quickBites.dishes,
      orders: [
        { deliveryDate: makeDate(2026, 4, 3, 18), status: OrderStatus.CANCELLED },
        { deliveryDate: makeDate(2026, 4, 10, 18), status: OrderStatus.CANCELLED },
      ],
    },

    // ── Karan: Weekly Wellness, ACTIVE, Sat brunch ────────────────────────────
    {
      customerId: customers.karan.id,
      mealPlanId: mealPlans.weeklyWellness.id,
      timeSlotId: timeSlots.saturdayBrunch.id,
      startDate: makeDate(2026, 4, 5),
      endDate: makeDate(2026, 5, 2),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: true,
      address: snapshotFor(customers.karan.id),
      dishes: mealPlans.weeklyWellness.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 5, 9),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.UPI,
            paidAt: makeDate(2026, 4, 5, 11),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 5, 9),
          completedAt: makeDate(2026, 4, 5, 11),
        },
        {
          deliveryDate: makeDate(2026, 4, 12, 9),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: 20000,
            settlementStatus: SettlementStatus.PARTIAL,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 12, 11),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 12, 9),
          completedAt: makeDate(2026, 4, 12, 11),
        },
        {
          deliveryDate: makeDate(2026, 4, 19, 9),
          status: OrderStatus.READY_FOR_DELIVERY,
          settlement: {
            totalAmount: orderTotal(mealPlans.weeklyWellness.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
          deliveryTaskStatus: DeliveryStatus.AVAILABLE,
        },
        {
          deliveryDate: makeDate(2026, 4, 26, 9),
          status: OrderStatus.PENDING,
        },
      ],
    },

    // ── Karan: South Indian Special, ACTIVE, Mon morning ─────────────────────
    {
      customerId: customers.karan.id,
      mealPlanId: mealPlans.southIndianSpecial.id,
      timeSlotId: timeSlots.mondayMorning.id,
      startDate: makeDate(2026, 4, 6),
      endDate: makeDate(2026, 5, 3),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: true,
      address: snapshotFor(customers.karan.id),
      dishes: mealPlans.southIndianSpecial.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 6),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.ONLINE,
            paidAt: makeDate(2026, 4, 6, 11),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 6, 9),
          completedAt: makeDate(2026, 4, 6, 11),
        },
        {
          deliveryDate: makeDate(2026, 4, 13),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 13, 11),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 13, 9),
          completedAt: makeDate(2026, 4, 13, 11),
        },
        {
          deliveryDate: makeDate(2026, 4, 20),
          status: OrderStatus.READY_FOR_DELIVERY,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
          deliveryTaskStatus: DeliveryStatus.ASSIGNED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 20, 8, ),
        },
        {
          deliveryDate: makeDate(2026, 4, 27),
          status: OrderStatus.CONFIRMED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
        },
      ],
    },

    // ── Sneha: South Indian Special, ACTIVE, Mon morning ─────────────────────
    {
      customerId: customers.sneha.id,
      mealPlanId: mealPlans.southIndianSpecial.id,
      timeSlotId: timeSlots.mondayMorning.id,
      startDate: makeDate(2026, 4, 6),
      endDate: makeDate(2026, 5, 3),
      status: SubscriptionStatus.ACTIVE,
      isAutoRenew: false,
      address: snapshotFor(customers.sneha.id),
      dishes: mealPlans.southIndianSpecial.dishes,
      orders: [
        {
          deliveryDate: makeDate(2026, 4, 6),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.UPI,
            paidAt: makeDate(2026, 4, 6, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: suresh,
          capturedAt: makeDate(2026, 4, 6, 9),
          completedAt: makeDate(2026, 4, 6, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 13),
          status: OrderStatus.DELIVERED,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            settlementStatus: SettlementStatus.SETTLED,
            paymentMethod: PaymentMethod.CASH,
            paidAt: makeDate(2026, 4, 13, 10),
          },
          deliveryTaskStatus: DeliveryStatus.DELIVERED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 13, 9),
          completedAt: makeDate(2026, 4, 13, 10),
        },
        {
          deliveryDate: makeDate(2026, 4, 20),
          status: OrderStatus.IN_DELIVERY,
          settlement: {
            totalAmount: orderTotal(mealPlans.southIndianSpecial.dishes),
            paidAmount: 0,
            settlementStatus: SettlementStatus.UNSETTLED,
          },
          deliveryTaskStatus: DeliveryStatus.ASSIGNED,
          deliveryPartnerId: meena,
          capturedAt: makeDate(2026, 4, 20, 8),
        },
        {
          deliveryDate: makeDate(2026, 4, 27),
          status: OrderStatus.PENDING,
        },
      ],
    },
  ];

  let totalOrders = 0;
  for (const config of subscriptionConfigs) {
    await createSubscriptionWithOrders(config);
    totalOrders += config.orders.length;
  }

  console.log(
    `  Created ${subscriptionConfigs.length} subscriptions with ${totalOrders} auto-generated orders.`,
  );
}
