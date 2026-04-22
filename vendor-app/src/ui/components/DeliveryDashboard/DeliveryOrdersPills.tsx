import type { DeliveryOrdersSection } from './deliveryNavigation';

interface DeliveryOrdersPillsProps {
  activeSection: DeliveryOrdersSection;
  onSectionChange: (section: DeliveryOrdersSection) => void;
}

export default function DeliveryOrdersPills({
  activeSection,
  onSectionChange,
}: DeliveryOrdersPillsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="overflow-x-auto px-4 py-3">
        <div className="mx-auto flex w-fit min-w-max justify-center gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'available'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('available')}
          >
            Available
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'tasks'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('tasks')}
          >
            My Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
