import type { DishFormStep } from '../../../hooks/useDishForm';

const STEP_LABELS: [string, string, string] = ['Basics', 'Ingredients', 'Review'];

interface DishFormProgressProps {
  step: DishFormStep;
}

export default function DishFormProgress({ step }: DishFormProgressProps) {
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
