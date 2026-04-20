import type { DishFormStep } from '../../../hooks/useDishForm';

const STEP_LABELS: [string, string, string] = ['Basics', 'Ingredients', 'Review'];

interface DishFormProgressProps {
  step: DishFormStep;
}

export default function DishFormProgress({ step }: DishFormProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
            Step {step} of {STEP_LABELS.length}
          </p>
          <p className="text-sm font-semibold text-base-content">{STEP_LABELS[step - 1]}</p>
        </div>
        <span className="badge badge-neutral badge-sm">{Math.round((step / STEP_LABELS.length) * 100)}%</span>
      </div>

      <div className="flex gap-2">
        {STEP_LABELS.map((label, index) => {
          const isActive = index + 1 === step;
          const isComplete = index + 1 < step;

          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col gap-2">
              <div
                className={`h-2 rounded-full ${
                  isActive || isComplete ? 'bg-primary' : 'bg-base-300'
                }`}
              />
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive || isComplete
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-200 text-base-content/50'
                  }`}
                >
                  {index + 1}
                </span>
                <span className={`truncate text-xs ${isActive ? 'text-base-content' : 'text-base-content/50'}`}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
