import type { MealPlan } from '../../../types';
import MealPlanCardActions from './MealPlanCardActions';
import { formatCurrency } from './orderFormatters';

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MealPlanCard({ mealPlan, onView, onEdit, onDelete }: MealPlanCardProps) {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <figure className="h-40 overflow-hidden rounded-t-box bg-base-200">
        {mealPlan.imageUrl ? (
          <img
            src={mealPlan.imageUrl}
            alt={mealPlan.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-base-content/20">
            🗓️
          </div>
        )}
      </figure>

      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-base-content leading-tight">{mealPlan.name}</h3>
            {mealPlan.description ? (
              <p className="mt-1 text-sm text-base-content/60">{mealPlan.description}</p>
            ) : (
              <p className="mt-1 text-sm text-base-content/40">No description added yet.</p>
            )}
          </div>
          <span className="badge badge-primary badge-sm shrink-0 font-semibold">
            {formatCurrency(mealPlan.price)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mealPlan.isActive ? (
            <span className="badge badge-success badge-sm">Active</span>
          ) : (
            <span className="badge badge-ghost badge-sm">Inactive</span>
          )}
          <span className="badge badge-ghost badge-sm">
            {mealPlan.dishes.length} dish{mealPlan.dishes.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="border-t border-base-200 pt-4">
          <MealPlanCardActions onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
