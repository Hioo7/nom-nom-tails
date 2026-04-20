import type { AdminOrderDish } from '../../../types';

interface OrderDishCardProps {
  dish: AdminOrderDish;
}

export default function OrderDishCard({ dish }: OrderDishCardProps) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
      <figure className="h-28 bg-base-200">
        {dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-base-content/20">
            🍲
          </div>
        )}
      </figure>
      <div className="card-body p-3 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-base-content leading-tight">{dish.name}</h4>
          <span className="badge badge-sm badge-primary shrink-0">
            Qty {dish.quantity}
          </span>
        </div>
        <p className="text-xs text-base-content/60 leading-5 max-h-16 overflow-hidden">
          {dish.description || 'No description available.'}
        </p>
      </div>
    </div>
  );
}
