import type { IngredientOption } from '../../../types';
import IngredientEditorModal from './IngredientEditorModal';

interface EditIngredientModalProps {
  ingredient: IngredientOption;
  onClose: () => void;
  onSaved: (ingredient: IngredientOption) => void;
}

export default function EditIngredientModal({
  ingredient,
  onClose,
  onSaved,
}: EditIngredientModalProps) {
  return (
    <IngredientEditorModal
      mode="edit"
      ingredient={ingredient}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
