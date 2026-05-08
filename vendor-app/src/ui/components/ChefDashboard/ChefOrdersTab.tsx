import { useChefOrderActions } from '../../../hooks/useChefOrderActions';
import { useChefOrders } from '../../../hooks/useChefOrders';
import ChefOrdersSection from './ChefOrdersSection';

export default function ChefOrdersTab() {
  const { orders, isLoading, error, refetch } = useChefOrders();
  const { fulfillOrder } = useChefOrderActions({ onOrderChanged: refetch });

  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={refetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-base-content">Today's Orders</h2>
        <p className="text-sm text-base-content/50">
          {orders.length === 0
            ? 'No orders for today'
            : `${orders.length} order${orders.length !== 1 ? 's' : ''} to prepare`}
        </p>
      </div>
      <ChefOrdersSection orders={orders} onFulfill={fulfillOrder} />
    </div>
  );
}
