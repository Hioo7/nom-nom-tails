import type { CampaignFormStep } from '../../../hooks/useCampaignForm';

interface CampaignFormNavProps {
  step: CampaignFormStep;
  canGoNext: boolean;
  isSubmitting: boolean;
  isPreparingImage: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onBack: () => void;
  onNext: () => Promise<void>;
  onSubmit: () => Promise<void>;
}

export default function CampaignFormNav({
  step,
  canGoNext,
  isSubmitting,
  isPreparingImage,
  mode,
  onClose,
  onBack,
  onNext,
  onSubmit,
}: CampaignFormNavProps) {
  const isBusy = isSubmitting || isPreparingImage;

  return (
    <div className="flex gap-2">
      {step === 1 ? (
        <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isBusy}>
          Cancel
        </button>
      ) : (
        <button type="button" className="btn btn-ghost flex-1" onClick={onBack} disabled={isBusy}>
          Back
        </button>
      )}

      {step < 4 ? (
        <button
          type="button"
          className="btn btn-neutral flex-[1.4]"
          onClick={() => {
            void onNext();
          }}
          disabled={!canGoNext || isBusy}
        >
          {isPreparingImage ? <span className="loading loading-spinner loading-xs" /> : 'Next'}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-neutral flex-[1.4]"
          onClick={() => {
            void onSubmit();
          }}
          disabled={isBusy}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : mode === 'create' ? (
            'Create campaign'
          ) : (
            'Save changes'
          )}
        </button>
      )}
    </div>
  );
}

