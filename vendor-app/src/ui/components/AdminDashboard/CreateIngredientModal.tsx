import { useEffect, useRef, useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import ingredientService from '../../../services/ingredient.service';
import type { IngredientOption } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';

interface CreateIngredientModalProps {
  onClose: () => void;
  onCreated: (ingredient: IngredientOption) => void;
}

export default function CreateIngredientModal({ onClose, onCreated }: CreateIngredientModalProps) {
  const { token } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [availableQty, setAvailableQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit() {
    if (!token || !name.trim() || !unit.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const created = await ingredientService.createIngredient(token, {
        name: name.trim(),
        unit: unit.trim(),
        availableQty: availableQty ? Number(availableQty) : 0,
      });
      onCreated(created);
      onClose();
    } catch {
      setError('Failed to create ingredient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = name.trim().length > 0 && unit.trim().length > 0 && !isSubmitting;

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <FiPackage size={15} className="text-base-content/60" />
            </div>
            <h3 className="font-bold text-base">New Ingredient</h3>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Name */}
          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Name <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              className="input input-sm w-full"
              placeholder="e.g. Chicken, Brown Rice, Salmon…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </fieldset>

          {/* Unit */}
          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">
              Unit <span className="text-error">*</span>
            </legend>
            <input
              type="text"
              className="input input-sm w-full"
              placeholder="e.g. g, ml, pcs, cups…"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="fieldset-label text-xs text-base-content/40 mt-1">
              This cannot be changed later once the ingredient is used in a dish.
            </p>
          </fieldset>

          {/* Stock */}
          <fieldset className="fieldset py-1">
            <legend className="fieldset-legend">Current Stock</legend>
            <input
              type="number"
              className="input input-sm w-full"
              placeholder="0"
              min="0"
              step="any"
              value={availableQty}
              onChange={(e) => setAvailableQty(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="fieldset-label text-xs text-base-content/40 mt-1">
              Optional — you can update stock later.
            </p>
          </fieldset>

          {/* Error */}
          {error && (
            <div className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-neutral btn-sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Create'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
