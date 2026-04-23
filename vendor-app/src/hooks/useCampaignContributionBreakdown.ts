import { useState } from 'react';
import { CampaignService } from '../services/campaign.service';
import type { Campaign, CampaignContributionBreakdown } from '../types';
import { useAuth } from './useAuth';

const campaignService = new CampaignService();

interface UseCampaignContributionBreakdownReturn {
  selectedCampaign: Campaign | null;
  breakdown: CampaignContributionBreakdown | null;
  isLoading: boolean;
  error: string;
  openContributionBreakdown: (campaign: Campaign) => Promise<void>;
  closeContributionBreakdown: () => void;
  retryContributionBreakdown: () => Promise<void>;
}

export function useCampaignContributionBreakdown(): UseCampaignContributionBreakdownReturn {
  const { token } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [breakdown, setBreakdown] = useState<CampaignContributionBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const loadBreakdown = async (campaign: Campaign): Promise<void> => {
    setSelectedCampaign(campaign);
    setIsLoading(true);
    setError('');

    try {
      const nextBreakdown = await campaignService.getCampaignContributionBreakdown(
        ensureToken(),
        campaign.id,
      );
      setBreakdown(nextBreakdown);
    } catch (loadError) {
      if (loadError instanceof Error && loadError.message) {
        setError(loadError.message);
      } else {
        setError('Failed to load contribution details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openContributionBreakdown = async (campaign: Campaign): Promise<void> => {
    await loadBreakdown(campaign);
  };

  const closeContributionBreakdown = (): void => {
    setSelectedCampaign(null);
    setBreakdown(null);
    setIsLoading(false);
    setError('');
  };

  const retryContributionBreakdown = async (): Promise<void> => {
    if (!selectedCampaign) {
      return;
    }

    await loadBreakdown(selectedCampaign);
  };

  return {
    selectedCampaign,
    breakdown,
    isLoading,
    error,
    openContributionBreakdown,
    closeContributionBreakdown,
    retryContributionBreakdown,
  };
}

