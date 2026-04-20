import { useEffect, useMemo, useRef, useState } from 'react';
import type { IngredientOption } from '../../../types';
import { formatQuantity } from './orderFormatters';

type IngredientStockAction = 'add' | 'remove';

interface IngredientStockModalProps {
  ingredient: IngredientOption;
  action: IngredientStockAction;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (quantity: number) => Promise<void>;
}

export default function IngredientStockModal({
  ingredient,
  action,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: IngredientStockModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const title = action === 'add' ? 'Add Ingredient Stock' : 'Remove Ingredient Stock';
  const actionLabel = action === 'add' ? 'Add' : 'Remove';
  const buttonClass = action === 'add' ? 'btn-neutral' : 'btn-outline';

  const parsedQuantity = Number(quantity);
  const canSubmit = Number.isFinite(parsedQuantity) && parsedQuantity > 0 && !isSubmitting;
  const helperText = useMemo(() => {
    if (action === 'add') {
      return 'Enter how much stock you want to add.';
    }

    return 'Enter how much stock you want to reduce. It cannot exceed the available stock.';
  }, [action]);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <h3 className="font-bold text-base text-base-content">{title}</h3>
          <p className="text-sm text-base-content/60 mt-1">{ingredient.name}</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div className="rounded-box bg-base-200 px-4 py-3">
            <p className="text-xs text-base-content/50">Current Available Stock</p>
            <p className="font-semibold">{formatQuantity(ingredient.availableQty, ingredient.unit)}</p>
          </div>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Quantity <span className="text-error">*</span>
            </legend>
            <input
              type="number"
              min="0"
              step="any"
              className="input input-sm w-full"
              placeholder={`Enter quantity in ${ingredient.unit}`}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="fieldset-label text-xs text-base-content/50 mt-1">{helperText}</p>
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
            className={`btn flex-1 ${buttonClass}`}
            onClick={() => {
              if (canSubmit) {
                void onSubmit(parsedQuantity);
              }
            }}
            disabled={!canSubmit}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : actionLabel}
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
