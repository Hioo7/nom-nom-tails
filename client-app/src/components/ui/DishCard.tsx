import { FiPlus } from 'react-icons/fi';
import type { Dish } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';
import { paiseToRupees } from '../../utils/currency';

export function DishCard({ dish }: { dish: Dish }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  function handleAdd() {
    addItem(dish);
    showToast(dish.name);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x200/f97316/white?text=🐾';
          }}
        />
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{dish.name}</h3>
        <p className="text-gray-400 text-xs line-clamp-2">{dish.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-gray-900 text-sm">₹{paiseToRupees(dish.price)}</span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <FiPlus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
