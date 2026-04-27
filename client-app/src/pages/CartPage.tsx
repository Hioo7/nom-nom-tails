import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { paiseToRupees } from '../utils/currency';

export function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Add some delicious meals for your furry friend!
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const deliveryFee = 40;
  const grandTotal = paiseToRupees(totalPrice) + deliveryFee;

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-gray-400 text-sm mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 mb-5">
        {items.map(({ dish, quantity }) => (
          <div key={dish.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/64x64/f97316/white?text=🐾';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{dish.name}</h3>
              <p className="text-orange-500 font-bold text-sm mt-0.5">₹{paiseToRupees(dish.price * quantity)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                <button
                  onClick={() => updateQuantity(dish.id, quantity - 1)}
                  className="text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <FiMinus size={13} />
                </button>
                <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  className="text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <FiPlus size={13} />
                </button>
              </div>
              <button
                onClick={() => removeItem(dish.id)}
                className="text-red-400 hover:text-red-500 transition-colors p-1"
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Bill Summary</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{paiseToRupees(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-base shadow-lg shadow-orange-200"
      >
        <FiShoppingBag size={18} />
        Proceed to Checkout · ₹{grandTotal}
      </button>
    </div>
  );
}
