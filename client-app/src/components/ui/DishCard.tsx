import { FiPlus, FiMinus } from 'react-icons/fi';
import type { Dish } from '../../types';
import { useCart } from '../../hooks/useCart';

export function DishCard({ dish }: { dish: Dish }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.dish.id === dish.id);
  const qty = cartItem?.quantity ?? 0;

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
          <span className="font-bold text-gray-900 text-sm">₹{dish.price}</span>
          {qty === 0 ? (
            <button
              onClick={() => addItem(dish)}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <FiPlus size={13} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 rounded-full px-2 py-1">
              <button
                onClick={() => updateQuantity(dish.id, qty - 1)}
                className="text-white"
              >
                <FiMinus size={13} />
              </button>
              <span className="text-white text-xs font-bold w-4 text-center">{qty}</span>
              <button
                onClick={() => addItem(dish)}
                className="text-white"
              >
                <FiPlus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
