import { FiEdit3 } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';

interface DeliveryTaskHandlingNotesSheetProps {
  task: DeliveryPartnerTaskSummary;
  onClose: () => void;
}

export default function DeliveryTaskHandlingNotesSheet({
  task,
  onClose,
}: DeliveryTaskHandlingNotesSheetProps) {
  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/12 text-primary">
            <FiEdit3 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">Handling notes</h3>
            <p className="text-sm text-base-content/60">Order #{task.orderNumber}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border border-base-200 bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Packaging / handling instructions
            </p>
            <div className="mt-2 max-h-56 overflow-y-auto">
              <p className="text-sm leading-6 text-base-content whitespace-pre-wrap">
                {task.handlingNotes}
              </p>
            </div>
          </div>
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
