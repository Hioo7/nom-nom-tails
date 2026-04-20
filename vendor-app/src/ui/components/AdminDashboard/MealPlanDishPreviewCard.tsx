import type { MealPlanDishItem } from '../../../types';

interface MealPlanDishPreviewCardProps {
  dish: MealPlanDishItem;
}

export default function MealPlanDishPreviewCard({ dish }: MealPlanDishPreviewCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <figure className="h-28 overflow-hidden rounded-t-box bg-base-200">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-base-content/20">
            🍽️
          </div>
        )}
      </figure>

      <div className="card-body p-2.5 gap-1">
        <h4 className="font-bold text-sm text-base-content leading-tight line-clamp-2">
          {dish.name}
        </h4>
        {dish.description && (
          <p className="text-xs text-base-content/50 line-clamp-2">{dish.description}</p>
        )}
      </div>
    </div>
  );
}
