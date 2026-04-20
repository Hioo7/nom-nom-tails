import type { MealPlanFormStep } from '../../../hooks/useMealPlanForm';

const STEP_LABELS: [string, string, string] = ['Basics', 'Dishes', 'Review'];

interface MealPlanFormProgressProps {
  step: MealPlanFormStep;
}

export default function MealPlanFormProgress({ step }: MealPlanFormProgressProps) {
  return (
    <ul className="steps steps-horizontal w-full text-xs my-2">
      {STEP_LABELS.map((label, i) => (
        <li key={label} className={`step${i + 1 <= step ? ' step-primary' : ''}`}>
          {label}
        </li>
      ))}
    </ul>
  );
}
