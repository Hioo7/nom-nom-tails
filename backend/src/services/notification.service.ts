import prisma from '../lib/prisma';

export interface NotificationSummary {
  id: string;
  type: string;
  title: string;
  body: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async create(userId: string, type: string, title: string, body: string, orderId?: string): Promise<void> {
    await prisma.notification.create({
      data: { userId, type, title, body, orderId: orderId ?? null },
    });
  }

  async listForUser(userId: string): Promise<NotificationSummary[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, type: true, title: true, body: true, orderId: true, isRead: true, createdAt: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }
}

export default NotificationService;
