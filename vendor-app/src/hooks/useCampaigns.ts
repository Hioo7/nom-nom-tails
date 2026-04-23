import { useCallback, useEffect, useState } from 'react';
import { CampaignService } from '../services/campaign.service';
import type { Campaign } from '../types';
import { useAuth } from './useAuth';

const campaignService = new CampaignService();

interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useCampaigns(): UseCampaignsReturn {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    campaignService
      .listCampaigns(token)
      .then((data) => {
        setCampaigns(data);
        setError('');
      })
      .catch(() => {
        setError('Failed to load campaigns.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((value) => value + 1);
  }, []);

  return { campaigns, isLoading, error, refetch };
}

