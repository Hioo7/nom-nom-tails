import { useState, type KeyboardEvent } from 'react';
import { FiChevronDown, FiChevronUp, FiMessageCircle, FiPhone } from 'react-icons/fi';
import type { PendingSettlementOrder, SettlementStatus } from '../../../types';
import { formatCurrency, formatDate, formatDateTime } from './orderFormatters';
import {
  hasSettlementPhoneNumber,
  openSettlementDialer,
  openSettlementWhatsApp,
} from './settlementContactActions';

const STATUS_BADGE: Record<SettlementStatus, string> = {
  UNSETTLED: 'border-base-300 bg-base-100 text-base-content/70',
  PARTIAL: 'border-base-300 bg-base-200 text-base-content/80',
  SETTLED: 'border-base-300 bg-base-100 text-base-content/70',
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
  const hasPhoneNumber = hasSettlementPhoneNumber(settlement.customerPhone);
  const paymentCountLabel = `${settlement.payments.length} payment${
    settlement.payments.length === 1 ? '' : 's'
  }`;

  function toggleExpanded(): void {
    setIsExpanded((current) => !current);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  }

  return (
    <div className="card overflow-hidden rounded-[1.5rem] border border-base-200 bg-base-100 shadow-sm">
      <div
        className="w-full p-3.5 text-left transition-colors hover:bg-base-200/20"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggleExpanded}
        onKeyDown={handleCardKeyDown}
      >
        <div className="flex items-start gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.18em] text-base-content/45">
                  #{settlement.orderNumber}
                </p>
                <h3 className="mt-0.5 truncate text-[0.95rem] font-semibold text-base-content">
                  {settlement.customerName}
                </h3>
                <p className="mt-0.5 truncate text-[13px] leading-tight text-base-content/60">
                  {settlement.customerEmail}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className={`badge badge-sm border px-2.5 py-2.5 ${STATUS_BADGE[settlement.status]}`}>
                  {STATUS_LABEL[settlement.status]}
                </span>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-base-200 bg-base-100 text-base-content/45"
                  aria-label={isExpanded ? 'Collapse settlement details' : 'Expand settlement details'}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded();
                  }}
                >
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-base-content/45">
                  Total
                </p>
                <p className="mt-0.5 font-semibold text-base-content">
                  {formatCurrency(settlement.totalAmount)}
                </p>
              </div>
              <div className="h-5 w-px bg-base-200" />
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-base-content/45">
                  Due
                </p>
                <p className="mt-0.5 font-semibold text-base-content">
                  {formatCurrency(settlement.balanceAmount)}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="btn btn-circle h-9 min-h-0 w-9 border-base-200 bg-base-100 text-base-content/70 shadow-sm hover:bg-base-200 disabled:border-base-200 disabled:bg-base-100 disabled:text-base-content/25"
                  aria-label="Call customer"
                  disabled={!hasPhoneNumber}
                  onClick={(event) => {
                    event.stopPropagation();
                    openSettlementDialer(settlement.customerPhone);
                  }}
                >
                  <FiPhone size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn-circle h-9 min-h-0 w-9 border-base-200 bg-base-100 text-base-content/70 shadow-sm hover:bg-base-200 disabled:border-base-200 disabled:bg-base-100 disabled:text-base-content/25"
                  aria-label="Message customer on WhatsApp"
                  disabled={!hasPhoneNumber}
                  onClick={(event) => {
                    event.stopPropagation();
                    openSettlementWhatsApp(settlement.customerPhone);
                  }}
                >
                  <FiMessageCircle size={16} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-base-content/55">
              <span>{formatDate(settlement.deliveryDate)}</span>
              <span>{paymentCountLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div className="flex flex-col gap-3 border-t border-base-200/80 px-3.5 pb-3.5 pt-2.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-base-content">Payment records</h4>
              <p className="mt-1 text-xs text-base-content/55">
                Review recorded payments or add a new settlement entry.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-neutral w-full sm:w-auto"
              onClick={() => onRecordPayment(settlement)}
            >
              Record Payment
            </button>
          </div>

          {settlement.payments.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-base-300 px-4 py-6 text-center text-sm text-base-content/50">
              No payments recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {settlement.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-[1.25rem] border border-base-200 bg-base-100 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-base-content">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-1 text-xs text-base-content/55">
                        {payment.method} • {formatDateTime(payment.paidAt)}
                      </p>
                    </div>
                  </div>
                  {payment.note ? (
                    <p className="mt-2 text-sm text-base-content/70">{payment.note}</p>
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
