import { FiPlus } from 'react-icons/fi';

interface DishesHeaderProps {
  count: number;
  onAddDish: () => void;
}

export default function DishesHeader({ count, onAddDish }: DishesHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-base-content">Dishes</h2>
          <span className="badge badge-neutral badge-sm">{count} total</span>
        </div>
        <p className="text-sm text-base-content/60">
          Curate individual dishes with clearer storefront status and quick actions.
        </p>
      </div>
      <button type="button" className="btn btn-sm btn-neutral sm:self-center" onClick={onAddDish}>
        <FiPlus size={16} />
        New dish
      </button>
    </div>
  );
}
