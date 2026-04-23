import { CampaignService } from '../services/campaign.service';
import type { CreateCampaignPayload, UpdateCampaignPayload } from '../types';
import { useAuth } from './useAuth';

const campaignService = new CampaignService();

interface UseCampaignActionsReturn {
  createCampaign: (payload: CreateCampaignPayload, imageFile?: File) => Promise<void>;
  updateCampaign: (id: string, payload: UpdateCampaignPayload, imageFile?: File) => Promise<void>;
  deactivateCampaign: (id: string) => Promise<void>;
}

export function useCampaignActions(refetch: () => void): UseCampaignActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const createCampaign = async (
    payload: CreateCampaignPayload,
    imageFile?: File,
  ): Promise<void> => {
    const currentToken = ensureToken();
    const campaign = await campaignService.createCampaign(currentToken, payload);

    if (imageFile) {
      const imageUrl = await campaignService.uploadImage(currentToken, campaign.id, imageFile);
      await campaignService.updateCampaign(currentToken, campaign.id, { imageUrl });
    }

    refetch();
  };

  const updateCampaign = async (
    id: string,
    payload: UpdateCampaignPayload,
    imageFile?: File,
  ): Promise<void> => {
    const currentToken = ensureToken();
    let finalPayload = payload;

    if (imageFile) {
      const imageUrl = await campaignService.uploadImage(currentToken, id, imageFile);
      finalPayload = { ...payload, imageUrl };
    }

    await campaignService.updateCampaign(currentToken, id, finalPayload);
    refetch();
  };

  const deactivateCampaign = async (id: string): Promise<void> => {
    await campaignService.deactivateCampaign(ensureToken(), id);
    refetch();
  };

  return { createCampaign, updateCampaign, deactivateCampaign };
}
