import type { CampaignFormStep } from '../../../hooks/useCampaignForm';

interface CampaignFormProgressProps {
  step: CampaignFormStep;
}

const stepLabels: Record<CampaignFormStep, string> = {
  1: 'Basics',
  2: 'Schedule',
  3: 'Banner',
  4: 'Review',
};

const orderedSteps: CampaignFormStep[] = [1, 2, 3, 4];

export default function CampaignFormProgress({ step }: CampaignFormProgressProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {orderedSteps.map((numericStep) => {
        const isActive = numericStep === step;
        const isDone = numericStep < step;

        return (
          <div key={numericStep} className="flex flex-col gap-1">
            <div
              className={`h-2 rounded-full ${
                isActive || isDone ? 'bg-primary' : 'bg-base-300'
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                isActive ? 'text-primary' : 'text-base-content/50'
              }`}
            >
              {stepLabels[numericStep]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

