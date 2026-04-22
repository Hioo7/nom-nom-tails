import { DeliveryPartnerService } from '../services/deliveryPartner.service';
import { useAuth } from './useAuth';

const deliveryPartnerService = new DeliveryPartnerService();

interface UseDeliveryTaskActionsReturn {
  acceptTask: (taskId: string) => Promise<void>;
  failTask: (taskId: string, failureReason: string) => Promise<void>;
  completeTask: (taskId: string, file: File) => Promise<void>;
}

export function useDeliveryTaskActions(): UseDeliveryTaskActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const acceptTask = async (taskId: string): Promise<void> =>
    deliveryPartnerService.acceptTask(ensureToken(), taskId);

  const failTask = async (taskId: string, failureReason: string): Promise<void> =>
    deliveryPartnerService.failTask(ensureToken(), taskId, { failureReason });

  const completeTask = async (taskId: string, file: File): Promise<void> =>
    deliveryPartnerService.completeTask(ensureToken(), taskId, file);

  return { acceptTask, failTask, completeTask };
}
