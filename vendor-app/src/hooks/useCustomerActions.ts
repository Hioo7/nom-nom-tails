import type { CustomerSummary } from '../types';
import { CustomerService } from '../services/customer.service';
import { useAuth } from './useAuth';

const customerService = new CustomerService();

interface UseCustomerActionsOptions {
  onCustomerUpdated?: (customer: CustomerSummary) => void;
}

interface UseCustomerActionsReturn {
  updateCustomerLoyalty: (id: string, isLoyalty: boolean) => Promise<CustomerSummary>;
}

export function useCustomerActions(
  options: UseCustomerActionsOptions = {},
): UseCustomerActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const updateCustomerLoyalty = async (
    id: string,
    isLoyalty: boolean,
  ): Promise<CustomerSummary> => {
    const customer = await customerService.updateCustomerLoyalty(ensureToken(), id, {
      isLoyalty,
    });

    options.onCustomerUpdated?.(customer);

    return customer;
  };

  return { updateCustomerLoyalty };
}
