import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { DishCard } from '../components/ui/DishCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { DishService } from '../services/dish.service';
import { useAuth } from '../hooks/useAuth';
import type { Dish } from '../types';

const dishService = new DishService();

export function HomePage() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    dishService
      .list()
      .then((data) => setDishes(data.filter((d) => d.isActive)))
      .catch(() => setError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <p className="text-gray-400 text-sm">Delivering to 📍 Your location</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
          {user ? `Hey ${user.name.split(' ')[0]} 👋` : 'Fresh meals for your pet 🐾'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">What would your furry friend like today?</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search dishes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm outline-none focus:border-orange-300 transition-colors"
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner fullPage />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-orange-500 font-medium"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🐶</p>
          <p className="text-gray-500">No dishes found for "{query}"</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{filtered.length} items available</p>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
