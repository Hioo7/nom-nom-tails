import { FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { Dish } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../context/ToastContext';
import { paiseToRupees } from '../../utils/currency';

export function DishCard({ dish }: { dish: Dish }) {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  const cartItem = items.find((i) => i.dish.id === dish.id);
  const quantity = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem(dish);
    showToast(dish.name);
  }

  function handleIncrease() {
    updateQuantity(dish.id, quantity + 1);
  }

  function handleDecrease() {
    if (quantity === 1) {
      removeItem(dish.id);
    } else {
      updateQuantity(dish.id, quantity - 1);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <button
        className="relative text-left"
        onClick={() => navigate(`/dish/${dish.id}`, { state: { dish } })}
      >
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x200/f97316/white?text=🐾';
          }}
        />
      </button>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <button
          className="text-left"
          onClick={() => navigate(`/dish/${dish.id}`, { state: { dish } })}
        >
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{dish.name}</h3>
        </button>
        <p className="text-gray-400 text-xs line-clamp-2">{dish.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-gray-900 text-sm">₹{paiseToRupees(dish.price)}</span>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <FiPlus size={13} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 rounded-full px-1 py-1">
              <button
                onClick={handleDecrease}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <FiMinus size={12} className="text-white" />
              </button>
              <span className="text-white text-xs font-bold min-w-[16px] text-center">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <FiPlus size={12} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
