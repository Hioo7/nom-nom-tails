import { FiPlus } from 'react-icons/fi';

interface DishesHeaderProps {
  count: number;
  onAddDish: () => void;
}

export default function DishesHeader({ count, onAddDish }: DishesHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-base-content">Dishes</h2>
        <span className="badge badge-sm">{count}</span>
      </div>
      <button className="btn btn-primary btn-sm gap-1" onClick={onAddDish}>
        <FiPlus size={14} />
        Add Dish
      </button>
    </div>
  );
}
