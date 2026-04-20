import type { Dish } from '../../../types';
import DishCardActions from './DishCardActions';
import { formatCurrency } from './orderFormatters';

interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <figure className="h-40 overflow-hidden rounded-t-box bg-base-200">
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

      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-base-content leading-tight">{dish.name}</h3>
            {dish.description ? (
              <p className="mt-1 text-sm text-base-content/60">{dish.description}</p>
            ) : (
              <p className="mt-1 text-sm text-base-content/40">No description added yet.</p>
            )}
          </div>
          <span className="badge badge-primary badge-sm shrink-0 font-semibold">
            {formatCurrency(dish.price)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dish.isActive ? (
            <span className="badge badge-success badge-sm">In storefront</span>
          ) : (
            <span className="badge badge-ghost badge-sm">Hidden</span>
          )}
          <span className="badge badge-ghost badge-sm">
            {dish.ingredients.length} ingredient{dish.ingredients.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="rounded-box bg-base-200 px-3 py-2 text-sm text-base-content/70">
          {dish.isActive
            ? 'Visible in the storefront and ready for ordering.'
            : 'Hidden from the storefront until you make it active.'}
        </div>

        <div className="border-t border-base-200 pt-4">
          <DishCardActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
