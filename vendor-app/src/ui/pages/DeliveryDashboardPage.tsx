import { useState } from 'react';
import DeliveryBottomNav from '../components/DeliveryDashboard/DeliveryBottomNav';
import DeliveryOrdersTab from '../components/DeliveryDashboard/DeliveryOrdersTab';
import ProfileTab from '../components/shared/ProfileTab';

type Tab = 'orders' | 'profile';

export default function DeliveryDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'orders' ? <DeliveryOrdersTab /> : <ProfileTab />}
      </div>
      <DeliveryBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
