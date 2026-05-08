import { useState } from 'react';
import { FiCheck, FiClock, FiInfo, FiPackage, FiUser } from 'react-icons/fi';
import type { ChefOrder } from '../../../types';
import { formatDate, formatTimeSlotLabel } from '../AdminDashboard/orderFormatters';
import FulfillOrderSheet from '../shared/FulfillOrderSheet';
import ChefOrderDetailsModal from './ChefOrderDetailsModal';

interface ChefOrderCardProps {
  order: ChefOrder;
  onFulfill: (orderId: string, handlingNotes?: string) => Promise<void>;
}

function isDelayed(endTime: string): boolean {
  const [h, m] = endTime.split(':').map(Number);
  const slotEnd = new Date();
  slotEnd.setHours(h, m, 0, 0);
  return new Date() > slotEnd;
}

export default function ChefOrderCard({ order, onFulfill }: ChefOrderCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showFulfillSheet, setShowFulfillSheet] = useState(false);

  const delayed = isDelayed(order.timeSlot.endTime);
  const totalItems = order.dishes.reduce((sum, d) => sum + d.quantity, 0);
  const dishSummary = order.dishes.map((d) => `${d.name} ×${d.quantity}`).join(', ');

  const handleFulfill = async (handlingNotes?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onFulfill(order.id, handlingNotes);
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr?.message ?? 'Failed to mark order as ready.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-base-content/50">#{order.orderNumber}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FiUser size={13} className="shrink-0 text-base-content/40" />
              <h3 className="truncate text-base font-semibold text-base-content">
                {order.customerName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {delayed && (
              <span className="badge badge-warning badge-sm gap-1 font-medium">
                <FiClock size={10} />
                Delayed
              </span>
            )}
            <span className="badge badge-outline badge-sm">{formatDate(order.deliveryDate)}</span>
          </div>
        </div>

        <p className="truncate text-sm text-base-content/70">{dishSummary}</p>

        <div className="grid gap-2 text-sm text-base-content/70">
          <div className="flex items-center gap-2">
            <FiClock size={14} className="shrink-0 text-base-content/40" />
            <span className="badge badge-outline badge-sm border-base-200 bg-base-200 text-base-content/70">
              {formatTimeSlotLabel(order.timeSlot)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiPackage size={14} className="shrink-0 text-base-content/40" />
            <span className="badge badge-ghost badge-sm">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {errorMessage ? (
          <div className="alert alert-error py-2 text-sm">
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-circle btn-outline shrink-0"
            disabled={isSubmitting}
            aria-label={`View details for order ${order.orderNumber}`}
            onClick={() => setShowDetails(true)}
          >
            <FiInfo size={16} />
          </button>

          <button
            type="button"
            className="btn btn-neutral flex-1"
            disabled={isSubmitting}
            aria-label={`Mark order ${order.orderNumber} as ready`}
            onClick={() => { setShowFulfillSheet(true); }}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <FiCheck size={18} />
                Mark ready
              </>
            )}
          </button>
        </div>
      </div>

      {showDetails ? (
        <ChefOrderDetailsModal order={order} onClose={() => setShowDetails(false)} />
      ) : null}

      {showFulfillSheet ? (
        <FulfillOrderSheet
          orderNumber={order.orderNumber}
          isSubmitting={isSubmitting}
          error={errorMessage}
          onClose={() => { if (!isSubmitting) setShowFulfillSheet(false); }}
          onConfirm={(notes) => { void handleFulfill(notes ?? undefined); }}
        />
      ) : null}
    </div>
  );
}
