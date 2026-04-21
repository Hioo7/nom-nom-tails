import type { Dish } from '../../../types';
import { formatCurrency } from './orderFormatters';

interface MealPlanFormStep3Props {
  name: string;
  price: string;
  description: string;
  imagePreview: string | null;
  isActive: boolean;
  selectedDishes: Dish[];
  errorMessage: string;
}

export default function MealPlanFormStep3({
  name,
  price,
  description,
  imagePreview,
  isActive,
  selectedDishes,
  errorMessage,
}: MealPlanFormStep3Props) {
  const priceDisplay = price.trim() || '—';

  return (
    <div className="flex flex-col gap-3">
      {/* Preview card */}
      <div className="card bg-base-200 border border-base-300">
        {imagePreview ? (
          <figure className="h-32 overflow-hidden rounded-t-box">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </figure>
        ) : (
          <div className="h-20 bg-base-300 rounded-t-box flex items-center justify-center text-3xl text-base-content/20">
            🗓️
          </div>
        )}
        <div className="card-body p-3 gap-1">
          <h3 className="font-bold text-base-content">{name || '—'}</h3>
          {description && (
            <p className="text-xs text-base-content/60 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-sm badge-primary font-semibold">₹{priceDisplay}</span>
            {isActive ? (
              <span className="badge badge-sm badge-success">Active</span>
            ) : (
              <span className="badge badge-sm badge-ghost">Inactive</span>
            )}
          </div>
        </div>
      </div>

      {/* Dishes list */}
      <div>
        <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1.5">
          Dishes included ({selectedDishes.length})
        </p>
        <ul className="border border-base-200 rounded-xl divide-y divide-base-200 overflow-hidden">
          {selectedDishes.map((d) => (
            <li key={d.id} className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-6 h-6 rounded bg-base-200 flex items-center justify-center overflow-hidden shrink-0">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">🍽️</span>
                )}
              </div>
              <span className="text-sm text-base-content">{d.name}</span>
              <span className="ml-auto text-xs text-base-content/50">
                {formatCurrency(d.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {errorMessage && (
        <div className="alert alert-error text-sm py-2">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
