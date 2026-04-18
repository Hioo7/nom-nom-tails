import { FiLayers, FiPackage, FiPlus } from 'react-icons/fi';
import type { IngredientRowData } from '../../../hooks/useDishForm';
import type { IngredientOption } from '../../../types';
import IngredientRow from './IngredientRow';

interface DishFormStep2Props {
  ingredients: IngredientRowData[];
  availableIngredients: IngredientOption[];
  onAdd: () => void;
  onUpdate: (index: number, value: IngredientRowData) => void;
  onRemove: (index: number) => void;
  onCreateIngredient: () => void;
  disabled: boolean;
}

export default function DishFormStep2({
  ingredients,
  availableIngredients,
  onAdd,
  onUpdate,
  onRemove,
  onCreateIngredient,
  disabled,
}: DishFormStep2Props) {
  // Empty master list — no ingredients exist in the system yet
  if (availableIngredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center">
          <FiPackage size={26} className="text-base-content/30" />
        </div>
        <div>
          <p className="font-semibold text-sm">No ingredients yet</p>
          <p className="text-xs text-base-content/50 mt-0.5 max-w-[220px]">
            Create your first ingredient to start adding it to dishes.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-neutral btn-sm gap-1.5"
          onClick={onCreateIngredient}
          disabled={disabled}
        >
          <FiPlus size={14} />
          Create First Ingredient
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-base-content/70">
          <div className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center">
            <FiLayers size={13} className="text-base-content/60" />
          </div>
          Ingredients
        </div>
        {ingredients.length > 0 && (
          <span className="badge badge-neutral badge-sm">{ingredients.length}</span>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_5rem_3rem_1.75rem] gap-2 px-0.5">
        <span className="text-xs text-base-content/40">Ingredient</span>
        <span className="text-xs text-base-content/40">Qty</span>
        <span className="text-xs text-base-content/40">Unit</span>
        <span />
      </div>

      {/* Scrollable ingredient list */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-0.5">
        {ingredients.map((ing, index) => (
          <IngredientRow
            key={index}
            value={ing}
            onChange={(v) => onUpdate(index, v)}
            onRemove={() => onRemove(index)}
            canRemove={ingredients.length > 1}
            disabled={disabled}
            availableIngredients={availableIngredients}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5 text-xs border border-dashed border-base-300 hover:border-primary/40 hover:bg-primary/5"
          onClick={onAdd}
          disabled={disabled}
        >
          <FiPlus size={13} />
          Add Row
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1 text-xs text-base-content/50 hover:text-base-content"
          onClick={onCreateIngredient}
          disabled={disabled}
        >
          <FiPackage size={12} />
          New ingredient
        </button>
      </div>
    </div>
  );
}
