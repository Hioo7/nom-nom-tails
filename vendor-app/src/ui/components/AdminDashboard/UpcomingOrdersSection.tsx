import { useCallback, useEffect, useState } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClipboard, FiPackage, FiZap } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import { OrderService } from '../../../services/order.service';
import type { AdminUpcomingOrder } from '../../../types';
import UpcomingOrderCard from './UpcomingOrderCard';

const orderService = new OrderService();

type ViewMode = 'upcoming' | 'month';

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

function toMonthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
  const { token } = useAuth();
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [calMonth, setCalMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [monthOrders, setMonthOrders] = useState<AdminUpcomingOrder[]>([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState('');

  const fetchMonth = useCallback(
    (year: number, month: number) => {
      if (!token) return;
      setMonthLoading(true);
      setMonthError('');
      orderService
        .listByMonth(token, toMonthParam(year, month))
        .then(setMonthOrders)
        .catch(() => setMonthError('Failed to load orders for this month.'))
        .finally(() => setMonthLoading(false));
    },
    [token],
  );

  useEffect(() => {
    if (viewMode === 'month') fetchMonth(calMonth.year, calMonth.month);
  }, [viewMode, calMonth, fetchMonth]);

  const prevMonth = () =>
    setCalMonth((d) => ({
      year: d.month === 0 ? d.year - 1 : d.year,
      month: d.month === 0 ? 11 : d.month - 1,
    }));

  const nextMonth = () =>
    setCalMonth((d) => ({
      year: d.month === 11 ? d.year + 1 : d.year,
      month: d.month === 11 ? 0 : d.month + 1,
    }));

  const isCurrentMonth =
    calMonth.year === now.getFullYear() && calMonth.month === now.getMonth();

  const monthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Group month orders by date label
  const monthGroups: { label: string; orders: AdminUpcomingOrder[] }[] = [];
  if (viewMode === 'month') {
    const dateMap = new Map<string, AdminUpcomingOrder[]>();
    for (const o of monthOrders) {
      const d = new Date(o.deliveryDate);
      const key = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
      const arr = dateMap.get(key) ?? [];
      arr.push(o);
      dateMap.set(key, arr);
    }
    dateMap.forEach((grpOrders, label) => monthGroups.push({ label, orders: grpOrders }));
  }

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
            {viewMode === 'upcoming'
              ? "Today's priority orders and the next two days."
              : `All orders for ${monthLabel}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="join">
            <button
              type="button"
              className={`join-item btn btn-sm ${viewMode === 'upcoming' ? 'btn-neutral' : 'btn-ghost border border-base-200'}`}
              onClick={() => setViewMode('upcoming')}
            >
              <FiZap size={14} />
              Next 2 Days
            </button>
            <button
              type="button"
              className={`join-item btn btn-sm ${viewMode === 'month' ? 'btn-neutral' : 'btn-ghost border border-base-200'}`}
              onClick={() => setViewMode('month')}
            >
              <FiCalendar size={14} />
              Monthly
            </button>
          </div>

          <button type="button" className="btn btn-sm btn-neutral" onClick={onOpenProcurement}>
            <FiPackage size={16} />
            Items to Procure
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      ) : null}

      {/* ── Upcoming (next 2 days) view ── */}
      {viewMode === 'upcoming' && (
        isLoading ? (
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
        )
      )}

      {/* ── Monthly view ── */}
      {viewMode === 'month' && (
        <div className="flex flex-col gap-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between rounded-box border border-base-200 bg-base-100 px-4 py-2 shadow-sm">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={prevMonth}
              disabled={isCurrentMonth}
            >
              <FiChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold">{monthLabel}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={nextMonth}
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          {monthLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-dots loading-lg text-primary" />
            </div>
          ) : monthError ? (
            <div className="alert alert-error">
              <span>{monthError}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => fetchMonth(calMonth.year, calMonth.month)}>
                Retry
              </button>
            </div>
          ) : monthGroups.length === 0 ? (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body items-center text-center py-12">
                <FiClipboard className="text-base-content/20" size={56} />
                <h3 className="font-semibold text-base-content/70">No orders this month</h3>
                <p className="text-sm text-base-content/50">
                  No active orders found for {monthLabel}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {monthGroups.map(({ label, orders: grpOrders }) => (
                <OrderGroup key={label} label={label} orders={grpOrders} {...cardProps} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
