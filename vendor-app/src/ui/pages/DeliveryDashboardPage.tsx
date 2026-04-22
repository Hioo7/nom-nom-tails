import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DeliveryBottomNav from '../components/DeliveryDashboard/DeliveryBottomNav';
import DeliveryOrdersTab from '../components/DeliveryDashboard/DeliveryOrdersTab';
import {
  createDeliveryDashboardSearchParams,
  parseDeliveryDashboardTab,
  parseDeliveryOrdersSection,
} from '../components/DeliveryDashboard/deliveryNavigation';
import ProfileTab from '../components/shared/ProfileTab';

export default function DeliveryDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseDeliveryDashboardTab(searchParams.get('tab'));
  const activeSection = parseDeliveryOrdersSection(searchParams.get('section'));
  const refreshToken = searchParams.get('refresh') ?? '';

  const updateDashboardState = useCallback(
    (tab: 'orders' | 'profile', section: 'available' | 'tasks', nextRefreshToken?: string) => {
      setSearchParams(createDeliveryDashboardSearchParams(tab, section, nextRefreshToken), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'orders' ? (
          <DeliveryOrdersTab
            activeSection={activeSection}
            refreshToken={refreshToken}
            onSectionChange={(section) => updateDashboardState('orders', section)}
            onRefreshHandled={() => updateDashboardState(activeTab, activeSection)}
          />
        ) : (
          <ProfileTab />
        )}
      </div>
      <DeliveryBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => updateDashboardState(tab, activeSection)}
      />
    </div>
  );
}
