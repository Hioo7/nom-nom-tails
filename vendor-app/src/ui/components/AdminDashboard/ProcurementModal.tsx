import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { OrderService } from '../../../services/order.service';
import type { ProcurementSummary } from '../../../types';
import {
  formatQuantity,
  getErrorMessage,
} from './orderFormatters';

const orderService = new OrderService();

interface ProcurementModalProps {
  onClose: () => void;
}

export default function ProcurementModal({ onClose }: ProcurementModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { token } = useAuth();
  const [summary, setSummary] = useState<ProcurementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    orderService
      .getUpcomingProcurement(token)
      .then((data) => setSummary(data))
      .catch((requestError) => {
        setError(getErrorMessage(requestError, 'Failed to load procurement items.'));
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-4xl flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-base-200">
          <div>
            <h3 className="font-bold text-base text-base-content">Items to Procure</h3>
            {summary ? (
              <p className="text-sm text-base-content/60 mt-1">
                Based on {summary.orderCount} upcoming order
                {summary.orderCount !== 1 ? 's' : ''} not yet fulfilled.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-dots loading-lg text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : summary && summary.items.length > 0 ? (
            <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Required</th>
                    <th>Available</th>
                    <th>To Procure</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.items.map((item) => (
                    <tr key={item.ingredientId}>
                      <td className="font-medium">{item.ingredientName}</td>
                      <td>{formatQuantity(item.requiredQty, item.unit)}</td>
                      <td>{formatQuantity(item.availableQty, item.unit)}</td>
                      <td className={item.procurementQty > 0 ? 'font-semibold text-error' : 'text-success'}>
                        {formatQuantity(item.procurementQty, item.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/50">
              No procurement is needed for the current upcoming orders.
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-4 pt-3 border-t border-base-200">
          <button className="btn btn-neutral w-full" onClick={onClose}>
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
