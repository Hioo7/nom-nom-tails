import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface DishCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCardActions({ onEdit, onDelete }: DishCardActionsProps) {
  return (
    <div className="flex items-center gap-2">
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
        className="btn btn-sm btn-ghost flex-1 text-error hover:bg-error/10"
        onClick={onDelete}
        title="Delete dish"
      >
        <FiTrash2 size={14} />
        Delete
      </button>
    </div>
  );
}
