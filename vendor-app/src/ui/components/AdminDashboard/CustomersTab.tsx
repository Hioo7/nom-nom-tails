import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { useMemo, useState } from 'react';
import { useCustomerActions } from '../../../hooks/useCustomerActions';
import { useCustomers } from '../../../hooks/useCustomers';
import type { CustomerSummary } from '../../../types';
import CustomerList from './CustomerList';
import CustomerSearchBar from './CustomerSearchBar';
import { getErrorMessage } from './orderFormatters';

const customerSearchOptions: IFuseOptions<CustomerSummary> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'email', weight: 0.3 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

export default function CustomersTab() {
  const customerState = useCustomers();
  const [searchValue, setSearchValue] = useState('');
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const { updateCustomerLoyalty } = useCustomerActions({
    onCustomerUpdated: (updatedCustomer) => {
      customerState.setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === updatedCustomer.id ? updatedCustomer : customer,
        ),
      );
    },
  });

  const fuse = useMemo(
    () => new Fuse(customerState.customers, customerSearchOptions),
    [customerState.customers],
  );

  const filteredCustomers = useMemo(() => {
    const query = searchValue.trim();

    if (!query) {
      return customerState.customers;
    }

    return fuse.search(query).map((result) => result.item);
  }, [customerState.customers, fuse, searchValue]);

  async function handleToggle(customerId: string, isLoyalty: boolean): Promise<void> {
    setActionError('');
    setActiveCustomerId(customerId);

    try {
      await updateCustomerLoyalty(customerId, isLoyalty);
    } catch (error) {
      setActionError(getErrorMessage(error, 'Failed to update customer loyalty status.'));
    } finally {
      setActiveCustomerId(null);
    }
  }

  return (
    <div className="flex flex-col">
      <CustomerSearchBar
        searchValue={searchValue}
        totalCustomers={customerState.customers.length}
        visibleCustomers={filteredCustomers.length}
        onSearchChange={setSearchValue}
      />

      <CustomerList
        customers={filteredCustomers}
        isLoading={customerState.isLoading}
        error={customerState.error}
        actionError={actionError}
        activeCustomerId={activeCustomerId}
        searchValue={searchValue}
        onRetry={customerState.refetch}
        onClearSearch={() => setSearchValue('')}
        onToggle={(customerId, isLoyalty) => {
          void handleToggle(customerId, isLoyalty);
        }}
      />
    </div>
  );
}
