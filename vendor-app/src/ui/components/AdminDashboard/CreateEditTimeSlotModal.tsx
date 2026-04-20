import { useEffect, useRef, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import type { CreateTimeSlotPayload, DayOfWeek, FieldErrors, TimeSlot, UpdateTimeSlotPayload } from '../../../types';
import { formatDay, getErrorMessage } from './orderFormatters';

interface BaseTimeSlotModalProps {
  day: DayOfWeek;
  onClose: () => void;
}

interface CreateTimeSlotModalProps extends BaseTimeSlotModalProps {
  mode: 'create';
  onSaved: (payload: CreateTimeSlotPayload) => Promise<void>;
}

interface EditTimeSlotModalProps extends BaseTimeSlotModalProps {
  mode: 'edit';
  slot: TimeSlot;
  onSaved: (payload: UpdateTimeSlotPayload) => Promise<void>;
}

type CreateEditTimeSlotModalProps = CreateTimeSlotModalProps | EditTimeSlotModalProps;

export default function CreateEditTimeSlotModal(props: CreateEditTimeSlotModalProps) {
  const { day, mode, onClose } = props;
  const initialSlot = props.mode === 'edit' ? props.slot : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [startTime, setStartTime] = useState(initialSlot?.startTime ?? '');
  const [endTime, setEndTime] = useState(initialSlot?.endTime ?? '');
  const [isActive, setIsActive] = useState(initialSlot?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!startTime) errors['startTime'] = 'Start time is required';
    if (!endTime) errors['endTime'] = 'End time is required';
    if (startTime && endTime && startTime >= endTime) {
      errors['endTime'] = 'End time must be after start time';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (props.mode === 'create') {
        await props.onSaved({ day, startTime, endTime, isActive });
      } else {
        await props.onSaved({ startTime, endTime, isActive });
      }
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to save time slot.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 border-b border-base-200 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiClock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-base-content">
                {mode === 'create' ? 'New Time Slot' : 'Edit Time Slot'}
              </h3>
              <p className="text-sm text-base-content/60">
                Keep delivery windows clean and easy to manage on mobile.
              </p>
            </div>
          </div>
        </div>

        <form
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="rounded-box bg-base-200 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Selected day
            </p>
            <p className="mt-1 font-semibold text-base-content">{formatDay(day)}</p>
          </div>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Start Time <span className="text-error">*</span>
            </legend>
            <input
              type="time"
              className={`input input-sm w-full ${fieldErrors['startTime'] ? 'input-error' : ''}`}
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setFieldErrors((prev) => ({ ...prev, startTime: '' }));
              }}
              disabled={isSubmitting}
            />
            {fieldErrors['startTime'] ? (
              <p className="fieldset-label mt-1 text-xs text-error">{fieldErrors['startTime']}</p>
            ) : null}
          </fieldset>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              End Time <span className="text-error">*</span>
            </legend>
            <input
              type="time"
              className={`input input-sm w-full ${fieldErrors['endTime'] ? 'input-error' : ''}`}
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value);
                setFieldErrors((prev) => ({ ...prev, endTime: '' }));
              }}
              disabled={isSubmitting}
            />
            {fieldErrors['endTime'] ? (
              <p className="fieldset-label mt-1 text-xs text-error">{fieldErrors['endTime']}</p>
            ) : null}
          </fieldset>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-base-200 bg-base-100 px-4 py-3">
            <div>
              <p className="font-medium text-base-content">Slot is active</p>
              <p className="text-sm text-base-content/60">
                Active slots are available for scheduling.
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={isSubmitting}
            />
          </label>

          {errorMessage ? (
            <div className="alert alert-error text-sm">
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="pt-2 flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-neutral flex-1" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
