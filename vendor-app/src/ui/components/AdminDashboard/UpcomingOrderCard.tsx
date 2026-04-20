import { FiInfo } from 'react-icons/fi';
import type { AdminUpcomingOrder } from '../../../types';
import { formatDate, formatTimeSlotLabel } from './orderFormatters';

interface UpcomingOrderCardProps {
  order: AdminUpcomingOrder;
  isSubmitting: boolean;
  onViewDetails: (orderId: string) => void;
  onFulfill: (orderId: string) => void;
}

export default function UpcomingOrderCard({
  order,
  isSubmitting,
  onViewDetails,
  onFulfill,
}: UpcomingOrderCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 gap-4">
        <div className="flex items-start gap-3">
          <label className="flex items-center gap-2 shrink-0 mt-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={false}
              disabled={isSubmitting}
              onChange={() => onFulfill(order.id)}
              aria-label={`Mark order ${order.orderNumber} as fulfilled`}
            />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-mono text-xs text-base-content/50">#{order.orderNumber}</p>
                <h3 className="font-bold text-sm text-base-content truncate">
                  {order.customerName}
                </h3>
              </div>
              <span className="badge badge-sm badge-outline">{formatDate(order.deliveryDate)}</span>
            </div>

            <p className="text-sm text-base-content/70 truncate mt-1">{order.customerEmail}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge-sm badge-primary">
                {formatTimeSlotLabel(order.timeSlot)}
              </span>
              <span className="badge badge-sm badge-ghost">
                {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => onViewDetails(order.id)}
          >
            <FiInfo size={16} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
