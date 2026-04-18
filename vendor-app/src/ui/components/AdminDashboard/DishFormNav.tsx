import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import type { DishFormStep } from '../../../hooks/useDishForm';

interface DishFormNavProps {
  step: DishFormStep;
  canGoNext: boolean;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => Promise<void>;
}

export default function DishFormNav({
  step,
  canGoNext,
  isSubmitting,
  mode,
  onBack,
  onNext,
  onSubmit,
}: DishFormNavProps) {
  const isLastStep = step === 3;

  return (
    <div className="flex justify-between items-center pt-3 mt-2 border-t border-base-200">
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-1.5"
        onClick={onBack}
        disabled={step === 1 || isSubmitting}
      >
        <FiArrowLeft size={14} />
        Back
      </button>

      {isLastStep ? (
        <button
          type="button"
          className="btn btn-neutral btn-sm gap-1.5"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : mode === 'create' ? (
            <>
              <FiCheck size={14} />
              Create Dish
            </>
          ) : (
            <>
              <FiSave size={14} />
              Save Changes
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-neutral btn-sm gap-1.5"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Next
          <FiArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
