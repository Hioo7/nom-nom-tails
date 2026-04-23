import { NextFunction, Request, Response } from 'express';
import CustomerCampaignService from '../services/customerCampaign.service';
import { parseCreateCampaignContributionBody } from '../validators/campaign.validator';

const customerCampaignService = CustomerCampaignService.getInstance();

export async function listCustomerCampaigns(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaigns = await customerCampaignService.listCampaigns();
    res.status(200).json({ data: campaigns });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await customerCampaignService.getCampaign(req.params['id'] as string);
    res.status(200).json({ data: campaign });
  } catch (error) {
    next(error);
  }
}

export async function createCustomerCampaignContribution(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    parseCreateCampaignContributionBody((req.body ?? {}) as object);

    const contribution = await customerCampaignService.createContribution(
      req.user!.id,
      req.params['id'] as string,
    );

    res.status(201).json({ data: contribution });
  } catch (error) {
    next(error);
  }
}

export async function listMyCampaignContributions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const contributions = await customerCampaignService.listMyContributions(req.user!.id);
    res.status(200).json({ data: contributions });
  } catch (error) {
    next(error);
  }
}
