import { FiClock, FiPlus } from 'react-icons/fi';
import type { TimeSlot } from '../../../types';
import TimeSlotCard from './TimeSlotCard';

interface TimeSlotListProps {
  dayLabel: string;
  slots: TimeSlot[];
  onEdit: (slot: TimeSlot) => void;
  onDelete: (slot: TimeSlot) => void;
  onAddFirst: () => void;
}

export default function TimeSlotList({
  dayLabel,
  slots,
  onEdit,
  onDelete,
  onAddFirst,
}: TimeSlotListProps) {
  if (slots.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center gap-3 py-12 text-center">
          <FiClock size={48} className="text-base-content/20" />
          <div>
            <h3 className="font-semibold text-base-content/70">No time slots for {dayLabel}</h3>
            <p className="mt-1 text-sm text-base-content/50">
              Create a delivery window for this day to start taking scheduled orders.
            </p>
          </div>
          <button type="button" className="btn btn-neutral btn-sm gap-1" onClick={onAddFirst}>
            <FiPlus size={14} />
            Create first slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {slots.map((slot) => (
        <TimeSlotCard
          key={slot.id}
          slot={slot}
          onEdit={() => onEdit(slot)}
          onDelete={() => onDelete(slot)}
        />
      ))}
    </div>
  );
}
