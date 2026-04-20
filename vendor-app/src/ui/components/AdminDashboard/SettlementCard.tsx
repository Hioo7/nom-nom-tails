import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { PendingSettlementOrder, SettlementStatus } from '../../../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTimeSlotLabel,
} from './orderFormatters';

const STATUS_BADGE: Record<SettlementStatus, string> = {
  UNSETTLED: 'badge-error',
  PARTIAL: 'badge-warning',
  SETTLED: 'badge-success',
};

const STATUS_LABEL: Record<SettlementStatus, string> = {
  UNSETTLED: 'Unsettled',
  PARTIAL: 'Partially Paid',
  SETTLED: 'Settled',
};

interface SettlementCardProps {
  settlement: PendingSettlementOrder;
  onRecordPayment: (settlement: PendingSettlementOrder) => void;
}

export default function SettlementCard({
  settlement,
  onRecordPayment,
}: SettlementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <button
        className="w-full text-left p-4 hover:bg-base-200/40 transition-colors"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-mono text-xs text-base-content/50">#{settlement.orderNumber}</p>
                <h3 className="font-bold text-sm text-base-content truncate">
                  {settlement.customerName}
                </h3>
              </div>
              <span className={`badge badge-sm ${STATUS_BADGE[settlement.status]}`}>
                {STATUS_LABEL[settlement.status]}
              </span>
            </div>

            <p className="text-sm text-base-content/70 truncate mt-1">
              {settlement.customerEmail}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge badge-sm badge-outline">
                {formatDate(settlement.deliveryDate)}
              </span>
              <span className="badge badge-sm badge-primary">
                {formatTimeSlotLabel(settlement.timeSlot)}
              </span>
              <span className="badge badge-sm badge-success">
                Paid {formatCurrency(settlement.paidAmount)}
              </span>
              <span className="badge badge-sm badge-warning">
                Due {formatCurrency(settlement.balanceAmount)}
              </span>
            </div>
          </div>

          <span className="text-base-content/40 shrink-0 mt-1">
            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </span>
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-base-200 px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-xs text-base-content/50">Total</p>
              <p className="font-semibold">{formatCurrency(settlement.totalAmount)}</p>
            </div>
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-xs text-base-content/50">Paid</p>
              <p className="font-semibold">{formatCurrency(settlement.paidAmount)}</p>
            </div>
            <div className="rounded-box bg-base-200 px-3 py-2">
              <p className="text-xs text-base-content/50">Balance</p>
              <p className="font-semibold">{formatCurrency(settlement.balanceAmount)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h4 className="font-semibold text-sm text-base-content">Payment Logs</h4>
            <button
              type="button"
              className="btn btn-sm btn-neutral"
              onClick={() => onRecordPayment(settlement)}
            >
              Record Payment
            </button>
          </div>

          {settlement.payments.length === 0 ? (
            <div className="rounded-box border border-dashed border-base-300 px-4 py-6 text-sm text-base-content/50 text-center">
              No payments recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {settlement.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-box border border-base-200 px-3 py-3 bg-base-50"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-base-content/50">
                        {payment.method} • {formatDateTime(payment.paidAt)}
                      </p>
                    </div>
                  </div>
                  {payment.note ? (
                    <p className="text-sm text-base-content/70 mt-2">{payment.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
