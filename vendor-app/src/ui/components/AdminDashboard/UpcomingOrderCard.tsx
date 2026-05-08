import { useState } from 'react';
import { FiCheck, FiInfo, FiX } from 'react-icons/fi';
import type { AdminUpcomingOrder } from '../../../types';
import FulfillOrderSheet from '../shared/FulfillOrderSheet';
import { formatDate, formatTimeSlotLabel } from './orderFormatters';

interface UpcomingOrderCardProps {
  order: AdminUpcomingOrder;
  isSubmitting: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onViewDetails: (orderId: string) => void;
  onFulfill: (orderId: string, handlingNotes?: string) => void;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export default function UpcomingOrderCard({
  order,
  isSubmitting,
  isApproving,
  isRejecting,
  onViewDetails,
  onFulfill,
  onApprove,
  onReject,
}: UpcomingOrderCardProps) {
  const [showFulfillSheet, setShowFulfillSheet] = useState(false);
  const isAwaitingApproval = order.status === 'AWAITING_APPROVAL';
  const isAnyActionPending = isSubmitting || isApproving || isRejecting;

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-base-content/50">#{order.orderNumber}</p>
            <h3 className="truncate text-base font-semibold text-base-content">
              {order.customerName}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAwaitingApproval && (
              <span className="badge badge-warning badge-sm">Same-day</span>
            )}
            <span className="badge badge-outline badge-sm">{formatDate(order.deliveryDate)}</span>
          </div>
        </div>

        <p className="truncate text-sm text-base-content/70">{order.customerEmail}</p>

        <div className="grid gap-2 text-sm text-base-content/70">
          <div className="flex items-center gap-2">
            <span className="badge badge-outline badge-sm border-base-200 bg-base-200 text-base-content/70">
              {formatTimeSlotLabel(order.timeSlot)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-ghost badge-sm">
              {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-circle btn-outline shrink-0"
            disabled={isAnyActionPending}
            aria-label={`View details for order ${order.orderNumber}`}
            onClick={() => onViewDetails(order.id)}
          >
            <FiInfo size={16} />
          </button>

          {isAwaitingApproval ? (
            <>
              <button
                type="button"
                className="btn btn-outline flex-1"
                disabled={isAnyActionPending}
                aria-label={`Reject order ${order.orderNumber}`}
                onClick={() => onReject(order.id)}
              >
                {isRejecting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <FiX size={18} />
                    Reject
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-neutral flex-1"
                disabled={isAnyActionPending}
                aria-label={`Accept order ${order.orderNumber}`}
                onClick={() => onApprove(order.id)}
              >
                {isApproving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <FiCheck size={18} />
                    Accept
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-neutral flex-1"
              disabled={isAnyActionPending}
              aria-label={`Mark order ${order.orderNumber} as completed`}
              onClick={() => { setShowFulfillSheet(true); }}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <FiCheck size={18} />
                  Mark completed
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showFulfillSheet ? (
        <FulfillOrderSheet
          orderNumber={order.orderNumber}
          isSubmitting={isSubmitting}
          error=""
          onClose={() => { if (!isSubmitting) setShowFulfillSheet(false); }}
          onConfirm={(notes) => {
            setShowFulfillSheet(false);
            onFulfill(order.id, notes ?? undefined);
          }}
        />
      ) : null}
    </div>
  );
}
