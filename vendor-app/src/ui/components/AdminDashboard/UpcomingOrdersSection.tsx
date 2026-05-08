import { FiClipboard, FiPackage } from 'react-icons/fi';
import type { AdminUpcomingOrder } from '../../../types';
import UpcomingOrderCard from './UpcomingOrderCard';

interface UpcomingOrdersSectionProps {
  orders: AdminUpcomingOrder[];
  isLoading: boolean;
  error: string;
  actionError: string;
  fulfillingOrderId: string | null;
  approvingOrderId: string | null;
  rejectingOrderId: string | null;
  onRetry: () => void;
  onViewDetails: (orderId: string) => void;
  onOpenProcurement: () => void;
  onFulfill: (orderId: string, handlingNotes?: string) => void;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

function isToday(deliveryDate: string): boolean {
  const d = new Date(deliveryDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function OrderGroup({
  label,
  orders,
  fulfillingOrderId,
  approvingOrderId,
  rejectingOrderId,
  onViewDetails,
  onFulfill,
  onApprove,
  onReject,
}: {
  label: string;
  orders: AdminUpcomingOrder[];
  fulfillingOrderId: string | null;
  approvingOrderId: string | null;
  rejectingOrderId: string | null;
  onViewDetails: (orderId: string) => void;
  onFulfill: (orderId: string, handlingNotes?: string) => void;
  onApprove: (orderId: string) => void;
  onReject: (orderId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-base-content/40">{label}</p>
      {orders.map((order) => (
        <UpcomingOrderCard
          key={order.id}
          order={order}
          isSubmitting={fulfillingOrderId === order.id}
          isApproving={approvingOrderId === order.id}
          isRejecting={rejectingOrderId === order.id}
          onViewDetails={onViewDetails}
          onFulfill={onFulfill}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

export default function UpcomingOrdersSection({
  orders,
  isLoading,
  error,
  actionError,
  fulfillingOrderId,
  approvingOrderId,
  rejectingOrderId,
  onRetry,
  onViewDetails,
  onOpenProcurement,
  onFulfill,
  onApprove,
  onReject,
}: UpcomingOrdersSectionProps) {
  const todayOrders = orders.filter((o) => isToday(o.deliveryDate));
  const upcomingOrders = orders.filter((o) => !isToday(o.deliveryDate));

  const cardProps = {
    fulfillingOrderId,
    approvingOrderId,
    rejectingOrderId,
    onViewDetails,
    onFulfill,
    onApprove,
    onReject,
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-base-content">Upcoming Orders</h2>
          <p className="text-sm text-base-content/60">
            Today's priority orders and the next two days.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-neutral" onClick={onOpenProcurement}>
          <FiPackage size={16} />
          Items to Procure
        </button>
      </div>

      {actionError ? (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <FiClipboard className="text-base-content/20" size={56} />
            <h3 className="font-semibold text-base-content/70">No upcoming orders</h3>
            <p className="text-sm text-base-content/50">
              Orders for today and the next two days will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {todayOrders.length > 0 && (
            <OrderGroup label="Today" orders={todayOrders} {...cardProps} />
          )}
          {upcomingOrders.length > 0 && (
            <OrderGroup label="Next Two Days" orders={upcomingOrders} {...cardProps} />
          )}
        </div>
      )}
    </div>
  );
}
