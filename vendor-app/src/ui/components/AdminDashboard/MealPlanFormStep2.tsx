import { useState } from 'react';
import { FiSearch, FiX, FiPlus } from 'react-icons/fi';
import type { Dish } from '../../../types';
import { formatCurrency } from './orderFormatters';

interface MealPlanFormStep2Props {
  dishes: Dish[];
  selectedDishIds: string[];
  onToggleDish: (dishId: string) => void;
  onCreateNewDish: () => void;
  disabled: boolean;
}

export default function MealPlanFormStep2({
  dishes,
  selectedDishIds,
  onToggleDish,
  onCreateNewDish,
  disabled,
}: MealPlanFormStep2Props) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? dishes.filter((d) => d.name.toLowerCase().includes(search.trim().toLowerCase()))
    : dishes;

  const selectedDishes = dishes.filter((d) => selectedDishIds.includes(d.id));

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {/* Selected chips */}
      {selectedDishes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedDishes.map((d) => (
            <button
              key={d.id}
              type="button"
              className="badge badge-primary gap-1 cursor-pointer hover:badge-error transition-colors"
              onClick={() => onToggleDish(d.id)}
              disabled={disabled}
              title={`Remove ${d.name}`}
            >
              {d.name}
              <FiX size={10} />
            </button>
          ))}
        </div>
      )}

      {selectedDishes.length === 0 && (
        <p className="text-xs text-base-content/40">Select at least one dish to continue.</p>
      )}

      {/* Search */}
      <label className="input input-sm w-full flex items-center gap-2">
        <FiSearch size={13} className="text-base-content/40 shrink-0" />
        <input
          type="text"
          className="grow"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
        {search && (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            onClick={() => setSearch('')}
          >
            <FiX size={12} />
          </button>
        )}
      </label>

      {/* Dish list — scrollable */}
      <div className="flex-1 overflow-y-auto border border-base-200 rounded-xl divide-y divide-base-200 max-h-52">
        {filtered.length === 0 ? (
          <p className="text-xs text-base-content/40 text-center py-6">No dishes found.</p>
        ) : (
          filtered.map((dish) => {
            const isSelected = selectedDishIds.includes(dish.id);
            return (
              <button
                key={dish.id}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-base-200/60'
                }`}
                onClick={() => onToggleDish(dish.id)}
                disabled={disabled}
              >
                <div
                  className={`w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-base-300 bg-base-100'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-2.5 h-2.5 text-primary-content"
                      fill="none"
                      viewBox="0 0 10 8"
                    >
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-content truncate">{dish.name}</p>
                  <p className="text-xs text-base-content/50">
                    {formatCurrency(dish.price)} · {dish.ingredients.length} ingredient
                    {dish.ingredients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Create new dish */}
      <button
        type="button"
        className="btn btn-outline btn-sm w-full gap-2"
        onClick={onCreateNewDish}
        disabled={disabled}
      >
        <FiPlus size={14} />
        Create New Dish
      </button>
    </div>
  );
}
