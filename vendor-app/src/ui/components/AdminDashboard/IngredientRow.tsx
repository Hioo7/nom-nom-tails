import { FiX } from 'react-icons/fi';
import type { IngredientOption } from '../../../types';
import type { IngredientRowData } from '../../../hooks/useDishForm';

interface IngredientRowProps {
  value: IngredientRowData;
  onChange: (value: IngredientRowData) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
  availableIngredients: IngredientOption[];
}

export default function IngredientRow({
  value,
  onChange,
  onRemove,
  canRemove,
  disabled = false,
  availableIngredients,
}: IngredientRowProps) {
  const selected = availableIngredients.find((i) => i.id === value.ingredientId);

  return (
    <div className="flex items-center gap-2">
      {/* Ingredient select */}
      <select
        className="select select-sm flex-1 min-w-0"
        value={value.ingredientId}
        onChange={(e) => onChange({ ...value, ingredientId: e.target.value })}
        disabled={disabled}
      >
        <option value="" disabled>Select ingredient…</option>
        {availableIngredients.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>

      {/* Qty */}
      <input
        type="number"
        className="input input-sm w-20 shrink-0"
        placeholder="Qty"
        step="any"
        min="0"
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: e.target.value })}
        disabled={disabled}
      />

      {/* Unit badge — read-only, from master ingredient */}
      <span className="badge badge-ghost badge-sm shrink-0 min-w-[2.5rem] text-center">
        {selected ? selected.unit : '—'}
      </span>

      {/* Remove */}
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error shrink-0"
        onClick={onRemove}
        disabled={!canRemove || disabled}
        title="Remove"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}
