import type { CustomerSummary } from '../../../types';
import CustomerCard from './CustomerCard';

interface CustomerListProps {
  customers: CustomerSummary[];
  isLoading: boolean;
  error: string;
  actionError: string;
  activeCustomerId: string | null;
  searchValue: string;
  onRetry: () => void;
  onClearSearch: () => void;
  onToggle: (customerId: string, isLoyalty: boolean) => void;
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
        >
          <div className="mb-3 h-5 w-1/3 animate-pulse rounded bg-base-200" />
          <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-base-200" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-base-200" />
        </div>
      ))}
    </div>
  );
}

export default function CustomerList({
  customers,
  isLoading,
  error,
  actionError,
  activeCustomerId,
  searchValue,
  onRetry,
  onClearSearch,
  onToggle,
}: CustomerListProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-4">
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-10 text-center">
          <h2 className="text-base font-semibold text-base-content">
            {searchValue.trim() ? 'No matching customers' : 'No customers yet'}
          </h2>
          <p className="mt-2 text-sm text-base-content/60">
            {searchValue.trim()
              ? 'Try a different name or email to find the customer you need.'
              : 'Customer accounts will appear here once orders start coming in.'}
          </p>

          {searchValue.trim() ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-4"
              onClick={onClearSearch}
            >
              Clear search
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {actionError ? (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      ) : null}

      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          isSaving={activeCustomerId === customer.id}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
