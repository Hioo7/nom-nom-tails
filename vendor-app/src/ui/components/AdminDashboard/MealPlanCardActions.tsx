import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';

interface MealPlanCardActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MealPlanCardActions({ onView, onEdit, onDelete }: MealPlanCardActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="btn btn-neutral btn-md w-full justify-center gap-2"
        onClick={onView}
        title="View dishes"
      >
        <FiEye size={14} />
        View dishes
      </button>
      <button
        type="button"
        className="btn btn-outline btn-md w-full justify-center gap-2"
        onClick={onEdit}
        title="Edit meal plan"
      >
        <FiEdit2 size={14} />
        Edit
      </button>
      <button
        type="button"
        className="btn btn-outline btn-md w-full justify-center gap-2"
        onClick={onDelete}
        title="Delete meal plan"
      >
        <FiTrash2 size={14} />
        Delete
      </button>
    </div>
  );
}
