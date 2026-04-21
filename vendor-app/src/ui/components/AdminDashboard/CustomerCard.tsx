import type { CustomerSummary } from '../../../types';
import { formatDate } from './orderFormatters';

interface CustomerCardProps {
  customer: CustomerSummary;
  isSaving: boolean;
  onToggle: (customerId: string, isLoyalty: boolean) => void;
}

export default function CustomerCard({
  customer,
  isSaving,
  onToggle,
}: CustomerCardProps) {
  return (
    <article className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-base-content">
                {customer.name}
              </h2>
              <span
                className={`badge badge-sm ${
                  customer.isLoyalty ? 'badge-primary badge-outline' : 'badge-ghost'
                }`}
              >
                {customer.isLoyalty ? 'Loyalty' : 'Standard'}
              </span>
              <span
                className={`badge badge-sm ${
                  customer.isActive ? 'badge-success badge-outline' : 'badge-neutral badge-outline'
                }`}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-base-content/70">{customer.email}</p>
            <p className="mt-2 text-xs text-base-content/50">
              Joined {formatDate(customer.createdAt)}
            </p>
          </div>

          <label className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-xs font-medium text-base-content/60">
              {isSaving ? 'Saving...' : 'Loyalty'}
            </span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={customer.isLoyalty}
              disabled={isSaving}
              aria-label={`Toggle loyalty for ${customer.name}`}
              onChange={(event) => onToggle(customer.id, event.target.checked)}
            />
          </label>
        </div>
      </div>
    </article>
  );
}
