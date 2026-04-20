import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface TimeSlotCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function TimeSlotCardActions({ onEdit, onDelete }: TimeSlotCardActionsProps) {
  return (
    <div className="flex items-center gap-2">
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
        className="btn btn-sm btn-ghost flex-1 text-error hover:bg-error/10"
        onClick={onDelete}
        title="Delete time slot"
      >
        <FiTrash2 size={14} />
        Delete
      </button>
    </div>
  );
}
