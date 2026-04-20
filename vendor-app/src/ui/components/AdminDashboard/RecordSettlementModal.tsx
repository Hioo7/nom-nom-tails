import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  PaymentMethod,
  PendingSettlementOrder,
  RecordSettlementPaymentPayload,
} from '../../../types';
import { formatCurrency, toDateTimeLocalValue } from './orderFormatters';

const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ['CASH', 'ONLINE', 'UPI'];

interface RecordSettlementModalProps {
  settlement: PendingSettlementOrder;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSave: (payload: RecordSettlementPaymentPayload) => Promise<void>;
}

export default function RecordSettlementModal({
  settlement,
  isSubmitting,
  errorMessage,
  onClose,
  onSave,
}: RecordSettlementModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [paidAt, setPaidAt] = useState(toDateTimeLocalValue(new Date()));
  const [note, setNote] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const balanceHint = useMemo(
    () => (settlement.balanceAmount / 100).toFixed(2),
    [settlement.balanceAmount],
  );

  const canSubmit = Number(amount) > 0 && !isSubmitting;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) {
      return;
    }

    await onSave({
      amount: Number(amount),
      method,
      paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
      note: note.trim() ? note.trim() : undefined,
    });
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-base-content">Record Settlement</h3>
              <p className="text-sm text-base-content/60 mt-1">
                #{settlement.orderNumber} • {settlement.customerName}
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div className="rounded-box bg-base-200 px-4 py-3">
            <p className="text-xs text-base-content/50">Outstanding Balance</p>
            <p className="font-bold text-base">{formatCurrency(settlement.balanceAmount)}</p>
          </div>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Amount Paid <span className="text-error">*</span>
            </legend>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input input-sm w-full"
              placeholder={`Max ${balanceHint}`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isSubmitting}
            />
          </fieldset>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Payment Method <span className="text-error">*</span>
            </legend>
            <select
              className="select select-sm w-full"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              disabled={isSubmitting}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">Paid At</legend>
            <input
              type="datetime-local"
              className="input input-sm w-full"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              disabled={isSubmitting}
            />
          </fieldset>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">Note</legend>
            <textarea
              className="textarea textarea-sm w-full"
              rows={3}
              placeholder="Optional payment note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
            />
          </fieldset>

          {errorMessage ? (
            <div className="alert alert-error text-sm">
              <span>{errorMessage}</span>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-base-200 flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-neutral flex-1"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Save'}
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
