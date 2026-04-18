import type { Dish } from '../../../types';
import DishCardActions from './DishCardActions';

interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
      <figure className="aspect-video overflow-hidden rounded-t-box bg-base-200">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-base-content/20">
            🍽️
          </div>
        )}
      </figure>

      <div className="card-body p-3 gap-2">
        <div>
          <h3 className="font-bold text-sm text-base-content leading-tight">{dish.name}</h3>
          {dish.description && (
            <p className="text-xs text-base-content/50 truncate mt-0.5">{dish.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {dish.isActive ? (
            <span className="badge badge-xs badge-success">In Storefront</span>
          ) : (
            <span className="badge badge-xs badge-ghost">Not in Storefront</span>
          )}
        </div>

        <p className="text-xs text-base-content/40">
          {dish.ingredients.length} ingredient{dish.ingredients.length !== 1 ? 's' : ''}
        </p>

        <DishCardActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
