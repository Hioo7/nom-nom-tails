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
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
        <div className="modal-box w-full sm:max-w-2xl flex flex-col max-h-[92dvh] p-0 gap-0 overflow-hidden">
          <div className="shrink-0 border-b border-base-200 px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-base-content">
                  {mode === 'create' ? 'Create Dish' : 'Edit Dish'}
                </h3>
                <p className="text-sm text-base-content/60">
                  Build a dish in three simple steps with a mobile-friendly workflow.
                </p>
              </div>
              <span className="badge badge-neutral badge-sm shrink-0">
                {mode === 'create' ? 'New' : 'Editing'}
              </span>
            </div>
          </div>

          <div className="shrink-0 px-4 pt-4 pb-3">
            <DishFormProgress step={form.step} />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={form.handleImageSelect}
            disabled={form.isSubmitting}
          />

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            <div className="rounded-box border border-base-200 bg-base-100 p-4 sm:p-5">
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
          </div>

          <DishFormNav
            step={form.step}
            canGoNext={form.canGoNext}
            isSubmitting={form.isSubmitting}
            mode={mode}
            onClose={onClose}
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
