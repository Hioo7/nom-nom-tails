import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { DeliveryPartnerSummary, DeliveryTaskStatus } from '../../../types';

const STATUS_BADGE: Record<DeliveryTaskStatus, string> = {
  AVAILABLE: 'badge-ghost',
  ASSIGNED: 'badge-warning',
  PICKED_UP: 'badge-info',
  DELIVERED: 'badge-success',
  FAILED: 'badge-error',
};

const STATUS_LABEL: Record<DeliveryTaskStatus, string> = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};

interface DeliveryPartnerCardProps {
  partner: DeliveryPartnerSummary;
}

export default function DeliveryPartnerCard({ partner }: DeliveryPartnerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pickedUpCount = partner.orders.filter((order) => order.status === 'PICKED_UP').length;
  const failedCount = partner.orders.filter((order) => order.status === 'FAILED').length;
  const totalOrders = partner.orders.length;

  return (
    <div className="card overflow-hidden border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="w-full text-left transition-colors hover:bg-base-200/30"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="truncate text-base font-semibold text-base-content">{partner.name}</p>
                <span className={`badge badge-sm ${totalOrders > 0 ? 'badge-primary' : 'badge-ghost'}`}>
                  {totalOrders > 0 ? `${totalOrders} deliveries` : 'No deliveries'}
                </span>
              </div>
              <p className="mt-1 text-sm text-base-content/60">
                {totalOrders > 0
                  ? 'Tap to review today’s assigned, picked-up, and completed orders.'
                  : 'This partner has no delivery tasks for today.'}
              </p>
            </div>
            <span className="mt-0.5 text-base-content/40 shrink-0">
              {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
                Assigned
              </p>
              <p className="mt-1 font-semibold text-base-content">{partner.assignedCount}</p>
            </div>
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
                Picked up
              </p>
              <p className="mt-1 font-semibold text-base-content">{pickedUpCount}</p>
            </div>
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
                Completed
              </p>
              <p className="mt-1 font-semibold text-base-content">{partner.completedCount}</p>
            </div>
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
                Failed
              </p>
              <p className="mt-1 font-semibold text-base-content">{failedCount}</p>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-base-200 px-4 py-4 sm:px-5">
          {partner.orders.length === 0 ? (
            <div className="rounded-box bg-base-200 px-4 py-6 text-center">
              <p className="text-sm text-base-content/50">No deliveries today</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {partner.orders.map((order) => (
                <div
                  key={order.orderId}
                  className="rounded-box border border-base-200 bg-base-100 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                        Order
                      </p>
                      <p className="font-mono text-sm font-semibold text-base-content">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <span className={`badge badge-sm ${STATUS_BADGE[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
