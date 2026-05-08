import type { ReactNode } from 'react';
import { FiCalendar, FiClock, FiEdit3, FiMapPin, FiPackage, FiPhone } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import { formatDate, formatTimeSlotLabel } from '../AdminDashboard/orderFormatters';
import { hasTaskPhoneNumber } from './deliveryTaskCall';
import { hasValidTaskCoordinates } from './deliveryTaskLocation';

interface DeliveryTaskSecondaryAction {
  ariaLabel: string;
  icon: ReactNode;
  isSubmitting: boolean;
  onAction: (task: DeliveryPartnerTaskSummary) => void;
  buttonClassName?: string;
}

interface DeliveryTaskCardProps {
  task: DeliveryPartnerTaskSummary;
  actionLabel: string;
  isSubmitting: boolean;
  onAction: (task: DeliveryPartnerTaskSummary) => void;
  onLocationAction?: (task: DeliveryPartnerTaskSummary) => void;
  onCallAction?: (task: DeliveryPartnerTaskSummary) => void;
  onNotesAction?: (task: DeliveryPartnerTaskSummary) => void;
  actionIcon?: ReactNode;
  actionAriaLabel?: string;
  hideActionLabel?: boolean;
  actionButtonClassName?: string;
  secondaryAction?: DeliveryTaskSecondaryAction;
}

export default function DeliveryTaskCard({
  task,
  actionLabel,
  isSubmitting,
  onAction,
  onLocationAction,
  onCallAction,
  onNotesAction,
  actionIcon,
  actionAriaLabel,
  hideActionLabel,
  actionButtonClassName,
  secondaryAction,
}: DeliveryTaskCardProps) {
  const hasCoordinates = hasValidTaskCoordinates(task);
  const showLocationAction = typeof onLocationAction === 'function';
  const showCallAction = typeof onCallAction === 'function';
  const showNotesAction = typeof onNotesAction === 'function';
  const hasPhoneNumber = hasTaskPhoneNumber(task.customerPhone);
  const primaryActionAriaLabel = actionAriaLabel ?? actionLabel;

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

        <div className="flex items-center gap-3">
          {showLocationAction ? (
            <button
              type="button"
              className="btn btn-circle btn-outline shrink-0"
              disabled={!hasCoordinates}
              onClick={() => onLocationAction(task)}
              aria-label={`Show location for order ${task.orderNumber}`}
            >
              <FiMapPin size={18} />
            </button>
          ) : null}
          {showCallAction ? (
            <button
              type="button"
              className="btn btn-circle btn-outline shrink-0"
              disabled={!hasPhoneNumber}
              onClick={() => onCallAction(task)}
              aria-label={`Call customer for order ${task.orderNumber}`}
            >
              <FiPhone size={18} />
            </button>
          ) : null}
          {showNotesAction ? (
            <button
              type="button"
              className="btn btn-circle btn-outline shrink-0"
              onClick={() => onNotesAction(task)}
              aria-label={`View handling notes for order ${task.orderNumber}`}
            >
              <FiEdit3 size={18} />
            </button>
          ) : null}
          {secondaryAction ? (
            <button
              type="button"
              className={`btn btn-circle shrink-0 ${secondaryAction.buttonClassName ?? 'btn-outline'}`}
              disabled={secondaryAction.isSubmitting || isSubmitting}
              onClick={() => secondaryAction.onAction(task)}
              aria-label={secondaryAction.ariaLabel}
            >
              {secondaryAction.isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                secondaryAction.icon
              )}
            </button>
          ) : null}
          <button
            type="button"
            className={`btn flex-1 ${actionButtonClassName ?? 'btn-neutral'}`}
            disabled={isSubmitting || secondaryAction?.isSubmitting === true}
            onClick={() => onAction(task)}
            aria-label={primaryActionAriaLabel}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : hideActionLabel ? (
              actionIcon
            ) : (
              <>
                {actionIcon}
                {actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
