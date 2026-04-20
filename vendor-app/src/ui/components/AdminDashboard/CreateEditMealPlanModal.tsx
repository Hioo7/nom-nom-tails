import { useCallback, useEffect, useRef, useState } from 'react';
import { useMealPlanForm } from '../../../hooks/useMealPlanForm';
import { useDishes } from '../../../hooks/useDishes';
import { useDishActions } from '../../../hooks/useDishActions';
import type { CreateDishPayload, CreateMealPlanPayload, MealPlan } from '../../../types';
import CreateEditDishModal from './CreateEditDishModal';
import MealPlanFormNav from './MealPlanFormNav';
import MealPlanFormProgress from './MealPlanFormProgress';
import MealPlanFormStep1 from './MealPlanFormStep1';
import MealPlanFormStep2 from './MealPlanFormStep2';
import MealPlanFormStep3 from './MealPlanFormStep3';

interface CreateEditMealPlanModalProps {
  mode: 'create' | 'edit';
  mealPlan?: MealPlan;
  onClose: () => void;
  onSaved: (payload: CreateMealPlanPayload, imageFile?: File) => Promise<void>;
}

export default function CreateEditMealPlanModal({
  mode,
  mealPlan,
  onClose,
  onSaved,
}: CreateEditMealPlanModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useMealPlanForm({ mealPlan, onSaved, onClose });
  const { dishes, refetch: refetchDishes } = useDishes();
  const { createDish } = useDishActions(refetchDishes);
  const [showCreateDish, setShowCreateDish] = useState(false);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleNewDishSaved = async (
    payload: CreateDishPayload,
    imageFile?: File,
  ): Promise<void> => {
    await createDish(payload, imageFile);
    // After refetch, the new dish will appear in the list; we don't auto-select
    // because we don't have its id yet — user selects it from the list
  };

  const selectedDishes = dishes.filter((d) => form.selectedDishIds.includes(d.id));

  return (
    <>
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
        <div className="modal-box w-full sm:max-w-lg flex flex-col max-h-[92dvh]">
          {/* Header */}
          <div>
            <h3 className="font-bold text-base">
              {mode === 'create' ? 'Create Meal Plan' : 'Edit Meal Plan'}
            </h3>
          </div>

          <MealPlanFormProgress step={form.step} />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={form.handleImageSelect}
            disabled={form.isSubmitting}
          />

          <div className="overflow-y-auto flex-1 min-h-0 flex flex-col gap-3 pb-2">
            {form.step === 1 && (
              <MealPlanFormStep1
                name={form.name}
                onNameChange={form.setName}
                description={form.description}
                onDescriptionChange={form.setDescription}
                price={form.price}
                onPriceChange={form.setPrice}
                imagePreview={form.imagePreview}
                onImageClick={handleImageClick}
                isActive={form.isActive}
                onIsActiveChange={form.setIsActive}
                fieldErrors={form.fieldErrors}
                disabled={form.isSubmitting}
              />
            )}

            {form.step === 2 && (
              <MealPlanFormStep2
                dishes={dishes}
                selectedDishIds={form.selectedDishIds}
                onToggleDish={form.toggleDish}
                onCreateNewDish={() => setShowCreateDish(true)}
                disabled={form.isSubmitting}
              />
            )}

            {form.step === 3 && (
              <MealPlanFormStep3
                name={form.name}
                price={form.price}
                description={form.description}
                imagePreview={form.imagePreview}
                isActive={form.isActive}
                selectedDishes={selectedDishes}
                errorMessage={form.errorMessage}
              />
            )}
          </div>

          <MealPlanFormNav
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

      {showCreateDish && (
        <CreateEditDishModal
          mode="create"
          onClose={() => setShowCreateDish(false)}
          onSaved={handleNewDishSaved}
        />
      )}
    </>
  );
}
