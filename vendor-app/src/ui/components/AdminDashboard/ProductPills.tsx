export type ProductSection = 'dishes' | 'mealplan';

interface ProductPillsProps {
  activeSection: ProductSection;
  onSectionChange: (section: ProductSection) => void;
}

export default function ProductPills({ activeSection, onSectionChange }: ProductPillsProps) {
  return (
    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-200 px-4 py-3 flex justify-center gap-2">
      <button
        className={`btn btn-sm ${activeSection === 'dishes' ? 'btn-neutral' : 'btn-ghost'}`}
        onClick={() => onSectionChange('dishes')}
      >
        Dishes
      </button>
      <button
        className={`btn btn-sm ${activeSection === 'mealplan' ? 'btn-neutral' : 'btn-ghost'}`}
        onClick={() => onSectionChange('mealplan')}
      >
        Meal Plan
      </button>
    </div>
  );
}
