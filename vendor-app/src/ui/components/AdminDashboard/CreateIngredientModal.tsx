import type { IngredientOption } from '../../../types';
import IngredientEditorModal from './IngredientEditorModal';

interface CreateIngredientModalProps {
  onClose: () => void;
  onCreated: (ingredient: IngredientOption) => void;
}

export default function CreateIngredientModal({ onClose, onCreated }: CreateIngredientModalProps) {
  return (
    <IngredientEditorModal mode="create" onClose={onClose} onSaved={onCreated} />
  );
}
