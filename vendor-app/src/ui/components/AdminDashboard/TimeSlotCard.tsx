import { FiClock } from 'react-icons/fi';
import type { TimeSlot } from '../../../types';
import TimeSlotCardActions from './TimeSlotCardActions';

interface TimeSlotCardProps {
  slot: TimeSlot;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TimeSlotCard({ slot, onEdit, onDelete }: TimeSlotCardProps) {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiClock size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Delivery window
              </p>
              <h3 className="truncate text-base font-semibold text-base-content">
                {slot.startTime} - {slot.endTime}
              </h3>
              <p className="text-sm text-base-content/60">
                {slot.isActive
                  ? 'Customers can place orders in this time slot.'
                  : 'This time slot is hidden until you reactivate it.'}
              </p>
            </div>
          </div>
          <span
            className={`badge badge-sm shrink-0 ${slot.isActive ? 'badge-success' : 'badge-ghost'}`}
          >
            {slot.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="border-t border-base-200 pt-4">
          <TimeSlotCardActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
