import { useState } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';

interface DeliveryTaskFailureSheetProps {
  task: DeliveryPartnerTaskSummary | null;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (task: DeliveryPartnerTaskSummary, failureReason: string) => Promise<void>;
}

export default function DeliveryTaskFailureSheet({
  task,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: DeliveryTaskFailureSheetProps) {
  const [failureReason, setFailureReason] = useState('');
  const [noteError, setNoteError] = useState('');

  if (!task) {
    return null;
  }

  const handleConfirm = async (): Promise<void> => {
    const trimmedReason = failureReason.trim();

    if (!trimmedReason) {
      setNoteError('Failure note is required.');
      return;
    }

    setNoteError('');

    try {
      await onConfirm(task, trimmedReason);
      onClose();
    } catch {
      // Parent surfaces the API error; keep the sheet open for correction or retry.
    }
  };

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-base-200 text-base-content">
            <FiAlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">Mark delivery as failed?</h3>
            <p className="text-sm text-base-content/60">Order #{task.orderNumber}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-base-content/70">
          This will remove the task from the active delivery queue. Add a short note so the team
          knows what went wrong.
        </p>

        <div className="mt-5">
          <label className="label px-0">
            <span className="label-text font-medium text-base-content">Failure note</span>
          </label>
          <textarea
            className={`textarea textarea-bordered min-h-28 w-full ${
              noteError ? 'textarea-error' : ''
            }`}
            placeholder="Explain why delivery failed"
            value={failureReason}
            onChange={(event) => {
              setFailureReason(event.target.value);
              if (noteError) {
                setNoteError('');
              }
            }}
            disabled={isSubmitting}
            maxLength={250}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className={`text-xs ${noteError ? 'text-error' : 'text-base-content/50'}`}>
              {noteError || 'Required'}
            </span>
            <span className="text-xs text-base-content/50">{failureReason.length}/250</span>
          </div>
        </div>

        {error ? (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="modal-action mt-6">
          <button
            type="button"
            className="btn btn-outline rounded-full border-base-300"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-neutral rounded-full"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <FiX size={18} />
                Mark as Failed
              </>
            )}
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
