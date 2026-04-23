import { CampaignContributionStatus, CampaignStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import AppConfig from '../config/AppConfig';
import { MINIO_BUCKET } from '../config/constants';
import { compressToAvif } from '../lib/imageCompress';
import MinioStorage from '../lib/minio';
import { toPaise } from '../lib/money';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { parseDateLocal } from '../lib/dateUtils';
import {
  CreateCampaignInput,
  ListCampaignsQueryInput,
  UpdateCampaignInput,
} from '../schema/campaign.schema';

interface CampaignSummary {
  totalRaised: number;
  totalContributionCount: number;
  successfulContributionCount: number;
  failedContributionCount: number;
}

interface SafeCampaign {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costAmount: number;
  startDate: Date;
  endDate: Date | null;
  isOngoing: boolean;
  status: CampaignStatus;
  summary: CampaignSummary;
  createdAt: Date;
  updatedAt: Date;
}

interface SafeCampaignContribution {
  id: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: CampaignContributionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface SafeCampaignCustomerBreakdown {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  successfulContributionCount: number;
  failedContributionCount: number;
  lastContributionAt: Date;
}

interface SafeCampaignContributionBreakdown {
  campaign: SafeCampaign;
  customerBreakdown: SafeCampaignCustomerBreakdown[];
  contributions: SafeCampaignContribution[];
}

type CampaignWithSummary = Prisma.CampaignGetPayload<{
  include: {
    contributions: {
      select: {
        amount: true;
        status: true;
      };
    };
  };
}>;

type CampaignWithContributionDetails = Prisma.CampaignGetPayload<{
  include: {
    contributions: {
      include: {
        customer: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

const includeCampaignSummary = {
  contributions: {
    select: {
      amount: true,
      status: true,
    },
  },
} satisfies Prisma.CampaignInclude;

const includeCampaignContributionDetails = {
  contributions: {
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.CampaignInclude;

function summarizeContributions(
  contributions: Array<{ amount: number; status: CampaignContributionStatus }>,
): CampaignSummary {
  return contributions.reduce<CampaignSummary>(
    (summary, contribution) => {
      summary.totalContributionCount += 1;

      if (contribution.status === CampaignContributionStatus.SUCCESS) {
        summary.successfulContributionCount += 1;
        summary.totalRaised += contribution.amount;
      } else {
        summary.failedContributionCount += 1;
      }

      return summary;
    },
    {
      totalRaised: 0,
      totalContributionCount: 0,
      successfulContributionCount: 0,
      failedContributionCount: 0,
    },
  );
}

function toSafeCampaign(campaign: CampaignWithSummary): SafeCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description ?? null,
    imageUrl: campaign.imageUrl ?? null,
    costAmount: campaign.costAmount,
    startDate: campaign.startDate,
    endDate: campaign.endDate ?? null,
    isOngoing: campaign.endDate === null,
    status: campaign.status,
    summary: summarizeContributions(campaign.contributions),
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

function toSafeCampaignContribution(
  contribution: CampaignWithContributionDetails['contributions'][number],
): SafeCampaignContribution {
  return {
    id: contribution.id,
    customer: {
      id: contribution.customer.id,
      name: contribution.customer.name,
      email: contribution.customer.email,
    },
    amount: contribution.amount,
    status: contribution.status,
    createdAt: contribution.createdAt,
    updatedAt: contribution.updatedAt,
  };
}

class CampaignService {
  private static instance: CampaignService;

  static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  async listCampaigns(filters: ListCampaignsQueryInput): Promise<SafeCampaign[]> {
    const where: Prisma.CampaignWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: includeCampaignSummary,
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(toSafeCampaign);
  }

  async getCampaign(id: string): Promise<SafeCampaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: includeCampaignSummary,
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    return toSafeCampaign(campaign);
  }

  async createCampaign(data: CreateCampaignInput): Promise<SafeCampaign> {
    const { startDate, endDate } = this.resolveCampaignWindow(data);

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description?.trim() ? data.description.trim() : null,
        imageUrl: data.imageUrl ?? null,
        costAmount: toPaise(data.cost),
        startDate,
        endDate,
        status: data.status,
      },
      include: includeCampaignSummary,
    });

    return toSafeCampaign(campaign);
  }

  async updateCampaign(id: string, data: UpdateCampaignInput): Promise<SafeCampaign> {
    const existing = await prisma.campaign.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError(404, 'Campaign not found');
    }

    const { startDate, endDate } = this.resolveCampaignWindow(data, {
      startDate: existing.startDate,
      endDate: existing.endDate,
    });

    const updateData: Prisma.CampaignUpdateInput = {
      startDate,
      endDate,
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() ? data.description.trim() : null;
    }

    if (data.cost !== undefined) {
      updateData.costAmount = toPaise(data.cost);
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl ?? null;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: includeCampaignSummary,
    });

    return toSafeCampaign(campaign);
  }

  async deactivateCampaign(id: string): Promise<SafeCampaign> {
    await this.findOrThrow(id);

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.INACTIVE },
      include: includeCampaignSummary,
    });

    return toSafeCampaign(campaign);
  }

  async uploadImage(campaignId: string, buffer: Buffer): Promise<string> {
    const existing = await prisma.campaign.findUnique({ where: { id: campaignId } });

    if (!existing) {
      throw new AppError(404, 'Campaign not found');
    }

    const compressed = await compressToAvif(buffer);
    const key = `campaigns/${campaignId}/${randomUUID()}.avif`;
    await MinioStorage.getInstance().putObject(MINIO_BUCKET, key, compressed, 'image/avif');

    if (existing.imageUrl) {
      await this.removeImageFromStorage(existing.imageUrl);
    }

    const imageUrl = `${AppConfig.getInstance().imageBaseUrl}/${key}`;

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { imageUrl },
    });

    return imageUrl;
  }

  async getCampaignContributionBreakdown(id: string): Promise<SafeCampaignContributionBreakdown> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: includeCampaignContributionDetails,
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const customerBreakdownMap = new Map<string, SafeCampaignCustomerBreakdown>();

    for (const contribution of campaign.contributions) {
      const current = customerBreakdownMap.get(contribution.customerId);

      if (current) {
        if (contribution.status === CampaignContributionStatus.SUCCESS) {
          current.totalAmount += contribution.amount;
          current.successfulContributionCount += 1;
        } else {
          current.failedContributionCount += 1;
        }

        if (contribution.createdAt > current.lastContributionAt) {
          current.lastContributionAt = contribution.createdAt;
        }

        continue;
      }

      customerBreakdownMap.set(contribution.customerId, {
        customerId: contribution.customerId,
        customerName: contribution.customer.name,
        customerEmail: contribution.customer.email,
        totalAmount:
          contribution.status === CampaignContributionStatus.SUCCESS ? contribution.amount : 0,
        successfulContributionCount:
          contribution.status === CampaignContributionStatus.SUCCESS ? 1 : 0,
        failedContributionCount:
          contribution.status === CampaignContributionStatus.FAILED ? 1 : 0,
        lastContributionAt: contribution.createdAt,
      });
    }

    return {
      campaign: toSafeCampaign(campaign),
      customerBreakdown: Array.from(customerBreakdownMap.values()).sort(
        (left, right) => right.totalAmount - left.totalAmount,
      ),
      contributions: campaign.contributions
        .slice()
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map(toSafeCampaignContribution),
    };
  }

  private resolveCampaignWindow(
    data: CreateCampaignInput | UpdateCampaignInput,
    existing?: { startDate: Date; endDate: Date | null },
  ): { startDate: Date; endDate: Date | null } {
    const hasStartDate = Object.prototype.hasOwnProperty.call(data, 'startDate');
    const hasEndDate = Object.prototype.hasOwnProperty.call(data, 'endDate');
    const hasRunForever = Object.prototype.hasOwnProperty.call(data, 'runForever');

    const startDate =
      hasStartDate && data.startDate ? parseDateLocal(data.startDate) : existing?.startDate;

    if (!startDate) {
      throw new AppError(400, 'Start date is required');
    }

    const runForever =
      hasRunForever && data.runForever !== undefined
        ? data.runForever
        : existing
          ? existing.endDate === null
          : false;

    let endDate = existing?.endDate ?? null;

    if (runForever) {
      endDate = null;
    } else if (hasEndDate) {
      if (!data.endDate) {
        throw new AppError(400, 'End date is required unless runForever is true');
      }

      endDate = parseDateLocal(data.endDate);
    } else if (!existing) {
      throw new AppError(400, 'End date is required unless runForever is true');
    }

    if (!runForever && !endDate) {
      throw new AppError(400, 'End date is required unless runForever is true');
    }

    if (endDate && endDate < startDate) {
      throw new AppError(400, 'End date cannot be earlier than start date');
    }

    return { startDate, endDate };
  }

  private async findOrThrow(id: string): Promise<void> {
    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }
  }

  private async removeImageFromStorage(imageUrl: string): Promise<void> {
    const base = AppConfig.getInstance().imageBaseUrl;
    const key = imageUrl.replace(`${base}/`, '');

    try {
      await MinioStorage.getInstance().removeObject(MINIO_BUCKET, key);
    } catch {
      // best-effort cleanup
    }
  }
}

export default CampaignService;
