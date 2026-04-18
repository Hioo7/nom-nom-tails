import { useCallback, useEffect, useRef, useState } from 'react';
import { useDishForm } from '../../../hooks/useDishForm';
import useIngredients from '../../../hooks/useIngredients';
import type { CreateDishPayload, Dish, IngredientOption } from '../../../types';
import CreateIngredientModal from './CreateIngredientModal';
import DishFormNav from './DishFormNav';
import DishFormProgress from './DishFormProgress';
import DishFormStep1 from './DishFormStep1';
import DishFormStep2 from './DishFormStep2';
import DishFormStep3 from './DishFormStep3';

interface CreateEditDishModalProps {
  mode: 'create' | 'edit';
  dish?: Dish;
  onClose: () => void;
  onSaved: (payload: CreateDishPayload, imageFile?: File) => Promise<void>;
}

export default function CreateEditDishModal({
  mode,
  dish,
  onClose,
  onSaved,
}: CreateEditDishModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useDishForm({ dish, onSaved, onClose });
  const { ingredients: availableIngredients, refetch: refetchIngredients } = useIngredients();
  const [showCreateIngredient, setShowCreateIngredient] = useState(false);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleIngredientCreated(newIngredient: IngredientOption) {
    refetchIngredients();
    // Auto-fill the last empty row with the newly created ingredient
    const lastIndex = form.ingredients.length - 1;
    const lastRow = form.ingredients[lastIndex];
    if (!lastRow.ingredientId) {
      form.updateIngredient(lastIndex, { ...lastRow, ingredientId: newIngredient.id });
    } else {
      form.addIngredient();
      // The new row will be empty; auto-fill after state update in next tick
      setTimeout(() => {
        form.updateIngredient(form.ingredients.length, { ingredientId: newIngredient.id, quantity: '' });
      }, 0);
    }
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal" onClose={onClose}>
        <div className="modal-box w-full max-w-lg flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">
              {mode === 'create' ? 'Create Dish' : 'Edit Dish'}
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square"
              onClick={onClose}
              disabled={form.isSubmitting}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <DishFormProgress step={form.step} />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={form.handleImageSelect}
            disabled={form.isSubmitting}
          />

          <div className="overflow-y-auto flex-1 min-h-0 flex flex-col gap-3 pb-1">
            {form.step === 1 && (
              <DishFormStep1
                name={form.name}
                onNameChange={form.setName}
                description={form.description}
                onDescriptionChange={form.setDescription}
                price={form.price}
                onPriceChange={form.setPrice}
                imagePreview={form.imagePreview}
                onImageClick={handleImageClick}
                fieldErrors={form.fieldErrors}
                disabled={form.isSubmitting}
              />
            )}

            {form.step === 2 && (
              <DishFormStep2
                ingredients={form.ingredients}
                availableIngredients={availableIngredients}
                onAdd={form.addIngredient}
                onUpdate={form.updateIngredient}
                onRemove={form.removeIngredient}
                onCreateIngredient={() => setShowCreateIngredient(true)}
                disabled={form.isSubmitting}
              />
            )}

            {form.step === 3 && (
              <DishFormStep3
                name={form.name}
                price={form.price}
                imagePreview={form.imagePreview}
                ingredientCount={form.ingredients.length}
                isActive={form.isActive}
                onIsActiveChange={form.setIsActive}
                errorMessage={form.errorMessage}
                disabled={form.isSubmitting}
              />
            )}
          </div>

          <DishFormNav
            step={form.step}
            canGoNext={form.canGoNext}
            isSubmitting={form.isSubmitting}
            mode={mode}
            onBack={form.goBack}
            onNext={form.goNext}
            onSubmit={form.handleSubmit}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {showCreateIngredient && (
        <CreateIngredientModal
          onClose={() => setShowCreateIngredient(false)}
          onCreated={handleIngredientCreated}
        />
      )}
    </>
  );
}
