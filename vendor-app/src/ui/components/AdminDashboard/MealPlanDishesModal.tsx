import { useEffect, useRef } from 'react';
import type { MealPlan } from '../../../types';
import MealPlanDishPreviewCard from './MealPlanDishPreviewCard';

interface MealPlanDishesModalProps {
  mealPlan: MealPlan;
  onClose: () => void;
}

export default function MealPlanDishesModal({ mealPlan, onClose }: MealPlanDishesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const priceDisplay = (mealPlan.price / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">

        {/* Sticky header */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <h3 className="font-bold text-base text-base-content leading-tight truncate">
            {mealPlan.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="badge badge-xs badge-primary font-semibold">₹{priceDisplay}</span>
            <span className="text-xs text-base-content/50">
              {mealPlan.dishes.length} dish{mealPlan.dishes.length !== 1 ? 'es' : ''}
            </span>
            {mealPlan.isActive ? (
              <span className="badge badge-xs badge-success">Active</span>
            ) : (
              <span className="badge badge-xs badge-ghost">Inactive</span>
            )}
          </div>
        </div>

        {/* Scrollable dish grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {mealPlan.dishes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-base-content/40">
              <span className="text-4xl">🍽️</span>
              <p className="text-sm">No dishes in this meal plan.</p>
            </div>
          ) : (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
              {mealPlan.dishes.map((dish) => (
                <MealPlanDishPreviewCard key={dish.id} dish={dish} />
              ))}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-base-200">
          <button className="btn btn-neutral w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
