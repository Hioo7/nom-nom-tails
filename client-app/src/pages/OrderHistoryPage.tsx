import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiPackage } from 'react-icons/fi';
import { OrderService } from '../services/order.service';
import { useAuth } from '../hooks/useAuth';
import type { Order } from '../types';
import { paiseToRupees } from '../utils/currency';

const orderService = new OrderService();

type FilterKey = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Processing' },
  { key: 'IN_DELIVERY', label: 'On the Way' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'text-amber-600 bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Processing', className: 'text-blue-600 bg-blue-50 border-blue-200' },
  READY_FOR_DELIVERY: { label: 'Ready', className: 'text-purple-600 bg-purple-50 border-purple-200' },
  IN_DELIVERY: { label: 'On the Way', className: 'text-orange-600 bg-orange-50 border-orange-200' },
  DELIVERED: { label: 'Delivered', className: 'text-green-600 bg-green-50 border-green-200' },
  CANCELLED: { label: 'Cancelled', className: 'text-red-500 bg-red-50 border-red-200' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function shortId(id: string) {
  return id.replace('ord', '').toUpperCase().slice(0, 8);
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_STYLE[order.status] ?? { label: order.status, className: 'text-gray-500 bg-gray-50 border-gray-200' };
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-50">
      {/* Top row */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-gray-400">Order No</p>
          <p className="font-bold text-gray-800 text-sm">{shortId(order.id)}</p>
        </div>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-100 my-2.5" />

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-y-1.5 text-sm mb-3">
        <div>
          <span className="text-xs text-gray-400">Items: </span>
          <span className="font-medium text-gray-700">
            {order.items.map((i) => i.dish.name).join(', ')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Qty: </span>
          <span className="font-semibold text-gray-800">{totalQty}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400">Delivery: </span>
          <span className="font-medium text-gray-700">{formatDate(order.deliveryDate)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Total: </span>
          <span className="font-bold text-gray-900">
            {order.settlement?.totalAmount != null ? `₹${paiseToRupees(order.settlement.totalAmount)}` : '—'}
          </span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <button className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors">
          Details
        </button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.className}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const initialFilter = (location.state as { filter?: string })?.filter as FilterKey | undefined;

  const [activeFilter, setActiveFilter] = useState<FilterKey>(
    initialFilter && FILTERS.some((f) => f.key === initialFilter) ? initialFilter : 'ALL',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    orderService
      .listMine(token)
      .then(setOrders)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = orders.filter((o) => {
    const matchesFilter = activeFilter === 'ALL' || o.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      shortId(o.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.dish.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-3 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiSearch size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="max-w-lg mx-auto mb-2">
            <input
              type="text"
              placeholder="Search by order ID or dish name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-lg mx-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiPackage size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-orange-500 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiPackage size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilter !== 'ALL'
                ? 'Try selecting a different filter'
                : 'Place your first order from the Home tab!'}
            </p>
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                className="mt-4 text-orange-500 font-medium text-sm"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
