import { randomUUID } from 'crypto';
import { DeliveryStatus, OrderStatus, Prisma, Role } from '@prisma/client';
import AppConfig from '../config/AppConfig';
import { MINIO_BUCKET } from '../config/constants';
import AppError from '../lib/AppError';
import { compressToAvif } from '../lib/imageCompress';
import MinioStorage from '../lib/minio';
import prisma from '../lib/prisma';
import {
  DeliveryOrderSummary,
  DeliveryPartnerSummary,
  DeliveryPartnerTaskSummary,
} from '../types/deliveryPartner.types';

type DeliveryPartnerTaskRecord = Prisma.DeliveryTaskGetPayload<{
  include: {
    order: {
      include: {
        customer: {
          select: { name: true; email: true };
        };
        timeSlot: true;
        items: true;
      };
    };
  };
}>;

function getTodayWindow(referenceDate: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function isWithinToday(deliveryDate: Date, referenceDate: Date = new Date()): boolean {
  const { start, end } = getTodayWindow(referenceDate);
  return deliveryDate >= start && deliveryDate <= end;
}

function toOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function toItemCount(items: { quantity: number }[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function toTaskSummary(task: DeliveryPartnerTaskRecord): DeliveryPartnerTaskSummary {
  const o = task.order;
  return {
    taskId: task.id,
    orderId: task.orderId,
    orderNumber: toOrderNumber(task.orderId),
    customerName: o.customer.name,
    customerPhone: o.deliveryPhone,
    deliveryDate: o.deliveryDate,
    itemCount: toItemCount(o.items),
    status: task.status,
    locationLabel: `${o.deliveryLine1}, ${o.deliveryCity}, ${o.deliveryState} - ${o.deliveryPin}`,
    latitude: o.deliveryLat,
    longitude: o.deliveryLng,
    handlingNotes: task.handlingNotes,
    timeSlot: {
      id: o.timeSlot.id,
      day: o.timeSlot.day,
      startTime: o.timeSlot.startTime,
      endTime: o.timeSlot.endTime,
    },
  };
}

class DeliveryPartnerService {
  private static instance: DeliveryPartnerService;

  static getInstance(): DeliveryPartnerService {
    if (!DeliveryPartnerService.instance) {
      DeliveryPartnerService.instance = new DeliveryPartnerService();
    }
    return DeliveryPartnerService.instance;
  }

  async listPartnersWithTodayDeliveries(): Promise<DeliveryPartnerSummary[]> {
    const { start: todayStart, end: todayEnd } = getTodayWindow();

    const partners = await prisma.user.findMany({
      where: { role: Role.DELIVERY_PARTNER, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        deliveryTasks: {
          where: {
            order: {
              deliveryDate: { gte: todayStart, lte: todayEnd },
            },
          },
          include: {
            order: { select: { id: true, status: true } },
          },
        },
      },
    });

    return partners.map((partner) => {
      const orders: DeliveryOrderSummary[] = partner.deliveryTasks.map((task) => ({
        orderId: task.orderId,
        orderNumber: toOrderNumber(task.orderId),
        status: task.status,
      }));

      return {
        id: partner.id,
        name: partner.name,
        assignedCount: partner.deliveryTasks.length,
        completedCount: partner.deliveryTasks.filter(
          (task) => task.status === DeliveryStatus.DELIVERED,
        ).length,
        orders,
      };
    });
  }

  async listAvailableTasksForPartner(): Promise<DeliveryPartnerTaskSummary[]> {
    const { start, end } = getTodayWindow();

    const tasks = await prisma.deliveryTask.findMany({
      where: {
        status: DeliveryStatus.AVAILABLE,
        deliveryPartnerId: null,
        order: {
          status: OrderStatus.READY_FOR_DELIVERY,
          deliveryDate: { gte: start, lte: end },
        },
      },
      include: {
        order: {
          include: {
            customer: { select: { name: true, email: true } },
            timeSlot: true,
            items: true,
          },
        },
      },
      orderBy: [{ order: { deliveryDate: 'asc' } }, { createdAt: 'asc' }],
    });

    return tasks.map(toTaskSummary);
  }

  async listActiveTasksForPartner(deliveryPartnerId: string): Promise<DeliveryPartnerTaskSummary[]> {
    const tasks = await prisma.deliveryTask.findMany({
      where: {
        deliveryPartnerId,
        status: {
          in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP],
        },
      },
      include: {
        order: {
          include: {
            customer: { select: { name: true, email: true } },
            timeSlot: true,
            items: true,
          },
        },
      },
      orderBy: [{ order: { deliveryDate: 'asc' } }, { updatedAt: 'asc' }],
    });

    return tasks.map(toTaskSummary);
  }

  async acceptTask(taskId: string, deliveryPartnerId: string): Promise<void> {
    const task = await prisma.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        order: true,
      },
    });

    if (!task) {
      throw new AppError(404, 'Order not found');
    }

    if (!isWithinToday(task.order.deliveryDate)) {
      throw new AppError(400, 'This order is not for today');
    }

    if (task.order.status !== OrderStatus.READY_FOR_DELIVERY) {
      throw new AppError(400, 'This order is not ready');
    }

    await prisma.$transaction(async (tx) => {
      const result = await tx.deliveryTask.updateMany({
        where: {
          id: taskId,
          status: DeliveryStatus.AVAILABLE,
          deliveryPartnerId: null,
        },
        data: {
          status: DeliveryStatus.ASSIGNED,
          deliveryPartnerId,
        },
      });

      if (result.count !== 1) {
        throw new AppError(409, 'This order was already taken');
      }

      await tx.order.update({
        where: { id: task.orderId },
        data: { status: OrderStatus.IN_DELIVERY },
      });
    });
  }

  async completeTask(
    taskId: string,
    deliveryPartnerId: string,
    proofImageBuffer: Buffer,
  ): Promise<void> {
    const task = await prisma.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        order: true,
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (task.deliveryPartnerId !== deliveryPartnerId) {
      throw new AppError(403, 'This task is not yours');
    }

    if (task.status !== DeliveryStatus.ASSIGNED && task.status !== DeliveryStatus.PICKED_UP) {
      throw new AppError(400, 'This task cannot be marked delivered');
    }

    const compressed = await compressToAvif(proofImageBuffer);
    const key = `delivery-proofs/${taskId}/${randomUUID()}.avif`;
    await MinioStorage.getInstance().putObject(MINIO_BUCKET, key, compressed, 'image/avif');
    const photoUrl = `${AppConfig.getInstance().imageBaseUrl}/${key}`;

    await prisma.$transaction(async (tx) => {
      await tx.deliveryPhoto.create({
        data: {
          deliveryTaskId: taskId,
          photoUrl,
        },
      });

      await tx.deliveryTask.update({
        where: { id: taskId },
        data: {
          status: DeliveryStatus.DELIVERED,
          capturedAt: new Date(),
          completedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: task.orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    });
  }

  async failTask(taskId: string, deliveryPartnerId: string, failureReason: string): Promise<void> {
    const task = await prisma.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        order: true,
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (task.deliveryPartnerId !== deliveryPartnerId) {
      throw new AppError(403, 'This task is not yours');
    }

    if (task.status !== DeliveryStatus.ASSIGNED && task.status !== DeliveryStatus.PICKED_UP) {
      throw new AppError(400, 'This task cannot be marked failed');
    }

    await prisma.$transaction(async (tx) => {
      await tx.deliveryTask.update({
        where: { id: taskId },
        data: {
          status: DeliveryStatus.FAILED,
          failureReason,
          capturedAt: null,
          completedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: task.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });
    });
  }
}

export default DeliveryPartnerService;
