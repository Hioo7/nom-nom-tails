import { useEffect, useRef } from 'react';
import type { ChefOrder } from '../../../types';
import OrderDishCard from '../AdminDashboard/OrderDishCard';
import { formatDate, formatTimeSlotLabel } from '../AdminDashboard/orderFormatters';

interface ChefOrderDetailsModalProps {
  order: ChefOrder;
  onClose: () => void;
}

export default function ChefOrderDetailsModal({ order, onClose }: ChefOrderDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-2xl flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-base-content">Order Details</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="badge badge-sm badge-outline">#{order.orderNumber}</span>
                <span className="badge badge-sm badge-primary">{formatDate(order.deliveryDate)}</span>
                <span className="badge badge-sm badge-ghost">{formatTimeSlotLabel(order.timeSlot)}</span>
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="mt-3 text-sm text-base-content/70">
            <p className="font-medium">{order.customerName}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {order.dishes.length > 0 ? (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
              {order.dishes.map((dish) => (
                <OrderDishCard key={dish.id} dish={dish} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/50">
              No dishes were found for this order.
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-base-200">
          <button type="button" className="btn btn-neutral w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
