import { useCallback, useEffect, useState } from 'react';
import { DeliveryPartnerService } from '../services/deliveryPartner.service';
import type { DeliveryPartnerSummary } from '../types';
import { useAuth } from './useAuth';

const deliveryPartnerService = new DeliveryPartnerService();

interface UseDeliveryPartnersReturn {
  partners: DeliveryPartnerSummary[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useDeliveryPartners(): UseDeliveryPartnersReturn {
  const { token } = useAuth();
  const [partners, setPartners] = useState<DeliveryPartnerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    deliveryPartnerService
      .listPartnersWithTodayDeliveries(token)
      .then((data) => {
        setPartners(data);
        setError('');
      })
      .catch(() => setError('Failed to load delivery partners.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((t) => t + 1);
  }, []);

  return { partners, isLoading, error, refetch };
}
