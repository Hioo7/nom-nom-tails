import { SettlementStatus, CampaignContributionStatus } from '@prisma/client';
import { UpdateMeInput } from '../schema/me.schema';
import { SafeUser } from '../types/user.types';
import { hash, compare } from '../lib/password';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

export interface DonationSummary {
  fromOrders: number;
  fromSubscriptions: number;
  fromCampaigns: number;
  total: number;
}

class MeService {
  private static instance: MeService;

  static getInstance(): MeService {
    if (!MeService.instance) {
      MeService.instance = new MeService();
    }
    return MeService.instance;
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async updateMe(userId: string, data: UpdateMeInput): Promise<SafeUser> {
    const updateData: { name?: string; email?: string; password?: string } = {};

    if (data.name !== undefined) updateData.name = data.name;

    if (data.email !== undefined) {
      const conflict = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      });
      if (conflict) throw new AppError(409, 'Email already in use');
      updateData.email = data.email;
    }

    if (data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError(404, 'User not found');

      const valid = await compare(data.currentPassword!, user.password);
      if (!valid) throw new AppError(400, 'Current password is incorrect');

      updateData.password = await hash(data.newPassword);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: { password: true },
    });
    return user;
  }

  async getDonationSummary(customerId: string): Promise<DonationSummary> {
    const [standaloneResult, subscriptionResult, campaignResult] = await Promise.all([
      prisma.settlement.aggregate({
        where: {
          order: { customerId, subscriptionId: null },
          status: { in: [SettlementStatus.PARTIAL, SettlementStatus.SETTLED] },
        },
        _sum: { paidAmount: true },
      }),
      prisma.settlement.aggregate({
        where: {
          order: { customerId, subscriptionId: { not: null } },
          status: { in: [SettlementStatus.PARTIAL, SettlementStatus.SETTLED] },
        },
        _sum: { paidAmount: true },
      }),
      prisma.campaignContribution.aggregate({
        where: { customerId, status: CampaignContributionStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

    const orderPaid        = standaloneResult._sum.paidAmount   ?? 0;
    const subscriptionPaid = subscriptionResult._sum.paidAmount ?? 0;
    const campaignTotal    = campaignResult._sum.amount         ?? 0;

    const fromOrders        = Math.floor(orderPaid        * 0.05);
    const fromSubscriptions = Math.floor(subscriptionPaid * 0.05);
    const fromCampaigns     = campaignTotal;

    return {
      fromOrders,
      fromSubscriptions,
      fromCampaigns,
      total: fromOrders + fromSubscriptions + fromCampaigns,
    };
  }
}

export default MeService;
