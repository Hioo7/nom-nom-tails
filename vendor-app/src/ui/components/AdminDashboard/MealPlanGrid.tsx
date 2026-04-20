import type { MealPlan } from '../../../types';
import MealPlanCard from './MealPlanCard';

interface MealPlanGridProps {
  mealPlans: MealPlan[];
  onView: (plan: MealPlan) => void;
  onEdit: (plan: MealPlan) => void;
  onDelete: (plan: MealPlan) => void;
  onAddFirst: () => void;
}

export default function MealPlanGrid({
  mealPlans,
  onView,
  onEdit,
  onDelete,
  onAddFirst,
}: MealPlanGridProps) {
  if (mealPlans.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center gap-3 py-12 text-center">
          <span className="text-5xl text-base-content/20">🗓️</span>
          <div>
            <h3 className="font-semibold text-base-content/70">No meal plans yet</h3>
            <p className="mt-1 text-sm text-base-content/50">
              Create your first meal plan to bundle dishes into a sellable plan.
            </p>
          </div>
          <button type="button" className="btn btn-neutral btn-sm mt-1" onClick={onAddFirst}>
            Create first plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {mealPlans.map((plan) => (
        <MealPlanCard
          key={plan.id}
          mealPlan={plan}
          onView={() => onView(plan)}
          onEdit={() => onEdit(plan)}
          onDelete={() => onDelete(plan)}
        />
      ))}
    </div>
  );
}
