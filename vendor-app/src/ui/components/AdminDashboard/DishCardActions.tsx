import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface DishCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCardActions({ onEdit, onDelete }: DishCardActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-base-200">
      <button
        className="btn btn-ghost btn-xs btn-square"
        onClick={onEdit}
        title="Edit dish"
      >
        <FiEdit2 size={14} />
      </button>
      <div className="w-px h-4 bg-base-300 mx-0.5" />
      <button
        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
        onClick={onDelete}
        title="Delete dish"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );
}
