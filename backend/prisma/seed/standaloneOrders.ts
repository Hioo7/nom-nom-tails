import {
  AddressType,
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  SettlementStatus,
} from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { StaffResult } from './adminAndDelivery';
import { CustomersResult } from './customers';
import { DishRecord, DishesResult } from './dishes';
import { TimeSlotRecord, TimeSlotsResult } from './timeSlots';

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

interface StandaloneOrderConfig {
  customerId: string;
  timeSlotId: string;
  deliveryDate: Date;
  address: DeliveryAddressSnapshot;
  status: OrderStatus;
  items: Array<{ dishId: string; quantity: number; price: number }>;
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

function makeDate(year: number, month: number, day: number, hour = 9): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

function makeTodayDate(hour = 9): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}

// Returns the morning/brunch slot that matches today's actual day of week so
// that AVAILABLE delivery tasks always fall within the live "today" window.
function getTodaySlot(timeSlots: TimeSlotsResult): TimeSlotRecord {
  const map: Record<number, keyof TimeSlotsResult> = {
    0: 'sundayBrunch',
    1: 'mondayMorning',
    2: 'tuesdayMorning',
    3: 'wednesdayMorning',
    4: 'thursdayMorning',
    5: 'fridayMorning',
    6: 'saturdayBrunch',
  };
  return timeSlots[map[new Date().getDay()]];
}

function totalPrice(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

async function createStandaloneOrder(config: StandaloneOrderConfig): Promise<void> {
  const order = await prisma.order.create({
    data: {
      customerId: config.customerId,
      timeSlotId: config.timeSlotId,
      deliveryDate: config.deliveryDate,
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
      status: config.status,
      items: {
        create: config.items.map((item) => ({ dishId: item.dishId, quantity: item.quantity })),
      },
    },
  });

  if (config.settlement) {
    const s = config.settlement;
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

  if (config.deliveryTaskStatus !== undefined) {
    await prisma.deliveryTask.create({
      data: {
        orderId: order.id,
        status: config.deliveryTaskStatus,
        deliveryPartnerId: config.deliveryPartnerId ?? null,
        capturedAt: config.capturedAt ?? null,
        completedAt: config.completedAt ?? null,
      },
    });
  }
}

interface SeedStandaloneOrdersInput {
  customers: CustomersResult;
  dishes: DishesResult;
  timeSlots: TimeSlotsResult;
  staff: StaffResult;
}

function dishItems(
  dishes: DishRecord[],
  quantities: number[],
): Array<{ dishId: string; quantity: number; price: number }> {
  return dishes.map((dish, i) => ({
    dishId: dish.id,
    quantity: quantities[i],
    price: dish.price,
  }));
}

export async function seedStandaloneOrders(input: SeedStandaloneOrdersInput): Promise<void> {
  const { customers, dishes, timeSlots, staff } = input;
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

  // Rahul items for the upcoming order
  const rahulUpcomingItems = dishItems(
    [dishes.chickenBowl, dishes.sandwich],
    [2, 1],
  );

  // Divya items for the upcoming order
  const divyaUpcomingItems = dishItems(
    [dishes.dosa, dishes.idly],
    [1, 2],
  );

  // Rahul old order
  const rahulOldItems = dishItems([dishes.sandwich], [2]);

  // Pooja delivered order
  const poojaDeliveredItems = dishItems(
    [dishes.chickenBowl, dishes.idly],
    [1, 2],
  );

  // Pooja future order
  const poojaFutureItems = dishItems([dishes.dosa], [2]);

  // Aditya cancelled order
  const adityaCancelledItems = dishItems(
    [dishes.masalaDosa, dishes.dosa],
    [1, 1],
  );

  // Available delivery tasks — deliveryDate = today so they appear in the
  // delivery partner's available tasks view regardless of when the seed runs.
  const todaySlot = getTodaySlot(timeSlots);
  const todayDate = makeTodayDate(9);

  const priyaAvailableItems = dishItems([dishes.chickenBowl, dishes.masalaDosa], [1, 1]);
  const adityaAvailableItems = dishItems([dishes.masalaDosa, dishes.dosa], [1, 1]);
  const poojaTodayItems = dishItems([dishes.sandwich, dishes.dosa], [1, 2]);

  // Same-day orders awaiting admin approval
  const rahulSameDayItems = dishItems([dishes.chickenBowl], [1]);
  const divyaSameDayItems = dishItems([dishes.masalaDosa, dishes.idly], [1, 2]);

  const orderConfigs: StandaloneOrderConfig[] = [
    // ── Rahul: 2x Chicken Bowl + 1x Sandwich, Wed morning 2026-04-23, PENDING ──
    {
      customerId: customers.rahul.id,
      timeSlotId: timeSlots.wednesdayMorning.id,
      deliveryDate: makeDate(2026, 4, 23),
      address: snapshotFor(customers.rahul.id),
      status: OrderStatus.PENDING,
      items: rahulUpcomingItems,
    },

    // ── Divya: 1x Dosa + 2x Idly, Wed morning 2026-04-23, CONFIRMED ───────────
    {
      customerId: customers.divya.id,
      timeSlotId: timeSlots.wednesdayMorning.id,
      deliveryDate: makeDate(2026, 4, 23),
      address: snapshotFor(customers.divya.id),
      status: OrderStatus.CONFIRMED,
      items: divyaUpcomingItems,
      settlement: {
        totalAmount: totalPrice(divyaUpcomingItems),
        paidAmount: 0,
        settlementStatus: SettlementStatus.UNSETTLED,
      },
    },

    // ── Rahul: 2x Sandwich, Mon morning 2026-04-07, DELIVERED ─────────────────
    {
      customerId: customers.rahul.id,
      timeSlotId: timeSlots.mondayMorning.id,
      deliveryDate: makeDate(2026, 4, 7),
      address: snapshotFor(customers.rahul.id),
      status: OrderStatus.DELIVERED,
      items: rahulOldItems,
      settlement: {
        totalAmount: totalPrice(rahulOldItems),
        paidAmount: totalPrice(rahulOldItems),
        settlementStatus: SettlementStatus.SETTLED,
        paymentMethod: PaymentMethod.CASH,
        paidAt: makeDate(2026, 4, 7, 10),
      },
      deliveryTaskStatus: DeliveryStatus.DELIVERED,
      deliveryPartnerId: suresh,
      capturedAt: makeDate(2026, 4, 7, 9),
      completedAt: makeDate(2026, 4, 7, 10),
    },

    // ── Aditya: 1x Masala Dosa + 1x Dosa, Sat brunch 2026-04-12, CANCELLED ────
    {
      customerId: customers.aditya.id,
      timeSlotId: timeSlots.saturdayBrunch.id,
      deliveryDate: makeDate(2026, 4, 12, 9),
      address: snapshotFor(customers.aditya.id),
      status: OrderStatus.CANCELLED,
      items: adityaCancelledItems,
    },

    // ── Pooja: 1x Chicken Bowl + 2x Idly, Sat brunch 2026-04-12, DELIVERED ─────
    {
      customerId: customers.pooja.id,
      timeSlotId: timeSlots.saturdayBrunch.id,
      deliveryDate: makeDate(2026, 4, 12, 9),
      address: snapshotFor(customers.pooja.id),
      status: OrderStatus.DELIVERED,
      items: poojaDeliveredItems,
      settlement: {
        totalAmount: totalPrice(poojaDeliveredItems),
        paidAmount: 15000,
        settlementStatus: SettlementStatus.PARTIAL,
        paymentMethod: PaymentMethod.ONLINE,
        paidAt: makeDate(2026, 4, 12, 11),
      },
      deliveryTaskStatus: DeliveryStatus.DELIVERED,
      deliveryPartnerId: meena,
      capturedAt: makeDate(2026, 4, 12, 9),
      completedAt: makeDate(2026, 4, 12, 11),
    },

    // ── Pooja: 2x Dosa, Sat brunch 2026-04-26, PENDING (future) ──────────────
    {
      customerId: customers.pooja.id,
      timeSlotId: timeSlots.saturdayBrunch.id,
      deliveryDate: makeDate(2026, 4, 26, 9),
      address: snapshotFor(customers.pooja.id),
      status: OrderStatus.PENDING,
      items: poojaFutureItems,
    },

    // ── AVAILABLE DELIVERY TASKS (deliveryDate = today, dynamic) ─────────────

    // Priya: 1x Chicken Bowl + 1x Masala Dosa — UNSETTLED
    {
      customerId: customers.priya.id,
      timeSlotId: todaySlot.id,
      deliveryDate: todayDate,
      address: snapshotFor(customers.priya.id),
      status: OrderStatus.READY_FOR_DELIVERY,
      items: priyaAvailableItems,
      settlement: {
        totalAmount: totalPrice(priyaAvailableItems),
        paidAmount: 0,
        settlementStatus: SettlementStatus.UNSETTLED,
      },
      deliveryTaskStatus: DeliveryStatus.AVAILABLE,
    },

    // Aditya: 1x Masala Dosa + 1x Dosa — PARTIAL (half paid in advance)
    {
      customerId: customers.aditya.id,
      timeSlotId: todaySlot.id,
      deliveryDate: todayDate,
      address: snapshotFor(customers.aditya.id),
      status: OrderStatus.READY_FOR_DELIVERY,
      items: adityaAvailableItems,
      settlement: {
        totalAmount: totalPrice(adityaAvailableItems),
        paidAmount: Math.floor(totalPrice(adityaAvailableItems) / 2),
        settlementStatus: SettlementStatus.PARTIAL,
        paymentMethod: PaymentMethod.ONLINE,
        paidAt: makeTodayDate(8),
      },
      deliveryTaskStatus: DeliveryStatus.AVAILABLE,
    },

    // Pooja: 1x Sandwich + 2x Dosa — SETTLED (fully paid online before delivery)
    {
      customerId: customers.pooja.id,
      timeSlotId: todaySlot.id,
      deliveryDate: todayDate,
      address: snapshotFor(customers.pooja.id),
      status: OrderStatus.READY_FOR_DELIVERY,
      items: poojaTodayItems,
      settlement: {
        totalAmount: totalPrice(poojaTodayItems),
        paidAmount: totalPrice(poojaTodayItems),
        settlementStatus: SettlementStatus.SETTLED,
        paymentMethod: PaymentMethod.UPI,
        paidAt: makeTodayDate(8),
      },
      deliveryTaskStatus: DeliveryStatus.AVAILABLE,
    },

    // ── SAME-DAY ORDERS AWAITING ADMIN APPROVAL ───────────────────────────────

    // Rahul: 1x Chicken Bowl — placed this morning, awaiting approval
    {
      customerId: customers.rahul.id,
      timeSlotId: todaySlot.id,
      deliveryDate: todayDate,
      address: snapshotFor(customers.rahul.id),
      status: OrderStatus.AWAITING_APPROVAL,
      items: rahulSameDayItems,
    },

    // Divya: 1x Masala Dosa + 2x Idly — placed this morning, awaiting approval
    {
      customerId: customers.divya.id,
      timeSlotId: todaySlot.id,
      deliveryDate: todayDate,
      address: snapshotFor(customers.divya.id),
      status: OrderStatus.AWAITING_APPROVAL,
      items: divyaSameDayItems,
    },
  ];

  for (const config of orderConfigs) {
    await createStandaloneOrder(config);
  }

  console.log(`  Created ${orderConfigs.length} standalone orders.`);
  console.log('  3 AVAILABLE delivery tasks seeded for today — visible in delivery partner portal.');
  console.log('  2 AWAITING_APPROVAL same-day orders seeded — visible in admin upcoming orders with Accept/Reject.');
}
