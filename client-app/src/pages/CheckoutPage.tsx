import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCalendar, FiCheck } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

type Step = 'details' | 'success';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { token } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const deliveryFee = 40;
  const grandTotal = totalPrice + deliveryFee;

  const today = new Date().toISOString().split('T')[0];

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    if (!deliveryDate) {
      setError('Please select a delivery date.');
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const order = await orderService.create(token, {
        items: items.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
        deliveryDate,
        address,
      });
      setOrderId(order.id);
      clearCart();
      setStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FiCheck size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 text-sm mb-1">Your order has been confirmed.</p>
        <p className="text-gray-400 text-xs mb-6">Order ID: <span className="font-mono text-gray-600">{orderId.slice(0, 12)}...</span></p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Order Summary</h3>
        <div className="flex flex-col gap-2">
          {items.map(({ dish, quantity }) => (
            <div key={dish.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {dish.name} × {quantity}
              </span>
              <span className="font-medium text-gray-800">₹{dish.price * quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between text-sm text-gray-500">
            <span>Delivery fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Delivery Details</h3>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FiMapPin size={12} /> Delivery Address
          </label>
          <textarea
            placeholder="Enter your full delivery address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FiCalendar size={12} /> Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            min={today}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
          />
        </div>
      </div>

      {/* Payment Note */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 mb-5 text-sm text-orange-700">
        💳 Payment will be collected at the time of delivery (Cash / UPI)
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-orange-200"
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          `Place Order · ₹${grandTotal}`
        )}
      </button>
    </div>
  );
}
