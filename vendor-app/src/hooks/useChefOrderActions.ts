import { ChefService } from '../services/chef.service';
import { useAuth } from './useAuth';

const chefService = new ChefService();

interface UseChefOrderActionsOptions {
  onOrderChanged?: () => void;
}

interface UseChefOrderActionsReturn {
  fulfillOrder: (orderId: string, handlingNotes?: string) => Promise<void>;
}

export function useChefOrderActions(options: UseChefOrderActionsOptions): UseChefOrderActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  };

  const fulfillOrder = async (orderId: string, handlingNotes?: string): Promise<void> => {
    await chefService.fulfillOrder(ensureToken(), orderId, handlingNotes);
    options.onOrderChanged?.();
  };

  return { fulfillOrder };
}
