import { useState } from 'react';
import DeliveriesPills, { type DeliveriesSection } from './DeliveriesPills';
import DeliveryPartnersSection from './DeliveryPartnersSection';
import TimeSlotsSection from './TimeSlotsSection';

export default function DeliveriesTab() {
  const [activeSection, setActiveSection] = useState<DeliveriesSection>('timeslots');

  return (
    <div className="flex flex-col">
      <DeliveriesPills activeSection={activeSection} onSectionChange={setActiveSection} />
      {activeSection === 'timeslots' ? <TimeSlotsSection /> : <DeliveryPartnersSection />}
    </div>
  );
}
