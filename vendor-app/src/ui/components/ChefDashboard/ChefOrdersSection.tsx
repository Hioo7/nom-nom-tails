import { FiClipboard } from 'react-icons/fi';
import type { ChefOrder } from '../../../types';
import ChefOrderCard from './ChefOrderCard';

interface ChefOrdersSectionProps {
  orders: ChefOrder[];
  onFulfill: (orderId: string, handlingNotes?: string) => Promise<void>;
}

function isDelayed(endTime: string): boolean {
  const [h, m] = endTime.split(':').map(Number);
  const slotEnd = new Date();
  slotEnd.setHours(h, m, 0, 0);
  return new Date() > slotEnd;
}

function sortOrders(orders: ChefOrder[]): ChefOrder[] {
  return [...orders].sort((a, b) => {
    const aDelayed = isDelayed(a.timeSlot.endTime) ? 0 : 1;
    const bDelayed = isDelayed(b.timeSlot.endTime) ? 0 : 1;
    if (aDelayed !== bDelayed) return aDelayed - bDelayed;
    return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
  });
}

export default function ChefOrdersSection({ orders, onFulfill }: ChefOrdersSectionProps) {
  if (orders.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center py-12 text-center">
          <FiClipboard className="text-base-content/20" size={56} />
          <h3 className="font-semibold text-base-content/70">No orders to prepare</h3>
          <p className="text-sm text-base-content/50">
            Confirmed orders for today will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sortOrders(orders).map((order) => (
        <ChefOrderCard key={order.id} order={order} onFulfill={onFulfill} />
      ))}
    </div>
  );
}
