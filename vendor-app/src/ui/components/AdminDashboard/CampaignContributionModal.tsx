import { useEffect, useMemo, useRef } from 'react';
import { FiUsers } from 'react-icons/fi';
import type { Campaign, CampaignContributionBreakdown } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';
import { formatCurrency, formatDateTime } from './orderFormatters';

interface CampaignContributionModalProps {
  campaign: Campaign;
  breakdown: CampaignContributionBreakdown | null;
  isLoading: boolean;
  error: string;
  onRetry: () => Promise<void>;
  onClose: () => void;
}

export default function CampaignContributionModal({
  campaign,
  breakdown,
  isLoading,
  error,
  onRetry,
  onClose,
}: CampaignContributionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const successfulCustomerTotals = useMemo(() => {
    return (breakdown?.customerBreakdown ?? []).filter(
      (item) => item.successfulContributionCount > 0 && item.totalAmount > 0,
    );
  }, [breakdown]);

  return (
    <MobileModalShell
      dialogRef={dialogRef}
      title="Successful contributions"
      description={`Customer totals for ${campaign.name}`}
      icon={<FiUsers size={18} />}
      onClose={onClose}
      maxWidthClassName="sm:max-w-lg"
      footer={(
        <button type="button" className="btn btn-neutral w-full" onClick={onClose}>
          Close
        </button>
      )}
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-error/20 bg-error/5 p-4">
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            className="btn btn-sm btn-error mt-3"
            onClick={() => {
              void onRetry();
            }}
          >
            Retry
          </button>
        </div>
      ) : successfulCustomerTotals.length === 0 ? (
        <div className="rounded-3xl border border-base-200 bg-base-200/60 p-6 text-center">
          <p className="text-sm font-medium text-base-content">No successful contributions yet</p>
          <p className="mt-1 text-xs text-base-content/60">
            This campaign has not received any successful customer contributions so far.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {successfulCustomerTotals.map((item) => (
            <div
              key={item.customerId}
              className="rounded-3xl border border-base-200 bg-base-100 px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-base-content">{item.customerName}</p>
                  <p className="truncate text-xs text-base-content/60">{item.customerEmail}</p>
                </div>
                <span className="badge badge-primary badge-md shrink-0 font-semibold">
                  {formatCurrency(item.totalAmount)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge badge-ghost badge-sm">
                  {item.successfulContributionCount} successful
                </span>
                <span className="badge badge-ghost badge-sm">
                  Last: {formatDateTime(item.lastContributionAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileModalShell>
  );
}

