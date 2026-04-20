import type { Dish } from '../../../types';
import DishCard from './DishCard';

interface DishGridProps {
  dishes: Dish[];
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onAddFirst: () => void;
}

export default function DishGrid({ dishes, onEdit, onDelete, onAddFirst }: DishGridProps) {
  if (dishes.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center gap-3 py-12 text-center">
          <span className="text-5xl text-base-content/20">🍽️</span>
          <div>
            <h3 className="font-semibold text-base-content/70">No dishes yet</h3>
            <p className="mt-1 text-sm text-base-content/50">
              Add your first dish to start building the storefront.
            </p>
          </div>
          <button type="button" className="btn btn-neutral btn-sm mt-1" onClick={onAddFirst}>
            Create first dish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          onEdit={() => onEdit(dish)}
          onDelete={() => onDelete(dish)}
        />
      ))}
    </div>
  );
}
