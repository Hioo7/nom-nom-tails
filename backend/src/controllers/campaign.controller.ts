import { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';
import CampaignService from '../services/campaign.service';
import {
  parseCreateCampaignBody,
  parseListCampaignsQuery,
  parseUpdateCampaignBody,
} from '../validators/campaign.validator';

const campaignService = CampaignService.getInstance();

export async function listCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filters = parseListCampaignsQuery(req.query as object);
    const campaigns = await campaignService.listCampaigns(filters);
    res.status(200).json({ data: campaigns });
  } catch (error) {
    next(error);
  }
}

export async function getCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await campaignService.getCampaign(req.params['id'] as string);
    res.status(200).json({ data: campaign });
  } catch (error) {
    next(error);
  }
}

export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await campaignService.createCampaign(parseCreateCampaignBody(req.body as object));
    res.status(201).json({ data: campaign });
  } catch (error) {
    next(error);
  }
}

export async function updateCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await campaignService.updateCampaign(
      req.params['id'] as string,
      parseUpdateCampaignBody(req.body as object),
    );
    res.status(200).json({ data: campaign });
  } catch (error) {
    next(error);
  }
}

export async function deactivateCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaign = await campaignService.deactivateCampaign(req.params['id'] as string);
    res.status(200).json({ data: campaign });
  } catch (error) {
    next(error);
  }
}

export async function uploadCampaignImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      return next(new AppError(400, 'No image file provided'));
    }

    const url = await campaignService.uploadImage(req.params['id'] as string, req.file.buffer);
    res.status(200).json({ data: { url } });
  } catch (error) {
    next(error);
  }
}

export async function listCampaignContributions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await campaignService.getCampaignContributionBreakdown(req.params['id'] as string);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}
