import { FiDollarSign } from 'react-icons/fi';
import type { PendingSettlementOrder } from '../../../types';
import SettlementCard from './SettlementCard';

interface SettlementsSectionProps {
  settlements: PendingSettlementOrder[];
  isLoading: boolean;
  error: string;
  actionError: string;
  onRetry: () => void;
  onRecordPayment: (settlement: PendingSettlementOrder) => void;
}

export default function SettlementsSection({
  settlements,
  isLoading,
  error,
  actionError,
  onRetry,
  onRecordPayment,
}: SettlementsSectionProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-lg font-bold text-base-content">Settlements</h2>
        <p className="text-sm text-base-content/60">
          Track pending dues here. Tap a settlement to review payment records or add a payment.
        </p>
      </div>

      {actionError ? (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : settlements.length === 0 ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <FiDollarSign className="text-base-content/20" size={56} />
            <h3 className="font-semibold text-base-content/70">No pending settlements</h3>
            <p className="text-sm text-base-content/50">
              Fully settled orders are automatically excluded here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {settlements.map((settlement) => (
            <SettlementCard
              key={settlement.orderId}
              settlement={settlement}
              onRecordPayment={onRecordPayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
