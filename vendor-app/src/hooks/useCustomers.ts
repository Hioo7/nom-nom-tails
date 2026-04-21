import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CustomerSummary } from '../types';
import { CustomerService } from '../services/customer.service';
import { useAuth } from './useAuth';

const customerService = new CustomerService();

interface UseCustomersReturn {
  customers: CustomerSummary[];
  setCustomers: Dispatch<SetStateAction<CustomerSummary[]>>;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useCustomers(): UseCustomersReturn {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    customerService
      .listCustomers(token)
      .then((data) => {
        setCustomers(data);
        setError('');
      })
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((value) => value + 1);
  }, []);

  return { customers, setCustomers, isLoading, error, refetch };
}
