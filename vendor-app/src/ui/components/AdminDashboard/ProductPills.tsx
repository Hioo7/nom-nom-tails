export type ProductSection = 'dishes' | 'mealplan';

interface ProductPillsProps {
  activeSection: ProductSection;
  onSectionChange: (section: ProductSection) => void;
}

export default function ProductPills({ activeSection, onSectionChange }: ProductPillsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="overflow-x-auto px-4 py-3">
        <div className="mx-auto flex w-fit min-w-max justify-center gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'dishes'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('dishes')}
          >
            Dishes
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'mealplan'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('mealplan')}
          >
            Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
}
