export type OrdersSection = 'upcoming' | 'settlements' | 'ingredients';

interface OrdersPillsProps {
  activeSection: OrdersSection;
  onSectionChange: (section: OrdersSection) => void;
}

export default function OrdersPills({
  activeSection,
  onSectionChange,
}: OrdersPillsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="overflow-x-auto px-4 py-3">
        <div className="mx-auto flex w-fit min-w-max justify-center gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'upcoming'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('upcoming')}
          >
            Upcoming Orders
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'settlements'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('settlements')}
          >
            Settlements
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'ingredients'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('ingredients')}
          >
            Ingredients
          </button>
        </div>
      </div>
    </div>
  );
}
