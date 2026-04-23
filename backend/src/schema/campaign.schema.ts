import { CampaignStatus } from '@prisma/client';
import { z } from 'zod';
import { hasAtMostTwoDecimalPlaces } from '../lib/money';

const campaignStatusValues = Object.values(CampaignStatus) as [CampaignStatus, ...CampaignStatus[]];

const CampaignCostSchema = z
  .number()
  .positive('Cost must be positive')
  .refine(hasAtMostTwoDecimalPlaces, {
    message: 'Cost can have at most 2 decimal places',
  });

export const CreateCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required'),
  description: z.string().trim().optional(),
  cost: CampaignCostSchema,
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required').nullable().optional(),
  runForever: z.boolean().default(false),
  status: z.enum(campaignStatusValues).default(CampaignStatus.ACTIVE),
  imageUrl: z.string().url('Invalid image URL').nullable().optional(),
});

export const UpdateCampaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Campaign name is required').optional(),
    description: z.string().trim().nullable().optional(),
    cost: CampaignCostSchema.optional(),
    startDate: z.string().min(1, 'Start date is required').optional(),
    endDate: z.string().min(1, 'End date is required').nullable().optional(),
    runForever: z.boolean().optional(),
    status: z.enum(campaignStatusValues).optional(),
    imageUrl: z.string().url('Invalid image URL').nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const ListCampaignsQuerySchema = z.object({
  status: z.enum(campaignStatusValues).optional(),
});

export const CreateCampaignContributionSchema = z.object({}).strict();

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type ListCampaignsQueryInput = z.infer<typeof ListCampaignsQuerySchema>;
export type CreateCampaignContributionInput = z.infer<typeof CreateCampaignContributionSchema>;
