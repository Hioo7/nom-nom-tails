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
      <div className="flex flex-col items-center gap-3 py-16 text-base-content/40">
        <span className="text-5xl">🍽️</span>
        <p className="text-sm font-medium">No dishes yet</p>
        <p className="text-xs">Add your first dish to get started.</p>
        <button className="btn btn-primary btn-sm mt-2" onClick={onAddFirst}>
          Add your first dish
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
