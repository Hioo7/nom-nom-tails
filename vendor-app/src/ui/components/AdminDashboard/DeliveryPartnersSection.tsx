import { useMemo } from 'react';
import { FiRefreshCw, FiTruck } from 'react-icons/fi';
import { useDeliveryPartners } from '../../../hooks/useDeliveryPartners';
import DeliveryPartnerCard from './DeliveryPartnerCard';

export default function DeliveryPartnersSection() {
  const { partners, isLoading, error, refetch } = useDeliveryPartners();
  const totals = useMemo(() => ({
    totalPartners: partners.length,
    totalDeliveries: partners.reduce((sum, partner) => sum + partner.orders.length, 0),
    totalAssigned: partners.reduce((sum, partner) => sum + partner.assignedCount, 0),
    totalCompleted: partners.reduce((sum, partner) => sum + partner.completedCount, 0),
  }), [partners]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-base-content">Delivery Partners</h2>
            <span className="badge badge-neutral badge-sm">{totals.totalPartners} today</span>
          </div>
          <p className="text-sm text-base-content/60">
            Monitor today&apos;s delivery workload, partner progress, and active orders.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm sm:self-center"
          onClick={refetch}
          title="Refresh"
          disabled={isLoading}
        >
          <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!isLoading && !error && partners.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Partners
            </p>
            <p className="mt-1 font-semibold text-base-content">{totals.totalPartners}</p>
          </div>
          <div className="rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Deliveries
            </p>
            <p className="mt-1 font-semibold text-base-content">{totals.totalDeliveries}</p>
          </div>
          <div className="rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Assigned
            </p>
            <p className="mt-1 font-semibold text-base-content">{totals.totalAssigned}</p>
          </div>
          <div className="rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
              Completed
            </p>
            <p className="mt-1 font-semibold text-base-content">{totals.totalCompleted}</p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : partners.length === 0 ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body items-center gap-3 py-12 text-center">
            <FiTruck size={52} className="text-base-content/20" />
            <div>
              <h3 className="font-semibold text-base-content/70">No delivery partners yet</h3>
              <p className="mt-1 text-sm text-base-content/50">
                Delivery partners with today&apos;s workload will appear here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {partners.map((partner) => (
            <DeliveryPartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  );
}
