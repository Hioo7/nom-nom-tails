import {
  CreateCampaignContributionInput,
  CreateCampaignContributionSchema,
  CreateCampaignInput,
  CreateCampaignSchema,
  ListCampaignsQueryInput,
  ListCampaignsQuerySchema,
  UpdateCampaignInput,
  UpdateCampaignSchema,
} from '../schema/campaign.schema';
import { parseBody } from './validate';

export function parseCreateCampaignBody(body: object): CreateCampaignInput {
  return parseBody(CreateCampaignSchema, body);
}

export function parseUpdateCampaignBody(body: object): UpdateCampaignInput {
  return parseBody(UpdateCampaignSchema, body);
}

export function parseListCampaignsQuery(query: object): ListCampaignsQueryInput {
  return parseBody(ListCampaignsQuerySchema, query);
}

export function parseCreateCampaignContributionBody(
  body: object,
): CreateCampaignContributionInput {
  return parseBody(CreateCampaignContributionSchema, body);
}
