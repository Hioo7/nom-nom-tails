import { FiMapPin } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import {
  buildGoogleMapsEmbedUrl,
  hasValidTaskCoordinates,
} from './deliveryTaskLocation';

interface DeliveryTaskLocationSheetProps {
  task: DeliveryPartnerTaskSummary | null;
  onClose: () => void;
}

export default function DeliveryTaskLocationSheet({
  task,
  onClose,
}: DeliveryTaskLocationSheetProps) {
  if (!task) {
    return null;
  }

  const hasCoordinates = hasValidTaskCoordinates(task);

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/12 text-primary">
            <FiMapPin size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">Delivery location</h3>
            <p className="text-sm text-base-content/60">Order #{task.orderNumber}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border border-base-200 bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Delivery address
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content">
              {task.locationLabel}
            </p>
          </div>

          {hasCoordinates ? (
            <div className="overflow-hidden rounded-2xl border border-base-200">
              <iframe
                title="Delivery location map"
                src={buildGoogleMapsEmbedUrl(task)}
                className="h-56 w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="alert alert-warning">
              <span>Location coordinates are unavailable for this order.</span>
            </div>
          )}
        </div>

        <div className="modal-action mt-6">
          <button
            type="button"
            className="btn btn-outline rounded-full w-full"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
