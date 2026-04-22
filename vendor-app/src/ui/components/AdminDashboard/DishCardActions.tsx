import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface DishCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCardActions({ onEdit, onDelete }: DishCardActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="btn btn-sm btn-outline flex-1"
        onClick={onEdit}
        title="Edit dish"
      >
        <FiEdit2 size={14} />
        Edit
      </button>
      <button
        type="button"
        className="btn btn-circle h-10 min-h-0 w-10 shrink-0 border-base-200 bg-base-200 text-base-content/70 shadow-sm hover:bg-base-300"
        onClick={onDelete}
        title="Delete dish"
        aria-label="Delete dish"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}
