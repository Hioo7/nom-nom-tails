import { useState } from 'react';
import { useMealPlanActions } from '../../../hooks/useMealPlanActions';
import { useMealPlans } from '../../../hooks/useMealPlans';
import type { CreateMealPlanPayload, MealPlan } from '../../../types';
import CreateEditMealPlanModal from './CreateEditMealPlanModal';
import DeleteMealPlanModal from './DeleteMealPlanModal';
import MealPlanDishesModal from './MealPlanDishesModal';
import MealPlanGrid from './MealPlanGrid';
import MealPlanHeader from './MealPlanHeader';

type ModalMode = 'create' | 'edit' | 'delete' | 'view' | null;

export default function MealPlanTab() {
  const { mealPlans, isLoading, error, refetch } = useMealPlans();
  const { createMealPlan, updateMealPlan, deleteMealPlan } = useMealPlanActions(refetch);

  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [activeModal, setActiveModal] = useState<ModalMode>(null);

  const openCreate = () => {
    setSelectedPlan(null);
    setActiveModal('create');
  };

  const openView = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setActiveModal('view');
  };

  const openEdit = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setActiveModal('edit');
  };

  const openDelete = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setActiveModal('delete');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPlan(null);
  };

  const handleSave = async (
    payload: CreateMealPlanPayload,
    imageFile?: File,
  ): Promise<void> => {
    if (activeModal === 'create') {
      await createMealPlan(payload, imageFile);
    } else if (activeModal === 'edit' && selectedPlan) {
      await updateMealPlan(selectedPlan.id, payload, imageFile);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <MealPlanHeader count={mealPlans.length} onAddMealPlan={openCreate} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : (
        <MealPlanGrid
          mealPlans={mealPlans}
          onView={openView}
          onEdit={openEdit}
          onDelete={openDelete}
          onAddFirst={openCreate}
        />
      )}

      {(activeModal === 'create' || activeModal === 'edit') && (
        <CreateEditMealPlanModal
          mode={activeModal}
          mealPlan={selectedPlan ?? undefined}
          onClose={closeModal}
          onSaved={handleSave}
        />
      )}

      {activeModal === 'view' && selectedPlan && (
        <MealPlanDishesModal
          mealPlan={selectedPlan}
          onClose={closeModal}
        />
      )}

      {activeModal === 'delete' && selectedPlan && (
        <DeleteMealPlanModal
          mealPlan={selectedPlan}
          onConfirm={() => deleteMealPlan(selectedPlan.id)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
