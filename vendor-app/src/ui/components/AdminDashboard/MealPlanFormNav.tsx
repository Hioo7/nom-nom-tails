import { FiArrowLeft, FiArrowRight, FiCheck, FiSave, FiX } from 'react-icons/fi';
import type { MealPlanFormStep } from '../../../hooks/useMealPlanForm';

interface MealPlanFormNavProps {
  step: MealPlanFormStep;
  canGoNext: boolean;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => Promise<void>;
}

export default function MealPlanFormNav({
  step,
  canGoNext,
  isSubmitting,
  mode,
  onClose,
  onBack,
  onNext,
  onSubmit,
}: MealPlanFormNavProps) {
  const isLastStep = step === 3;
  const isFirstStep = step === 1;

  return (
    <div className="shrink-0 border-t border-base-200 bg-base-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-md min-w-[96px] gap-1.5"
          onClick={isFirstStep ? onClose : onBack}
          disabled={isSubmitting}
        >
          {isFirstStep ? <FiX size={16} /> : <FiArrowLeft size={16} />}
          {isFirstStep ? 'Close' : 'Back'}
        </button>

        {isLastStep ? (
          <button
            type="button"
            className="btn btn-neutral btn-md flex-1 gap-2"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : mode === 'create' ? (
              <>
                <FiCheck size={16} />
                Create Plan
              </>
            ) : (
              <>
                <FiSave size={16} />
                Save Changes
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-neutral btn-md flex-1 gap-2"
            onClick={onNext}
            disabled={!canGoNext}
          >
            Next
            <FiArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
