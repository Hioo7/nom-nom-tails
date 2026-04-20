import { useState } from 'react';
import { useDishActions } from '../../../hooks/useDishActions';
import { useDishes } from '../../../hooks/useDishes';
import type { CreateDishPayload, Dish } from '../../../types';
import CreateEditDishModal from './CreateEditDishModal';
import DeleteDishModal from './DeleteDishModal';
import DishesHeader from './DishesHeader';
import DishGrid from './DishGrid';

type ModalMode = 'create' | 'edit' | 'delete' | null;

export default function DishesTab() {
  const { dishes, isLoading, error, refetch } = useDishes();
  const { createDish, updateDish, deleteDish } = useDishActions(refetch);

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [activeModal, setActiveModal] = useState<ModalMode>(null);

  const openCreate = () => {
    setSelectedDish(null);
    setActiveModal('create');
  };

  const openEdit = (dish: Dish) => {
    setSelectedDish(dish);
    setActiveModal('edit');
  };

  const openDelete = (dish: Dish) => {
    setSelectedDish(dish);
    setActiveModal('delete');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedDish(null);
  };

  const handleSave = async (payload: CreateDishPayload, imageFile?: File): Promise<void> => {
    if (activeModal === 'create') {
      await createDish(payload, imageFile);
    } else if (activeModal === 'edit' && selectedDish) {
      await updateDish(selectedDish.id, payload, imageFile);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <DishesHeader count={dishes.length} onAddDish={openCreate} />

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
        <DishGrid
          dishes={dishes}
          onEdit={openEdit}
          onDelete={openDelete}
          onAddFirst={openCreate}
        />
      )}

      {(activeModal === 'create' || activeModal === 'edit') && (
        <CreateEditDishModal
          mode={activeModal}
          dish={selectedDish ?? undefined}
          onClose={closeModal}
          onSaved={handleSave}
        />
      )}

      {activeModal === 'delete' && selectedDish && (
        <DeleteDishModal
          dish={selectedDish}
          onConfirm={() => deleteDish(selectedDish.id)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
