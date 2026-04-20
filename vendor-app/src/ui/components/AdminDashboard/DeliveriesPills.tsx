export type DeliveriesSection = 'timeslots' | 'partners';

interface DeliveriesPillsProps {
  activeSection: DeliveriesSection;
  onSectionChange: (section: DeliveriesSection) => void;
}

export default function DeliveriesPills({
  activeSection,
  onSectionChange,
}: DeliveriesPillsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="overflow-x-auto px-4 py-3">
        <div className="mx-auto flex w-fit min-w-max justify-center gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'timeslots'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('timeslots')}
          >
            Time Slots
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-full px-4 ${
              activeSection === 'partners'
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onSectionChange('partners')}
          >
            Partners
          </button>
        </div>
      </div>
    </div>
  );
}
