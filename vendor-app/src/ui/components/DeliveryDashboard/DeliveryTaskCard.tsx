import { FiCalendar, FiClock, FiPackage } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import { formatDate, formatTimeSlotLabel } from '../AdminDashboard/orderFormatters';

interface DeliveryTaskCardProps {
  task: DeliveryPartnerTaskSummary;
  actionLabel: string;
  isSubmitting: boolean;
  onAction: (task: DeliveryPartnerTaskSummary) => void;
}

export default function DeliveryTaskCard({
  task,
  actionLabel,
  isSubmitting,
  onAction,
}: DeliveryTaskCardProps) {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-base-content/50">#{task.orderNumber}</p>
            <h3 className="truncate text-base font-semibold text-base-content">{task.customerName}</h3>
          </div>
          <span className="badge badge-outline badge-sm shrink-0">{formatDate(task.deliveryDate)}</span>
        </div>

        <div className="grid gap-2 text-sm text-base-content/70">
          <div className="flex items-center gap-2">
            <FiClock size={15} className="shrink-0" />
            <span>{formatTimeSlotLabel(task.timeSlot)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPackage size={15} className="shrink-0" />
            <span>
              {task.itemCount} item{task.itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar size={15} className="shrink-0" />
            <span>Today delivery</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-neutral w-full"
          disabled={isSubmitting}
          onClick={() => onAction(task)}
        >
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : actionLabel}
        </button>
      </div>
    </div>
  );
}
