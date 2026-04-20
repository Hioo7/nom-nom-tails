import { useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiPackage } from 'react-icons/fi';
import { useIngredientActions } from '../../../hooks/useIngredientActions';
import type { IngredientOption } from '../../../types';
import { formatQuantity, getErrorMessage } from './orderFormatters';

type IngredientEditorMode = 'create' | 'edit';

interface IngredientEditorModalProps {
  mode: IngredientEditorMode;
  ingredient?: IngredientOption;
  onClose: () => void;
  onSaved: (ingredient: IngredientOption) => void;
}

export default function IngredientEditorModal({
  mode,
  ingredient,
  onClose,
  onSaved,
}: IngredientEditorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { createIngredient, updateIngredient } = useIngredientActions();
  const [name, setName] = useState(ingredient?.name ?? '');
  const [unit, setUnit] = useState(ingredient?.unit ?? '');
  const [availableQty, setAvailableQty] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const parsedQuantity = Number(availableQty);
  const isQuantityValid = availableQty.trim().length === 0
    || (Number.isFinite(parsedQuantity) && parsedQuantity >= 0);
  const canSubmit = name.trim().length > 0 && unit.trim().length > 0 && isQuantityValid && !isSubmitting;

  const title = mode === 'create' ? 'New Ingredient' : 'Edit Ingredient';
  const submitLabel = mode === 'create' ? 'Create' : 'Save changes';
  const icon = mode === 'create' ? <FiPackage size={15} className="text-base-content/60" /> : <FiEdit2 size={15} className="text-base-content/60" />;
  const helperText = useMemo(() => {
    if (mode === 'create') {
      return 'Optional — you can update stock later from the inventory view.';
    }

    return ingredient
      ? `Current stock remains ${formatQuantity(ingredient.availableQty, ingredient.unit)}.`
      : '';
  }, [ingredient, mode]);

  async function handleSubmit(): Promise<void> {
    if (isSubmitting) {
      return;
    }

    if (!name.trim()) {
      setError('Ingredient name is required.');
      return;
    }

    if (!unit.trim()) {
      setError('Unit is required.');
      return;
    }

    if (!isQuantityValid) {
      setError('Opening stock must be zero or greater.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let savedIngredient: IngredientOption;

      if (mode === 'create') {
        savedIngredient = await createIngredient({
          name: name.trim(),
          unit: unit.trim(),
          availableQty: availableQty.trim().length > 0 ? parsedQuantity : 0,
        });
      } else {
        if (!ingredient) {
          setError('Ingredient not found.');
          setIsSubmitting(false);
          return;
        }

        savedIngredient = await updateIngredient(ingredient.id, {
          name: name.trim(),
          unit: unit.trim(),
        });
      }

      onSaved(savedIngredient);
      onClose();
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          mode === 'create'
            ? 'Failed to create ingredient. Please try again.'
            : 'Failed to update ingredient. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-base text-base-content">{title}</h3>
                <p className="text-sm text-base-content/60">
                  {mode === 'create'
                    ? 'Add an ingredient for procurement and stock tracking.'
                    : 'Update the ingredient details used across inventory and dishes.'}
                </p>
              </div>
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
          {mode === 'edit' && ingredient ? (
            <div className="rounded-box bg-base-200 px-4 py-3">
              <p className="text-xs text-base-content/50">Available Stock</p>
              <p className="font-semibold text-base-content">
                {formatQuantity(ingredient.availableQty, ingredient.unit)}
              </p>
            </div>
          ) : null}

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Name <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              className="input input-sm w-full"
              placeholder="e.g. Chicken, Brown Rice, Salmon"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </fieldset>

          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Unit <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              className="input input-sm w-full"
              placeholder="e.g. g, ml, pcs, cups"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              disabled={isSubmitting}
            />
          </fieldset>

          {mode === 'create' ? (
            <fieldset className="fieldset py-1">
              <legend className="fieldset-legend">Opening Stock</legend>
              <input
                type="number"
                min="0"
                step="any"
                className="input input-sm w-full"
                placeholder="0"
                value={availableQty}
                onChange={(event) => setAvailableQty(event.target.value)}
                disabled={isSubmitting}
              />
            </fieldset>
          ) : null}

          {helperText ? (
            <p className="text-xs text-base-content/50 -mt-1">{helperText}</p>
          ) : null}

          {error ? (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          ) : null}

          <div className="shrink-0 pt-2 flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-neutral flex-1" disabled={!canSubmit}>
              {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : submitLabel}
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
