import { CampaignContributionStatus, CampaignStatus, Prisma } from '@prisma/client';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';

interface CustomerCampaignSummary {
  totalRaised: number;
  totalContributionCount: number;
  successfulContributionCount: number;
}

interface SafeCustomerCampaign {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costAmount: number;
  startDate: Date;
  endDate: Date | null;
  isOngoing: boolean;
  summary: CustomerCampaignSummary;
  createdAt: Date;
  updatedAt: Date;
}

interface SafeCustomerCampaignContribution {
  id: string;
  campaign: {
    id: string;
    name: string;
    imageUrl: string | null;
    costAmount: number;
  };
  amount: number;
  status: CampaignContributionStatus;
  createdAt: Date;
  updatedAt: Date;
}

type CampaignForCustomer = Prisma.CampaignGetPayload<{
  include: {
    contributions: {
      select: {
        amount: true;
        status: true;
      };
    };
  };
}>;

type CampaignContributionWithCampaign = Prisma.CampaignContributionGetPayload<{
  include: {
    campaign: {
      select: {
        id: true;
        name: true;
        imageUrl: true;
        costAmount: true;
      };
    };
  };
}>;

const includeCustomerCampaignSummary = {
  contributions: {
    select: {
      amount: true,
      status: true,
    },
  },
} satisfies Prisma.CampaignInclude;

function toCustomerCampaignSummary(
  contributions: Array<{ amount: number; status: CampaignContributionStatus }>,
): CustomerCampaignSummary {
  return contributions.reduce<CustomerCampaignSummary>(
    (summary, contribution) => {
      summary.totalContributionCount += 1;

      if (contribution.status === CampaignContributionStatus.SUCCESS) {
        summary.totalRaised += contribution.amount;
        summary.successfulContributionCount += 1;
      }

      return summary;
    },
    {
      totalRaised: 0,
      totalContributionCount: 0,
      successfulContributionCount: 0,
    },
  );
}

function toSafeCustomerCampaign(campaign: CampaignForCustomer): SafeCustomerCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description ?? null,
    imageUrl: campaign.imageUrl ?? null,
    costAmount: campaign.costAmount,
    startDate: campaign.startDate,
    endDate: campaign.endDate ?? null,
    isOngoing: campaign.endDate === null,
    summary: toCustomerCampaignSummary(campaign.contributions),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

function toSafeCustomerCampaignContribution(
  contribution: CampaignContributionWithCampaign,
): SafeCustomerCampaignContribution {
  return {
    id: contribution.id,
    campaign: {
      id: contribution.campaign.id,
      name: contribution.campaign.name,
      imageUrl: contribution.campaign.imageUrl,
      costAmount: contribution.campaign.costAmount,
    },
    amount: contribution.amount,
    status: contribution.status,
    createdAt: contribution.createdAt,
    updatedAt: contribution.updatedAt,
  };
}

class CustomerCampaignService {
  private static instance: CustomerCampaignService;

  static getInstance(): CustomerCampaignService {
    if (!CustomerCampaignService.instance) {
      CustomerCampaignService.instance = new CustomerCampaignService();
    }
    return CustomerCampaignService.instance;
  }

  async listCampaigns(): Promise<SafeCustomerCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: this.buildVisibleCampaignWhere(),
      include: includeCustomerCampaignSummary,
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    });

    return campaigns.map(toSafeCustomerCampaign);
  }

  async getCampaign(id: string): Promise<SafeCustomerCampaign> {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        ...this.buildVisibleCampaignWhere(),
      },
      include: includeCustomerCampaignSummary,
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    return toSafeCustomerCampaign(campaign);
  }

  async createContribution(customerId: string, campaignId: string): Promise<SafeCustomerCampaignContribution> {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        ...this.buildVisibleCampaignWhere(),
      },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const contribution = await prisma.campaignContribution.create({
      data: {
        campaignId,
        customerId,
        amount: campaign.costAmount,
        status: CampaignContributionStatus.SUCCESS,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            costAmount: true,
          },
        },
      },
    });

    return toSafeCustomerCampaignContribution(contribution);
  }

  async listMyContributions(customerId: string): Promise<SafeCustomerCampaignContribution[]> {
    const contributions = await prisma.campaignContribution.findMany({
      where: { customerId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            costAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contributions.map(toSafeCustomerCampaignContribution);
  }

  private buildVisibleCampaignWhere(): Prisma.CampaignWhereInput {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return {
      status: CampaignStatus.ACTIVE,
      startDate: { lte: todayStart },
      OR: [
        { endDate: null },
        { endDate: { gte: todayStart } },
      ],
    };
  }
}

export default CustomerCampaignService;
