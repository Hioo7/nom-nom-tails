import { useState } from 'react';
import { FiCheck, FiPackage } from 'react-icons/fi';

interface FulfillOrderSheetProps {
  orderNumber: string;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (handlingNotes: string | null) => void;
}

export default function FulfillOrderSheet({
  orderNumber,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: FulfillOrderSheetProps) {
  const [notes, setNotes] = useState('');
  const [trimError, setTrimError] = useState('');

  const handleConfirm = (): void => {
    if (notes.length > 0 && notes.trim().length === 0) {
      setTrimError('Notes cannot contain only spaces.');
      return;
    }
    setTrimError('');
    onConfirm(notes.trim() || null);
  };

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-base-200 text-base-content">
            <FiPackage size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-base-content">Mark as ready?</h3>
            <p className="text-sm text-base-content/60">Order #{orderNumber}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-base-content/70">
          Optionally add packaging or handling instructions for the delivery partner.
        </p>

        <div className="mt-5">
          <label className="label px-0">
            <span className="label-text font-medium text-base-content">Handling notes</span>
            <span className="label-text-alt text-base-content/40">Optional</span>
          </label>
          <textarea
            className={`textarea textarea-bordered min-h-28 w-full ${trimError ? 'textarea-error' : ''}`}
            placeholder="e.g. Handle with care — fragile packaging"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (trimError) setTrimError('');
            }}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className={`text-xs ${trimError ? 'text-error' : 'text-base-content/50'}`}>
              {trimError || 'Optional'}
            </span>
            <span className="text-xs text-base-content/50">{notes.length}/500</span>
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
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-neutral rounded-full"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <FiCheck size={18} />
                Confirm
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
