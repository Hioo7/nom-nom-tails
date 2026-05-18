import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiMinus } from 'react-icons/fi';
import type { Dish } from '../types';
import { useCart } from '../hooks/useCart';
import { useToast } from '../context/ToastContext';
import { paiseToRupees } from '../utils/currency';

export function DishDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dish = (location.state as { dish: Dish } | null)?.dish ?? null;

  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  if (!dish) {
    navigate('/', { replace: true });
    return null;
  }

  const cartItem = items.find((i) => i.dish.id === dish.id);
  const quantity = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem(dish!);
    showToast(dish!.name);
  }

  function handleIncrease() {
    updateQuantity(dish!.id, quantity + 1);
  }

  function handleDecrease() {
    if (quantity === 1) removeItem(dish!.id);
    else updateQuantity(dish!.id, quantity - 1);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-sm bg-gray-50 relative">

        {/* Hero image with back button */}
        <div className="relative">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-72 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x300/f97316/white?text=🐾';
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
          >
            <FiArrowLeft size={18} className="text-gray-800" />
          </button>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-t-3xl -mt-5 relative z-10 px-5 pt-6 pb-32">
          {/* Name & price */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl font-black text-gray-900 leading-tight flex-1">{dish.name}</h1>
            <span className="text-2xl font-black text-orange-500 flex-shrink-0">
              ₹{paiseToRupees(dish.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{dish.description}</p>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-5" />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100 font-medium">
              🐾 Pet-friendly
            </span>
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 font-medium">
              ✓ Fresh daily
            </span>
            {!dish.isActive && (
              <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100 font-medium">
                Currently unavailable
              </span>
            )}
          </div>

          {/* Kindness note */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🌱</span>
            <div>
              <p className="text-xs font-bold text-orange-700 mb-0.5">5% goes to stray dog rescue</p>
              <p className="text-xs text-orange-600 leading-relaxed">
                ₹{Math.round(paiseToRupees(dish.price) * 0.05)} from this item funds care for stray animals in your city.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-20"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        >
          <div className="max-w-sm mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-black text-gray-900">
                ₹{paiseToRupees(dish.price * Math.max(quantity, 1))}
                {quantity > 1 && (
                  <span className="text-sm font-normal text-gray-400 ml-1">× {quantity}</span>
                )}
              </p>
            </div>

            {quantity === 0 ? (
              <button
                disabled={!dish.isActive}
                onClick={handleAdd}
                className="flex-1 max-w-[200px] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <FiPlus size={16} /> Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-orange-500 rounded-2xl px-4 py-3">
                <button
                  onClick={handleDecrease}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <FiMinus size={14} className="text-white" />
                </button>
                <span className="text-white font-black text-lg min-w-[24px] text-center">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <FiPlus size={14} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
