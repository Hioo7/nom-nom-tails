import { FiPlus } from 'react-icons/fi';

interface MealPlanHeaderProps {
  count: number;
  onAddMealPlan: () => void;
}

export default function MealPlanHeader({ count, onAddMealPlan }: MealPlanHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-base-content">Meal Plans</h2>
          <span className="badge badge-neutral badge-sm">{count} total</span>
        </div>
        <p className="text-sm text-base-content/60">
          Package dishes into plans with clear pricing, dish counts, and storefront status.
        </p>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-neutral sm:self-center"
        onClick={onAddMealPlan}
      >
        <FiPlus size={16} />
        New plan
      </button>
    </div>
  );
}
