import { FiEdit2, FiMinus, FiPackage, FiPlus } from 'react-icons/fi';
import type { IngredientOption } from '../../../types';
import { formatQuantity } from './orderFormatters';

interface IngredientsSectionProps {
  ingredients: IngredientOption[];
  isLoading: boolean;
  error: string;
  actionError: string;
  activeIngredientId: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (ingredient: IngredientOption) => void;
  onAdd: (ingredient: IngredientOption) => void;
  onRemove: (ingredient: IngredientOption) => void;
}

export default function IngredientsSection({
  ingredients,
  isLoading,
  error,
  actionError,
  activeIngredientId,
  onRetry,
  onCreate,
  onEdit,
  onAdd,
  onRemove,
}: IngredientsSectionProps) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-base-content">Ingredients</h2>
          <p className="text-sm text-base-content/60">
            Manage ingredient stock coming into the system.
          </p>
        </div>

        <button type="button" className="btn btn-neutral btn-sm sm:self-center" onClick={onCreate}>
          <FiPlus size={16} />
          New ingredient
        </button>
      </div>

      {actionError ? (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : ingredients.length === 0 ? (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <FiPackage className="text-base-content/20" size={56} />
            <h3 className="font-semibold text-base-content/70">No ingredients found</h3>
            <p className="text-sm text-base-content/50">
              Ingredients added to the system will appear here for stock management.
            </p>
            <button type="button" className="btn btn-neutral btn-sm mt-2" onClick={onCreate}>
              <FiPlus size={16} />
              Create ingredient
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-box border border-base-200 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Available</th>
                  <th>Unit</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ingredient.name}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square"
                          onClick={() => onEdit(ingredient)}
                          aria-label={`Edit ${ingredient.name}`}
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{formatQuantity(ingredient.availableQty, ingredient.unit)}</td>
                    <td>{ingredient.unit}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => onRemove(ingredient)}
                          disabled={activeIngredientId === ingredient.id}
                        >
                          <FiMinus size={16} />
                          Remove
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-neutral"
                          onClick={() => onAdd(ingredient)}
                          disabled={activeIngredientId === ingredient.id}
                        >
                          <FiPlus size={16} />
                          Add
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="card bg-base-100 shadow-sm border border-base-200"
                >
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-base-content">{ingredient.name}</h3>
                        <p className="text-sm text-base-content/60">
                          Available: {formatQuantity(ingredient.availableQty, ingredient.unit)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => onEdit(ingredient)}
                        aria-label={`Edit ${ingredient.name}`}
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline flex-1"
                      onClick={() => onRemove(ingredient)}
                      disabled={activeIngredientId === ingredient.id}
                    >
                      <FiMinus size={16} />
                      Remove
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-neutral flex-1"
                      onClick={() => onAdd(ingredient)}
                      disabled={activeIngredientId === ingredient.id}
                    >
                      <FiPlus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
