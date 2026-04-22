import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface TimeSlotCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function TimeSlotCardActions({ onEdit, onDelete }: TimeSlotCardActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="btn btn-sm btn-outline flex-1"
        onClick={onEdit}
        title="Edit time slot"
      >
        <FiEdit2 size={14} />
        Edit
      </button>
      <button
        type="button"
        className="btn btn-circle h-10 min-h-0 w-10 shrink-0 border-base-200 bg-base-200 text-base-content/70 shadow-sm hover:bg-base-300"
        onClick={onDelete}
        title="Delete time slot"
        aria-label="Delete time slot"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}
